const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const Tokens = require('csrf');
const rutas = require('../app/routes/rutas');
const tokens = new Tokens();
const crypto = require('crypto');

// 1. Configuración inicial y variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

// 2. Creación de la aplicación Express
const app = express();

// Middleware para generar un nonce único por request
app.use((req, res, next) => {
  const nonce = Buffer.from(crypto.randomBytes(16)).toString('base64');
  res.locals.nonce = nonce; // Disponible en las vistas EJS como <%= nonce %>
  next();
});

// 3. Middlewares de seguridad
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "cdn.jsdelivr.net",
          "kit.fontawesome.com",
          (req, res) => `'nonce-${res.locals.nonce}'`
        ],
        styleSrc: [
          "'self'",
          "cdn.jsdelivr.net",
          "fonts.googleapis.com",
          "cdnjs.cloudflare.com",
          "fonts.googleapis.com",
          (req, res) => `'nonce-${res.locals.nonce}'`
        ],
        fontSrc: [
          "'self'",
          "ka-f.fontawesome.com",
          "fonts.gstatic.com",
          "cdnjs.cloudflare.com"
        ],
        connectSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "https:",
          "data:"
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"]
      }
    }
  })
);

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// 4. Middlewares esenciales
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || 'C4br0n0001'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0'
}));

// 5. Middleware CSRF
app.use((req, res, next) => {
  const secret = req.signedCookies._csrfSecret || tokens.secretSync();
  const token = tokens.create(secret);
  res.cookie('_csrfSecret', secret, {
    signed: true,
    sameSite: 'Strict',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false,
    sameSite: 'Strict',
    secure: process.env.NODE_ENV === 'production'
  });
  req.csrfToken = () => token;
  next();
});

app.use((req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const secret = req.signedCookies._csrfSecret;
    const token = req.body._csrf || req.headers['x-xsrf-token'];
    if (!tokens.verify(secret, token)) {
      return res.status(403).send('Token CSRF inválido o ausente');

    }
  }
  next();
});

// 6. Configuración del motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../app/views'));

// 7. Middleware para limpiar headers de contenido
app.use((req, res, next) => {
  res.removeHeader('Content-Type');
  res.removeHeader('Accept');
  next();
});

// 8. Rutas principales
app.use('/', rutas);

// 9. Manejo de errores
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