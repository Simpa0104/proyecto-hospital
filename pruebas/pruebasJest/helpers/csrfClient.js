const request = require('supertest');
const app = require('../../../src/config/server');

async function getCSRFToken() {
    const agent = request.agent(app);

    const res = await agent.get('/Cuestionario_Riesgos');
    const csrfToken = res.text.match(/name="_csrf" value="(.+?)"/)?.[1];

    if (!csrfToken) {
        throw new Error('No se pudo extraer el token CSRF');
    }

    // Convertir cookies a formato plano
    const cookies = res.headers['set-cookie']
        .map(cookie => cookie.split(';')[0])
        .join('; ');

    return { agent, csrfToken, cookies };
}

module.exports = { getCSRFToken };