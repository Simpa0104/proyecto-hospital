const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,  // Asegúrate de que esta línea está presente
    port: process.env.DB_PORT || 3306
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error de conexión a la BD:', err.code, err.sqlMessage);
        return;
    }
    console.log('¡Conectado a MySQL!');
    connection.release();
});

module.exports = pool.promise();
