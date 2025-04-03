const request = require('supertest');
const app = require('../../src/config/server');
const pool = require('../../src/config/database');

describe('Pruebas de validación de datos', () => {
    test('Debe rechazar un POST a /Cuestionario_Niveles sin nombre ni episodio', async () => {
        const response = await request(app)
            .post('/Cuestionario_Niveles')
            .send({});

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'El nombre es requerido' }),
                expect.objectContaining({ msg: 'Episodio debe ser un número válido' })
            ])
        );
    });

    test('Debe rechazar un POST con episodio inválido', async () => {
        const response = await request(app)
            .post('/Cuestionario_Niveles')
            .send({ nombre: 'Juan', episodio: 'abc' });

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Episodio debe ser un número válido' })
            ])
        );
    });
});
