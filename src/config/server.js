const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');

// 1. Configuración inicial y variables de entorno
dotenv.config({ path: path.join(__dirname, '../env/.env') });

// 2. Creación de la aplicación Express
const app = express();

// 3. Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'cdn.jsdelivr.net', 'kit.fontawesome.com'],
      styleSrc: ["'self'", 'cdn.jsdelivr.net', "'unsafe-inline'"],
      fontSrc: ["'self'", 'cdn.jsdelivr.net', 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:']
    }
  }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));

// 4. Configuración del motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../app/views'));

// 5. Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para limpiar headers de contenido
app.use((req, res, next) => {
  res.removeHeader('Content-Type');
  res.removeHeader('Accept');
  next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0'
}));

// 6. Rutas principales
const mainRouter = require('../app/routes/rutas');
app.use('/', mainRouter);

// 7. Manejo de errores
// Error 404
app.use((req, res, next) => {
  res.status(404).render('error', { 
    mensaje: 'Página no encontrada',
    error: { status: 404 }
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  const status = err.status || 500;
  
  if (req.accepts('html')) {
    res.status(status).render('error', { 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  } else {
    res.status(status).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : ''
    });
  }
});

module.exports = app;