const request = require('supertest');
const app = require('../../src/config/server');
const pool = require('../../src/config/database');
const { describe, test, expect } = require('@jest/globals');

describe('Pruebas de API - Proyecto Hospital', () => {

    test('Debe procesar una evaluación correctamente', async () => {
        const response = await request(app)
            .post('/Cuestionario_Niveles')
            .send({
                nombre: 'Paciente Test',
                episodio: 2,
                pregunta1: 1,
                pregunta2: 2,
                pregunta3: 1,
                pregunta4: 3,
                pregunta5: 2,
                pregunta6: 1,
                pregunta7: 3,
                pregunta8: 2,
                pregunta9: 1,
                pregunta10: 3,
                pregunta11: 2,
                pregunta12: 1
            });

        expect(response.status).toBe(302);
    });

    test('Debe fallar al eliminar una evaluación inexistente', async () => {
        const response = await request(app)
            .post('/eliminar-evaluacion/99999');

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("Evaluación no encontrada");
    });

    test('Debe eliminar una evaluación existente', async () => {
        const [insertResult] = await pool.execute(
            `INSERT INTO evaluaciones (nombre, episodio, fecha, categoria, psico, bio, social) 
             VALUES ('Test Delete', 1, CURDATE(), 'Psicológico', 5, 3, 2)`
        );

        const insertedId = insertResult.insertId;

        const response = await request(app)
            .post(`/eliminar-evaluacion/${insertedId}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

});
