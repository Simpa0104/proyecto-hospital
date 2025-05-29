const request = require('supertest');
const app = require('../../src/config/server');
const { describe, test, expect } = require('@jest/globals');

test('Debe rechazar un intento de XSS en /Cuestionario_Niveles', async () => {
    const response = await request(app)
        .post('/Cuestionario_Niveles')
        .send({
            nombre: '<script>alert("hackeado")</script>',
            episodio: 2
        });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
});
