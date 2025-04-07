import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 2000,
  duration: '2400s',
};

export default function () {
  let res = http.get('http://localhost:3000/Historial');

  check(res, {
    'Código de respuesta es 200': (r) => r.status === 200,
    'Tiempo de respuesta es menor a 300ms': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
