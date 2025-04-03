import http from 'k6/http';
import { check } from 'k6';

export let options = {
    vus: 50,
    duration: '30s',
};

export default function () {
    let payload = JSON.stringify({
        nombre: "Prueba Concurrente",
        episodio: 5,
    });

    let params = {
        headers: { 'Content-Type': 'application/json' },
    };

    let res = http.post('http://localhost:3000/Cuestionario_Niveles', payload, params);

    check(res, {
        'Código de respuesta es 200': (r) => r.status === 200,
        'No hay errores en la respuesta': (r) => !r.body.includes("Error"),
    });
}
