const { Evaluacion, sequelize } = require('../../src/models');

describe('Pruebas directas de Base de Datos (MySQL) con Sequelize', () => {
    let evaluacionId;

    beforeAll(async () => {
        await sequelize.authenticate();
    });

    afterAll(async () => {
        await sequelize.close();
    });

    //1. Prueba de insecion de una evaluacion valida
    test('Inserta evaluación válida', async () => {
        const evaluacion = await Evaluacion.create({
            nombre: 'Paciente BD',
            episodio: 123,
            fecha: new Date().toISOString().split('T')[0],
            categoria: 'Psicológico',
            psico: 3,
            bio: 2,
            social: 1
        });

        evaluacionId = evaluacion.id;
        expect(evaluacion.nombre).toBe('Paciente BD');
        expect(evaluacion.id).toBeDefined();
    });

    //2. Prueba donde debe de fallar al insertar una evaluacion con un nombre invalido
    test('Falla al insertar evaluación con nombre inválido', async () => {
        await expect(
            Evaluacion.create({
                nombre: 'Paciente123',
                episodio: 1,
                fecha: new Date().toISOString().split('T')[0],
                categoria: 'Psicológico',
                psico: 3,
                bio: 2,
                social: 1
            })
        ).rejects.toThrow();
    });

    //3. Prueba donde busca una evaluacion por el nombre
    test('Busca evaluación por nombre', async () => {
        const resultados = await Evaluacion.findAll({
            where: { nombre: 'Paciente BD' }
        });
        expect(resultados.length).toBeGreaterThan(0);
        expect(resultados[0].categoria).toBe('Psicológico');
    });

    //4. Prueba donde se actualiza una evaluacion
    test('Actualiza evaluación', async () => {
        const evaluacion = await Evaluacion.findByPk(evaluacionId);
        evaluacion.psico = 4;
        await evaluacion.save();

        const actualizado = await Evaluacion.findByPk(evaluacionId);
        expect(actualizado.psico).toBe(4);
    });

    //5. Prueba donde se elimina una evaluacion
    test('Elimina evaluación', async () => {
        const eliminados = await Evaluacion.destroy({
            where: { id: evaluacionId }
        });

        expect(eliminados).toBe(1);
    });
});