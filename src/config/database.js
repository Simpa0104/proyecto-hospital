const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        define: {
            timestamps: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        }
    }
);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('¡Conectado a MySQL con Sequelize!');
    } catch (error) {
        console.error('Error de conexión a la base de datos:', error);
    }
})();

module.exports = sequelize;
