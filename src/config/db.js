const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'test'
});

connection.connect((err) => {
    if (err) {
        console.log('El error a conexion a BD es: ' + err);
        return;
    }
    console.log('Conectado exitosamente a la BD');
});

module.exports = connection;