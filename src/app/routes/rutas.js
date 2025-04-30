const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Evaluacion = require('../../models/evaluacion');

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

        for (let i = 1; i <= 12; i++) {
            if (typeof req.body[`pregunta${i}`] === 'undefined') {
                return res.status(400).json({ error: `Pregunta ${i} no fue respondida.` });
            }
        }

        for (let i = 1; i <= 6; i++) {
            bio += parseInt(req.body[`pregunta${i}`]) || 0;
        }

        for (let i = 7; i <= 12; i++) {
            const valor = parseInt(req.body[`pregunta${i}`]) || 0;
            if (i <= 8) psico += valor;
            else if (i <= 10) bio += valor;
            else social += valor;
        }

        const umbralPsico = 0.35 * 8;
        const umbralBio = 0.35 * 16;
        const umbralSocial = 0.35 * 4;

        const categoriasRiesgo = [];
        if (psico >= umbralPsico) categoriasRiesgo.push("Psicológico");
        if (bio >= umbralBio) categoriasRiesgo.push("Biológico");
        if (social >= umbralSocial) categoriasRiesgo.push("Social");

        const categoriaTexto = categoriasRiesgo.length > 0 ? categoriasRiesgo.join(', ') : 'Ninguno';

        const nueva = await Evaluacion.create({
            nombre,
            episodio,
            fecha: new Date(),
            categoria: categoriaTexto,
            psico,
            bio,
            social
        });

        res.json({
            success: true,
            nextUrl: `/Detalles_Evaluacion/${nueva.id}`
        });

    } catch (error) {
        console.error('Error en formulario combinado:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Mostrar detalles
router.get('/Detalles_Evaluacion/:id', async (req, res) => {
    try {
        const evaluacion = await Evaluacion.findByPk(req.params.id);

        if (!evaluacion) {
            return res.status(404).render('error', {
                mensaje: 'Evaluación no encontrada',
                error: {}
            });
        }

        const categoriasArray = evaluacion.categoria !== 'Ninguno'
            ? evaluacion.categoria.split(', ')
            : [];

        res.render('Detalles_Evaluacion', {
            evaluacion,
            categoriasArray
        });

    } catch (error) {
        console.error(error);
        res.status(500).render('error', { mensaje: 'Error del servidor' });
    }
});

// Historial con paginación y filtros
router.get('/Historial', async (req, res) => {
    try {
        const { nombre, episodio, categoria, pagina = 1 } = req.query;
        const porPagina = 10;
        const offset = (pagina - 1) * porPagina;

        let where = {};
        if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
        if (episodio) where.episodio = { [Op.like]: `%${episodio}%` };
        if (categoria && categoria !== 'todas') {
            where.categoria = { [Op.like]: `%${categoria}%` };
        }

        const { count, rows } = await Evaluacion.findAndCountAll({
            where,
            order: [['fecha', 'DESC']],
            limit: porPagina,
            offset
        });

        const totalPaginas = Math.ceil(count / porPagina);
        rows.forEach(e => {
            e.categoriasArray = e.categoria !== 'Ninguno'
                ? e.categoria.split(', ')
                : [];
        });

        res.render('Historiales_Generales', {
            evaluaciones: rows,
            filtros: { nombre, episodio, categoria },
            paginacion: {
                paginaActual: parseInt(pagina),
                totalPaginas,
                tieneAnterior: pagina > 1,
                tieneSiguiente: pagina < totalPaginas
            },
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
        const eliminado = await Evaluacion.destroy({
            where: { id: req.params.id }
        });

        if (!eliminado) {
            return res.status(404).json({
                success: false,
                message: "Evaluación no encontrada"
            });
        }

        res.json({ success: true });

    } catch (error) {
        console.error("Error eliminando:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
});

module.exports = router;