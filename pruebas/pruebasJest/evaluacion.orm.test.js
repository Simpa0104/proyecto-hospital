const { Sequelize, DataTypes } = require('sequelize');
const { Evaluacion } = require('../../src/models');

// Base de datos SQLite en memoria
const sequelize = new Sequelize('sqlite::memory:', {
    logging: false,
});

// Re-definir el modelo sobre SQLite temporal para test
const TestEvaluacion = sequelize.define('Evaluacion', {
    nombre: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            is: /^[a-zA-Z\s]+$/i,
        },
    },
    episodio: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    categoria: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    psico: {
        type: DataTypes.TINYINT,
        allowNull: false,
    },
    bio: {
        type: DataTypes.TINYINT,
        allowNull: false,
    },
    social: {
        type: DataTypes.TINYINT,
        allowNull: false,
    },
}, {
    tableName: 'evaluaciones',
    timestamps: false,
});

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});

describe('CRUD con Sequelize y SQLite (modo local)', () => {

    //6. Prueba donde se crea una evaluacion valida
    test('Crear evaluación válida', async () => {
        const evaluacion = await TestEvaluacion.create({
            nombre: 'Paciente Uno',
            episodio: 1,
            fecha: new Date().toISOString().split('T')[0],
            categoria: 'Psicológico, Social',
            psico: 3,
            bio: 4,
            social: 2,
        });

        expect(evaluacion.id).toBeDefined();
        expect(evaluacion.nombre).toBe('Paciente Uno');
    });

    //7. Prueba donde falla al crear una evaluación con nombre inválido (números)
    test('Falla al crear evaluación con nombre inválido (números)', async () => {
        await expect(TestEvaluacion.create({
            nombre: 'Juan123',
            episodio: 2,
            fecha: new Date().toISOString().split('T')[0],
            categoria: 'Biológico',
            psico: 1,
            bio: 5,
            social: 0,
        })).rejects.toThrow();
    });

    //8. Prueba donde se busca una evaluación por nombre
    test('Leer todas las evaluaciones', async () => {
        const registros = await TestEvaluacion.findAll();
        expect(registros.length).toBeGreaterThan(0);
    });

    //9. Prueba donde se busca una evaluación por ID
    test('Leer una evaluación por ID', async () => {
        const nueva = await TestEvaluacion.create({
            nombre: 'Paciente Dos',
            episodio: 3,
            fecha: new Date().toISOString().split('T')[0],
            categoria: 'Social',
            psico: 2,
            bio: 3,
            social: 4,
        });

        const encontrada = await TestEvaluacion.findByPk(nueva.id);
        expect(encontrada.nombre).toBe('Paciente Dos');
    });

    //10. Prueba donde se actualiza una evaluación existente
    test('Actualizar evaluación existente', async () => {
        const evaluacion = await TestEvaluacion.create({
            nombre: 'Paciente Editar',
            episodio: 4,
            fecha: new Date().toISOString().split('T')[0],
            categoria: 'Ninguno',
            psico: 0,
            bio: 1,
            social: 1,
        });

        evaluacion.categoria = 'Psicológico';
        await evaluacion.save();

        const actualizada = await TestEvaluacion.findByPk(evaluacion.id);
        expect(actualizada.categoria).toBe('Psicológico');
    });

    //11. Prueba donde se elimina una evaluacion
    test('Eliminar evaluación', async () => {
        const evaluacion = await TestEvaluacion.create({
            nombre: 'Paciente Eliminar',
            episodio: 5,
            fecha: new Date().toISOString().split('T')[0],
            categoria: 'Social',
            psico: 1,
            bio: 2,
            social: 3,
        });

        const id = evaluacion.id;
        await evaluacion.destroy();

        const eliminado = await TestEvaluacion.findByPk(id);
        expect(eliminado).toBeNull();
    });

    //12. Prueba de filtro por nombre
    test('Filtro por nombre', async () => {
        await TestEvaluacion.create({
            nombre: 'BuscarNombre',
            episodio: 6,
            fecha: new Date().toISOString().split('T')[0],
            categoria: 'Psicológico',
            psico: 2,
            bio: 2,
            social: 2,
        });

        const resultados = await TestEvaluacion.findAll({
            where: {
                nombre: 'BuscarNombre'
            }
        });

        expect(resultados.length).toBeGreaterThanOrEqual(1);
    });
});
