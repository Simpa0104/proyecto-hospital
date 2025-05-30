const { getCSRFToken } = require('./helpers/csrfClient');

describe('Pruebas de Seguridad con CSRF real', () => {

    //13. Prueba donde se debe de rechazar una solicitud SQL Injection
    test('Rechaza SQL Injection (nombre = "\' OR 1=1 --")', async () => {
        const { agent, csrfToken, cookies } = await getCSRFToken();

        const res = await agent
            .post('/Cuestionario_Niveles')
            .set('Cookie', cookies)
            .set('x-xsrf-token', csrfToken)
            .send({
                nombre: "' OR 1=1 --",
                episodio: 1,
                _csrf: csrfToken,
                pregunta1: 1, pregunta2: 1, pregunta3: 1, pregunta4: 1,
                pregunta5: 1, pregunta6: 1, pregunta7: 1, pregunta8: 1,
                pregunta9: 1, pregunta10: 1, pregunta11: 1, pregunta12: 1
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    //14. Prueba donde se debe de rechazar una solicitud XSS
    test('Rechaza XSS (nombre con <script>)', async () => {
        const { agent, csrfToken, cookies } = await getCSRFToken();

        const res = await agent
            .post('/Cuestionario_Niveles')
            .set('Cookie', cookies)
            .set('x-xsrf-token', csrfToken)
            .send({
                nombre: '<script>alert("XSS")</script>',
                episodio: 1,
                _csrf: csrfToken,
                pregunta1: 1, pregunta2: 1, pregunta3: 1, pregunta4: 1,
                pregunta5: 1, pregunta6: 1, pregunta7: 1, pregunta8: 1,
                pregunta9: 1, pregunta10: 1, pregunta11: 1, pregunta12: 1
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
    });
});
