const express = require('express');
const router = express.Router();
const connection = require("../../config/db");
const { body, validationResult } = require('express-validator');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Helper para ejecutar consultas SQL seguras (para queries simples)
const executeQuery = (sql, values = []) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (err, results) => {
            err ? reject(err) : resolve(results);
        });
    });
};

// Determinar categoría de riesgo basado en respuestas del primer cuestionario
const determinarCategoriaRiesgo = (respuestas) => {
    const psico = ['pregunta1', 'pregunta2', 'pregunta6'].some(p => respuestas[p] === "1");
    const bio = ['pregunta3', 'pregunta4', 'pregunta5'].some(p => respuestas[p] === "1");

    if (psico && bio) return "Psicológico/Biológico/Social";
    if (psico) return "Psicológico/Social";
    return bio ? "Biológico/Social" : "Sin riesgo";
};

// Helper para eliminar registros de forma segura
const handleDelete = (allowedTable) => async (req, res) => {
    try {
        if (!['test_1', 'test_2'].includes(allowedTable)) {
            throw new Error('Operación no permitida');
        }
        // Determinar la columna primaria según la tabla
        const primaryKey = allowedTable === 'test_1' ? 'idtest1' : 'idtest2';
        await executeQuery(
            `DELETE FROM ?? WHERE ?? = ?`,
            [allowedTable, primaryKey, req.params.id]
        );
        res.redirect('/Historial');
    } catch (err) {
        console.error(`Error eliminando de ${allowedTable}:`, err);
        res.status(500).render('error', {
            mensaje: 'Error al completar la operación'
        });
    }
};

// ----------------------------------------------------------
// Definición de Rutas
// ----------------------------------------------------------

// Vista: Cuestionario de Riesgos
router.get('/Cuestionario_Riesgos', csrfProtection, (req, res) => {
    console.log('✅ Ruta /Cuestionario_Riesgos accedida');
    res.render('Cuestionario_Riesgos1', { csrfToken: req.csrfToken() });
});

// Vista: Cuestionario de Niveles
router.get('/Cuestionario_Niveles', csrfProtection, (req, res) => {
    res.render('Cuestionario_Niveles2', {
        pacienteId: req.query.paciente,
        csrfToken: req.csrfToken()
    });
});

// Vista: Historial General
router.get('/Historial', csrfProtection, async (req, res) => {
    try {
        const [resultados] = await executeQuery(`
      SELECT t1.*, 
      GROUP_CONCAT(CONCAT_WS('|', 
          t2.nivel_psicologico, 
          t2.nivel_biologico, 
          t2.nivel_social
      )) AS detalles
      FROM test_1 t1
      LEFT JOIN test_2 t2 ON t1.idtest1 = t2.idtest1
      GROUP BY t1.idtest1
    `);

        const test1 = resultados.map(r => ({
            ...r,
            detalles: r.detalles ? r.detalles.split(',').map(d => {
                const [psico, bio, social] = d.split('|');
                return { psico, bio, social };
            }) : []
        }));

        res.render('Historiales_Generales', { test1, csrfToken: req.csrfToken() });
    } catch (err) {
        console.error("Error cargando historial:", err);
        res.status(500).render('error', {
            mensaje: "Error al cargar el historial"
        });
    }
});

// Eliminaciones (usando POST para evitar conflictos con formularios)
router.post('/deleteHistorial1/:id', csrfProtection, handleDelete('test_1'));
router.post('/deleteHistorial2/:id', csrfProtection, handleDelete('test_2'));

// Procesar Formulario 1
router.post(
    '/formulario1',
    [
        body('nombre')
            .trim()
            .matches(/^[A-Za-záéíóúñÑ\s]{3,50}$/)
            .withMessage('Nombre inválido (3-50 caracteres alfabéticos)'),
        body('episodio')
            .isInt({ min: 1, max: 999999 })
            .withMessage('Episodio inválido (1-999999)')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array().map(e => e.msg)
                });
            }

            const conn = await connection.getConnection();
            try {
                await conn.beginTransaction();

                const preguntasData = Object.fromEntries(
                    Object.entries(req.body)
                        .filter(([key]) => key.startsWith('pregunta'))
                        .map(([key, val]) => [key, val === "1" ? 1 : 0])
                );

                const testData = {
                    nombre: req.body.nombre.trim(),
                    episodio: parseInt(req.body.episodio),
                    ...preguntasData,
                    categoria_riesgo: determinarCategoriaRiesgo(req.body)
                };

                const [result] = await conn.query('INSERT INTO test_1 SET ?', testData);

                await conn.commit();
                conn.release();

                // Retornar JSON para que el cliente pueda redirigir
                res.json({
                    success: true,
                    test2Url: `/Cuestionario_Niveles?paciente=${result.insertId}`
                });
            } catch (err) {
                await conn.rollback();
                conn.release();
                throw err;
            }
        } catch (err) {
            console.error("Error procesando formulario 1:", err);
            res.status(500).json({
                success: false,
                error: "Error interno del servidor"
            });
        }
    }
);

// Procesar Formulario 2
router.post('/formulario2', csrfProtection, async (req, res) => {
    try {
        if (!req.body.paciente || isNaN(req.body.paciente)) {
            throw new Error('ID de paciente inválido');
        }

        const testData = {
            idtest1: parseInt(req.body.paciente),
            pregunta7: parseInt(req.body.pregunta7),
            pregunta8: parseInt(req.body.pregunta8),
            pregunta9: parseInt(req.body.pregunta9),
            pregunta10: parseInt(req.body.pregunta10),
            pregunta11: parseInt(req.body.pregunta11),
            pregunta12: parseInt(req.body.pregunta12)
        };

        // Asignar niveles de riesgo (lógica a ajustar según necesidad)
        testData.nivel_psicologico = 'medio';
        testData.nivel_biologico = 'medio';
        testData.nivel_social = 'medio';

        await executeQuery('INSERT INTO test_2 SET ?', testData);

        res.json({ success: true, redirectUrl: '/Historial' });
    } catch (err) {
        console.error("Error procesando formulario 2:", err);
        res.status(500).json({ success: false, error: "Error al procesar la evaluación detallada" });
    }
});

module.exports = router;