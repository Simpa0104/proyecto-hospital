import http from 'k6/http';
import { check } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 20 },
        { duration: '10s', target: 50 },
        { duration: '10s', target: 0 },
    ]
};

export default function () {
    let resGet = http.get('http://localhost:3000');
    let cookies = resGet.cookies['XSRF-TOKEN'];
    let token = cookies && cookies.length > 0 ? cookies[0].value : null;

    if (!token) {
        console.error('No se pudo obtener el token CSRF');
        return;
    }

    let payload = {
        nombre: "Prueba Concurrente",
        episodio: 5,
        _csrf: token,
    };

    for (let i = 1; i <= 12; i++) {
        payload[`pregunta${i}`] = Math.random() < 0.5 ? 0 : 1;
    }

    let encodedPayload = Object.entries(payload).map(
        ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
    ).join('&');

    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-xsrf-token': token,
        'Cookie': `XSRF-TOKEN=${token}`,
    };

    let res = http.post('http://localhost:3000/Cuestionario_Niveles', encodedPayload, { headers });

    check(res, {
        'Código de respuesta 200': (r) => r.status === 200,
        'Respuesta sin errores': (r) => !r.body.includes("Error"),
    });
}
