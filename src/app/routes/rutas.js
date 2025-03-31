const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../../config/database');

// Validación para Formulario 1
const validateForm1 = [
    body('nombre').trim().isLength({ min: 3, max: 50 }),
    body('episodio').isInt({ min: 1, max: 999999 }),
    ...Array(6).fill().map((_, i) => body(`pregunta${i+1}`).isIn(['0', '1']))
];

// Validación para Formulario 2
const validateForm2 = [
    ...Array(6).fill().map((_, i) => body(`pregunta${i+7}`).isIn(['0', '1', '2']))
];

// Cuestionario Nivel 1
router.get('/Cuestionario_Riesgos', (req, res) => {
    res.render('Cuestionario_Riesgos1', { 
        title: 'Evaluación de Riesgo - Nivel 1' 
    });
});

// Procesar Nivel 1
router.post('/formulario1', validateForm1, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const [result] = await db.execute(
            'INSERT INTO evaluaciones (nombre, episodio, respuestas_nivel1, fecha) VALUES (?, ?, ?, NOW())',
            [req.body.nombre, req.body.episodio, JSON.stringify(Object.values(req.body).slice(2))]
        );
        
        res.json({ 
            success: true, 
            nextUrl: `/Cuestionario_Niveles2/${result.insertId}`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cuestionario Nivel 2
router.get('/Cuestionario_Niveles2/:id', async (req, res) => {
    res.render('Cuestionario_Niveles2', {
        title: 'Evaluación de Riesgo - Nivel 2',
        evaluacionId: req.params.id
    });
});

// Procesar Nivel 2
router.post('/formulario2/:id', validateForm2, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        await db.execute(
            'UPDATE evaluaciones SET respuestas_nivel2 = ? WHERE id = ?',
            [JSON.stringify(Object.values(req.body).slice(0, 6)), req.params.id]
        );
        
        res.json({ 
            success: true,
            nextUrl: '/Historial'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// En la ruta del historial (/Historial), cambia esto:
router.get('/Historial', async (req, res) => {
    try {
        const [evaluaciones] = await db.execute(`
            SELECT 
                id, 
                nombre, 
                episodio, 
                IFNULL(categoria, 'Sin categoría') as categoria,
                nivel_riesgo,
                IFNULL(psico, 0) as psico,
                IFNULL(bio, 0) as bio,
                IFNULL(social, 0) as social,
                DATE_FORMAT(fecha, '%Y-%m-%d') as fecha
            FROM evaluaciones
            ORDER BY fecha DESC
        `);

        res.render('Historiales_Generales', { 
            test1: evaluaciones,
            title: 'Historial de Evaluaciones'
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.render('Historiales_Generales', { 
            test1: [],
            title: 'Historial de Evaluaciones'
        });
    }
});

// Ruta para eliminar evaluación
router.post('/eliminar-evaluacion/:id', async (req, res) => {
    try {
        // Primero eliminamos de test2 si existe (si usas esta tabla)
        await db.execute('DELETE FROM test2 WHERE test1_id = ?', [req.params.id]);
        
        // Luego eliminamos de evaluaciones (o test1)
        await db.execute('DELETE FROM evaluaciones WHERE id = ?', [req.params.id]);
        
        res.redirect('/Historial');
    } catch (error) {
        console.error('Error al eliminar evaluación:', error);
        res.status(500).redirect('/Historial?error=eliminacion');
    }
});

module.exports = router;