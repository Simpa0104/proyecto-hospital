const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

// 1. Cargar variables de entorno PRIMERO
dotenv.config({ path: path.join(__dirname, '../env/.env') });

// 2. Crear instancia de Express
const app = express();

// 3. Configuración básica del servidor
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../app/views'));

// 4. Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// 5. Configuración de seguridad adicional
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});

// 6. Configurar CSRF Protection antes de las rutas
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Middleware para pasar CSRF token a todas las vistas
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// 7. Importar y usar rutas
const mainRouter = require('../app/routes/rutas');
app.use('/', mainRouter);

module.exports = app;
