const { sequelize } = require('../../src/models'); // Asegúrate de exportar sequelize desde index.js

beforeAll(async () => {
    await sequelize.sync({ force: true });
    console.log('✅ Base de datos sincronizada para pruebas');
});

afterAll(async () => {
    await sequelize.close();
    console.log('✅ Conexión cerrada después de las pruebas');
});
