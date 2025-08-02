import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% can fail
  },
};

const BASE_URL = 'http://localhost:8080/api';
const TOKEN = '${__ENV.AUTH_TOKEN}'; // Set this when running the test

export default function () {
  const params = {
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
  };

  // Test product listing
  const productsRes = http.get(`${BASE_URL}/products`, params);
  check(productsRes, {
    'products status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < 500,
  });

  // Test single product fetch
  const productId = 'test-product-id'; // Replace with actual ID
  const productRes = http.get(`${BASE_URL}/products/${productId}`, params);
  check(productRes, {
    'single product status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
