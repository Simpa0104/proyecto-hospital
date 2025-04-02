const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const { body, validationResult } = require('express-validator');

// Ruta principal - Inicio
router.get('/', (req, res) => {
    res.render('Inicio');
});

// Mostrar formulario de evaluación
router.get('/Cuestionario_Riesgos', (req, res) => {
    res.render('Cuestionario_Combinados');
});

router.post('/Cuestionario_Niveles', [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('episodio').isInt({ min: 1 }).withMessage('Episodio debe ser un número válido')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { nombre, episodio } = req.body;
        let psico = 0, bio = 0, social = 0;

        // Calcular puntuaciones para preguntas 1-6 (Nivel 1 - Sí/No)
        // Cada "Sí" (1) suma 1 punto a biológico (son todas preguntas biológicas)
        for (let i = 1; i <= 6; i++) {
            bio += parseInt(req.body[`pregunta${i}`]) || 0;
        }

        // Calcular puntuaciones para preguntas 7-12 (Nivel 2)
        for (let i = 7; i <= 12; i++) {
            const valor = parseInt(req.body[`pregunta${i}`]) || 0;
            if (i <= 8) psico += valor;       // Preguntas 7-8: Psicológico
            else if (i <= 10) bio += valor;    // Preguntas 9-10: Biológico
            else social += valor;              // Preguntas 11-12: Social
        }

        // Determinar categoría principal
        const categoria = psico > bio ? 
                        (psico > social ? 'Psicológico' : 'Social') : 
                        (bio > social ? 'Biológico' : 'Social');

        // Determinar nivel de riesgo
        const total = psico + bio + social;
        const nivel_riesgo = total >= 8 ? 'Alto' : total >= 4 ? 'Medio' : 'Bajo';

        // Insertar en evaluaciones
        const [result] = await pool.execute(
            `INSERT INTO evaluaciones 
            (nombre, episodio, fecha, categoria, psico, bio, social) 
            VALUES (?, ?, CURDATE(), ?, ?, ?, ?)`,
            [nombre, episodio, categoria, psico, bio, social]
        );

        res.redirect("/");

    } catch (error) {
        console.error('Error en formulario combinado:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Mostrar detalles de evaluación
router.get('/Detalles_Evaluacion/:id', async (req, res) => {
    try {
        const [evaluacion] = await pool.execute(
            'SELECT * FROM evaluaciones WHERE id = ?',
            [req.params.id]
        );

        if (evaluacion.length === 0) {
            return res.status(404).render('error', { mensaje: 'Evaluación no encontrada' });
        }

        const total = evaluacion[0].psico + evaluacion[0].bio + evaluacion[0].social;
        evaluacion[0].nivel_riesgo = total >= 8 ? 'Alto' : total >= 4 ? 'Medio' : 'Bajo';

        res.render('Detalles_Evaluacion', { evaluacion: evaluacion[0] });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { mensaje: 'Error del servidor' });
    }
});

// Mostrar historial
router.get('/Historial', async (req, res) => {
    try {
        const [evaluaciones] = await pool.execute(
            'SELECT * FROM evaluaciones ORDER BY fecha DESC'
        );

        evaluaciones.forEach(e => {
            const total = e.psico + e.bio + e.social;
            e.nivel_riesgo = total >= 8 ? 'Alto' : total >= 4 ? 'Medio' : 'Bajo';
        });

        res.render('Historiales_Generales', { evaluaciones });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { mensaje: 'Error del servidor' });
    }
});

// Eliminar evaluación (nueva ruta)
router.post('/eliminar-evaluacion/:id', async (req, res) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM evaluaciones WHERE id = ?',
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: 'Evaluación no encontrada' });
        }

        res.json({ success: true });
        
    } catch (error) {
        console.error('Error al eliminar evaluación:', error);
        res.status(500).json({ success: false, error: 'Error del servidor' });
    }
});

module.exports = router;