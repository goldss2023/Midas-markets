import assert from 'assert';
import http from 'http';

process.env.NODE_ENV = 'test';
process.env.ADMIN_EMAILS = 'admin@example.com';

const { default: app } = await import('../api/index.js');
const { __setAdminAuthVerifierForTests } = await import('../api/admin-auth.js');

const server = http.createServer(app);
await new Promise((resolve) => server.listen(3099, '127.0.0.1', resolve));
const BASE = 'http://127.0.0.1:3099';
let failures = 0;

function check(name, condition, details = '') {
  if (condition) console.log(`PASS: ${name}`);
  else {
    console.error(`FAIL: ${name}${details ? ` — ${details}` : ''}`);
    failures++;
  }
}

async function request(path, options = {}) {
  return fetch(BASE + path, {
    ...options,
    headers: {
      Origin: 'https://midasmarkets.vercel.app',
      ...(options.headers || {}),
    },
  });
}

const adminRoutes = [
  ['GET', '/api/admin/reviews'],
  ['GET', '/api/admin/suggestions'],
  ['GET', '/api/admin/emails'],
  ['GET', '/api/admin/emails/count'],
  ['GET', '/api/admin/analytics'],
  ['GET', '/api/admin/analytics/summary'],
  ['GET', '/api/admin/stats'],
  ['PUT', '/api/admin/reviews/1/status', { status: 'approved' }],
  ['PUT', '/api/admin/reviews/1/respond', { response: 'test' }],
  ['DELETE', '/api/admin/reviews/1'],
  ['DELETE', '/api/admin/suggestions/1'],
  ['POST', '/api/admin/faqs', { question: 'test', answer: 'test' }],
  ['DELETE', '/api/admin/faqs/1'],
  ['POST', '/api/admin/settings', { key: 'test', value: 'test' }],
  ['DELETE', '/api/admin/proofs/1'],
];

try {
  for (const [method, path, body] of adminRoutes) {
    const response = await request(path, {
      method,
      ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
    });
    check(`${method} ${path} rejects visitor`, response.status === 401, `got ${response.status}`);
    check(`${method} ${path} is not publicly cacheable`, response.headers.get('cache-control') === 'no-store');
    check(`${method} ${path} does not use wildcard CORS`, response.headers.get('access-control-allow-origin') !== '*');
  }

  const uploadVisitor = await request('/api/admin/proofs', { method: 'POST' });
  check('POST /api/admin/proofs rejects visitor before upload handling', uploadVisitor.status === 401);

  __setAdminAuthVerifierForTests(async (token) => ({
    data: { user: { id: 'test-user', email: token === 'admin-token' ? 'admin@example.com' : 'visitor@example.com' } },
  }));

  const nonAdmin = await request('/api/admin/stats', { headers: { Authorization: 'Bearer visitor-token' } });
  check('Signed-in non-admin receives 403', nonAdmin.status === 403, `got ${nonAdmin.status}`);

  const adminMe = await request('/api/admin/auth/me', { headers: { Authorization: 'Bearer admin-token' } });
  check('Real admin identity is accepted by the guard', adminMe.status === 200, `got ${adminMe.status}`);
  check('Admin identity response is not cacheable', adminMe.headers.get('cache-control') === 'no-store');

  const adminStatsWithoutDatabase = await request('/api/admin/stats', { headers: { Authorization: 'Bearer admin-token' } });
  check('Authenticated admin never receives fallback private data without a database', adminStatsWithoutDatabase.status === 503, `got ${adminStatsWithoutDatabase.status}`);

  const publicReviews = await request('/api/reviews');
  check('Public reviews remain available', publicReviews.status === 200, `got ${publicReviews.status}`);

  const publicSuggestions = await request('/api/suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Local Test', text: 'Safe local test only' }),
  });
  check('Public suggestions remain available', publicSuggestions.status === 200, `got ${publicSuggestions.status}`);
} finally {
  server.close();
}

if (failures > 0) {
  console.error(`--- ${failures} ADMIN SECURITY TESTS FAILED ---`);
  process.exit(1);
}
console.log('--- ALL ADMIN SECURITY TESTS PASSED ---');
