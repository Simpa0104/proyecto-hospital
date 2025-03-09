// db.js
const mysql = require('mysql2');
require('dotenv').config(); // Carga las variables de entorno

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificar conexión
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error de conexión a la BD:', err.code, err.message);
        return;
    }
    console.log('¡Conectado a MySQL!');
    connection.release();
});

module.exports = pool.promise();
