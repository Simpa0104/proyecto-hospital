const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const { body, validationResult } = require('express-validator');


// Ruta principal
router.get('/', (req, res) => {
    res.render('Inicio');
});

// Mostrar formulario
router.get('/Cuestionario_Riesgos', (req, res) => {
    res.render('Cuestionario_Combinados', {
        csrfToken: req.csrfToken()
    });
});

// Procesar evaluación
// Procesar evaluación
router.post('/Cuestionario_Niveles', [
    body('nombre')
        .notEmpty().withMessage('El nombre es requerido')
        .matches(/^[a-zA-Z\s]+$/).withMessage('El nombre solo debe contener letras y espacios'),
    body('episodio')
        .isInt({ min: 1 }).withMessage('Episodio debe ser un número válido')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { nombre, episodio } = req.body;
        let psico = 0, bio = 0, social = 0;

        // Verificar que todas las preguntas del 1 al 12 estén respondidas
        for (let i = 1; i <= 12; i++) {
            if (typeof req.body[`pregunta${i}`] === 'undefined') {
                return res.status(400).json({ error: `Pregunta ${i} no fue respondida.` });
            }
        }

        // Sumar respuestas del Nivel 1 (preguntas 1 a 6) → biológico
        for (let i = 1; i <= 6; i++) {
            bio += parseInt(req.body[`pregunta${i}`]) || 0;
        }

        // Sumar respuestas del Nivel 2 (preguntas 7 a 12) → distribuido en psico, bio y social
        for (let i = 7; i <= 12; i++) {
            const valor = parseInt(req.body[`pregunta${i}`]) || 0;
            if (i <= 8) psico += valor;
            else if (i <= 10) bio += valor;
            else social += valor;
        }

        // Umbrales de riesgo
        const umbralPsico = 0.35 * 8;
        const umbralBio = 0.35 * 16;
        const umbralSocial = 0.35 * 4;

        // Determinar categorías con riesgo
        const categoriasRiesgo = [];
        if (psico >= umbralPsico) categoriasRiesgo.push("Psicológico");
        if (bio >= umbralBio) categoriasRiesgo.push("Biológico");
        if (social >= umbralSocial) categoriasRiesgo.push("Social");

        const categoriaTexto = categoriasRiesgo.length > 0 ? categoriasRiesgo.join(', ') : 'Ninguno';

        // Guardar en la base de datos
        const [result] = await pool.execute(
            `INSERT INTO evaluaciones 
             (nombre, episodio, fecha, categoria, psico, bio, social) 
             VALUES (?, ?, CURDATE(), ?, ?, ?, ?)`,
            [nombre, episodio, categoriaTexto, psico, bio, social]
        );

        // Enviar respuesta exitosa
        res.json({
            success: true,
            nextUrl: `/Detalles_Evaluacion/${result.insertId}`
        });
        return;

    } catch (error) {
        console.error('Error en formulario combinado:', error);
        res.status(500).json({ error: 'Error del servidor' });
        return;
    }
});

// Mostrar detalles
router.get('/Detalles_Evaluacion/:id', async (req, res) => {
    try {
        const [evaluacion] = await pool.execute(
            'SELECT * FROM evaluaciones WHERE id = ?',
            [req.params.id]
        );

        if (evaluacion.length === 0) {
            return res.status(404).render('error', {
                mensaje: 'Evaluación no encontrada',
                error: {}
            });
        }

        // Convertir el texto de categoría a array
        const categoriasArray = evaluacion[0].categoria !== 'Ninguno' ?
            evaluacion[0].categoria.split(', ') : [];

        res.render('Detalles_Evaluacion', {
            evaluacion: evaluacion[0],
            categoriasArray
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { mensaje: 'Error del servidor' });
    }
});

// Mostrar historial
router.get('/Historial', async (req, res) => {
    try {
        const { nombre, episodio, categoria } = req.query;

        let query = 'SELECT * FROM evaluaciones';
        let conditions = [];
        let params = [];

        if (nombre) {
            conditions.push('nombre LIKE ?');
            params.push(`%${nombre}%`);
        }

        if (episodio) {
            conditions.push('episodio LIKE ?');
            params.push(`%${episodio}%`);
        }

        if (categoria && categoria !== 'todas') {
            conditions.push('categoria LIKE ?');
            params.push(`%${categoria}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY fecha DESC';

        const [evaluaciones] = await pool.execute(query, params);

        // Preparar datos para la vista
        evaluaciones.forEach(e => {
            e.categoriasArray = e.categoria !== 'Ninguno' ?
                e.categoria.split(', ') : [];
        });

        res.render('Historiales_Generales', {
            evaluaciones,
            filtros: { nombre, episodio, categoria },
            csrfToken: req.csrfToken()
        });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { mensaje: 'Error del servidor' });
    }
});

// Eliminar evaluación
router.post('/eliminar-evaluacion/:id', async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM evaluaciones WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Evaluación no encontrada",
                error: {}
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error eliminando:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
});

module.exports = router;