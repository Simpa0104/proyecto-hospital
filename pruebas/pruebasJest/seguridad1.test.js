const request = require('supertest');
const app = require('../../src/config/server');
const pool = require('../../src/config/database');
const { describe, test, expect } = require('@jest/globals');

describe('Pruebas de seguridad en los endpoints', () => {
    test('Debe rechazar un intento de SQL Injection en /Cuestionario_Niveles', async () => {
        const response = await request(app)
            .post('/Cuestionario_Niveles')
            .send({
                nombre: "' OR 1=1 --",
                episodio: 1
            });

        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
    });
});
