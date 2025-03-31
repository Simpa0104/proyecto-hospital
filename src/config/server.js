const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

// 1. Cargar variables de entorno PRIMERO
dotenv.config({ path: path.join(__dirname, '../env/.env') });

// 2. Crear instancia de Express
const app = express();

// 3. Configuración básica del servidor
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../app/views'));

// 4. Middlewares esenciales (sin CSRF)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// 5. Configuración de seguridad básica (sin CSRF)
app.disable('x-powered-by');
app.use((req, res, next) => {
    // Headers de seguridad básicos (opcionales pero recomendados)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// 6. Importar y usar rutas
const mainRouter = require('../app/routes/rutas');
app.use('/', mainRouter);

// 7. Middleware para manejo de errores (recomendado)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Error interno del servidor');
});

module.exports = app;