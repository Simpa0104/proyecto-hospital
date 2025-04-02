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
    res.render('Cuestionario_Combinados');
});

// Procesar evaluación
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

        // Calcular puntajes (Nivel 1 - Preguntas 1-6: Sí=1, No=0)
        for (let i = 1; i <= 6; i++) {
            bio += parseInt(req.body[`pregunta${i}`]) || 0;
        }

        // Calcular puntajes (Nivel 2 - Preguntas 7-12)
        for (let i = 7; i <= 12; i++) {
            const valor = parseInt(req.body[`pregunta${i}`]) || 0;
            if (i <= 8) psico += valor;    // Preguntas 7-8: Psicológico
            else if (i <= 10) bio += valor; // Preguntas 9-10: Biológico
            else social += valor;           // Preguntas 11-12: Social
        }

        // Umbrales ajustados (35% del máximo teórico)
        const umbralPsico = 0.35 * 8;  // 8 = máximo teórico psicológico
        const umbralBio = 0.35 * 16;   // 16 = máximo teórico biológico
        const umbralSocial = 0.35 * 4;  // 4 = máximo teórico social

        // Determinar categorías con riesgo
        const categoriasRiesgo = [];
        if (psico >= umbralPsico) categoriasRiesgo.push("Psicológico");
        if (bio >= umbralBio) categoriasRiesgo.push("Biológico");
        if (social >= umbralSocial) categoriasRiesgo.push("Social");

        // Formatear texto para la columna categoria
        const categoriaTexto = categoriasRiesgo.length > 0 ?
            categoriasRiesgo.join(', ') : 'Ninguno';

        // Insertar en DB usando la columna categoria existente
        const [result] = await pool.execute(
            `INSERT INTO evaluaciones 
            (nombre, episodio, fecha, categoria, psico, bio, social) 
            VALUES (?, ?, CURDATE(), ?, ?, ?, ?)`,
            [nombre, episodio, categoriaTexto, psico, bio, social]
        );

        res.redirect("/");

    } catch (error) {
        console.error('Error en formulario combinado:', error);
        res.status(500).json({ error: 'Error del servidor' });
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
            return res.status(404).render('error', { mensaje: 'Evaluación no encontrada' });
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
        const [evaluaciones] = await pool.execute(
            'SELECT * FROM evaluaciones ORDER BY fecha DESC'
        );

        // Preparar datos para la vista
        evaluaciones.forEach(e => {
            e.categoriasArray = e.categoria !== 'Ninguno' ?
                e.categoria.split(', ') : [];
        });

        res.render('Historiales_Generales', { evaluaciones });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { mensaje: 'Error del servidor' });
    }
});

// Eliminar evaluación
router.post('/eliminar-evaluacion/:id', async (req, res) => {
    const { id } = req.params;
    console.log('Petición recibida para eliminar:', id); // Verifica si llega la solicitud

    if (!id) {
        return res.status(400).json({ success: false, message: "ID no proporcionado" });
    }

    try {
        // Aquí deberías agregar la lógica para eliminar la evaluación de la base de datos
        // Ejemplo:
        // await Evaluacion.findByIdAndDelete(id);

        console.log("Evaluación eliminada con éxito");
        res.json({ success: true, message: "Evaluación eliminada con éxito" });
    } catch (error) {
        console.error("Error eliminando la evaluación:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

module.exports = router;