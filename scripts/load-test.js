import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp-up to 20 users
    { duration: '1m', target: 50 }, // Stay at 50 users
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 100 }, // Stay at 100 users
    { duration: '30s', target: 0 }, // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
    http_req_failed: ['rate<0.01'], // Error rate < 1%
    errors: ['rate<0.1'], // Custom error rate < 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Homepage load
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads under 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: Feed API
  res = http.get(`${BASE_URL}/api/feed?page=0`);
  check(res, {
    'feed status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'feed loads under 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Static assets
  res = http.get(`${BASE_URL}/_next/static/chunks/main.js`);
  check(res, {
    'static asset cached': (r) => r.headers['Cache-Control']?.includes('immutable'),
  }) || errorRate.add(1);

  sleep(2);
}

// Scenario for content viewing
export function contentView() {
  const res = http.get(`${BASE_URL}/feed`);
  check(res, {
    'content view successful': (r) => r.status === 200 || r.status === 401,
  }) || errorRate.add(1);

  sleep(Math.random() * 3 + 1); // Random delay 1-4 seconds
}

// Scenario for API testing
export function apiLoad() {
  const endpoints = [
    '/api/users/me',
    '/api/content',
    '/api/messages',
    '/api/ai-agents',
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${BASE_URL}${endpoint}`);

  check(res, {
    'api response is valid': (r) => r.status === 200 || r.status === 401 || r.status === 403,
    'api response under 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(0.5);
}

export function setup() {
  console.log('Starting load test...');
  console.log(`Target: ${BASE_URL}`);
}

export function teardown(data) {
  console.log('Load test complete!');
}
