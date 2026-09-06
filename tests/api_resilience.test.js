import app from '../api/index.js';
import http from 'http';

async function runTests() {
  console.log('--- Starting API Resilience Tests ---');
  let failures = 0;
  
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(3098, '127.0.0.1', resolve));

  const BASE = 'http://127.0.0.1:3098';

  async function testEndpoint(name, path, method = 'GET', body = null, expectedStatus = 200) {
    try {
      const opts = { method, headers: {} };
      if (body) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(BASE + path, opts);
      const json = await res.json();
      if (res.status !== expectedStatus) {
        console.error(`FAIL: ${name} expected status ${expectedStatus} got ${res.status}`);
        failures++;
        return false;
      }
      console.log(`PASS: ${name} (status ${res.status})`, Object.keys(json));
      return json;
    } catch (e) {
      console.error(`FAIL: ${name} error:`, e.message);
      failures++;
      return null;
    }
  }

  // 1. GET /api/proofs
  const proofs = await testEndpoint('GET /api/proofs', '/api/proofs');
  if (!proofs?.proofs || proofs.proofs.length < 5) {
    console.error('FAIL: proofs should have at least 5 setups, got:', proofs?.proofs?.length);
    failures++;
  } else if (proofs.proofs[0]?.filename?.startsWith('/proofs/')) {
    console.error('FAIL: proofs filename contains redundant /proofs/ prefix:', proofs.proofs[0]?.filename);
    failures++;
  } else {
    console.log(`PASS: proofs contains ${proofs.proofs.length} verified setups with normalized filenames`);
  }

  // 2. GET /api/faqs
  const faqs = await testEndpoint('GET /api/faqs', '/api/faqs');
  if (!faqs?.faqs || faqs.faqs.length < 3) {
    console.error('FAIL: faqs should have at least 3 items, got:', faqs?.faqs?.length);
    failures++;
  } else {
    console.log(`PASS: faqs contains ${faqs.faqs.length} FAQs`);
  }

  // 3. GET /api/settings
  const settings = await testEndpoint('GET /api/settings', '/api/settings');
  if (!settings?.settings) {
    console.error('FAIL: settings missing settings array');
    failures++;
  } else {
    console.log(`PASS: settings returned successfully`);
  }

  // 4. GET /api/reviews
  const reviews = await testEndpoint('GET /api/reviews', '/api/reviews');
  if (!reviews?.reviews || reviews.reviews.length === 0) {
    console.error('FAIL: reviews returned empty array');
    failures++;
  } else {
    console.log(`PASS: reviews returned ${reviews.reviews.length} reviews`);
  }

  // 5. POST /api/reviews
  await testEndpoint('POST /api/reviews', '/api/reviews', 'POST', {
    type: 'POSITIVE',
    name: 'Test Trader',
    text: 'Great signals and flawless execution.',
    stars: 5
  });

  // 6. POST /api/suggestions
  await testEndpoint('POST /api/suggestions', '/api/suggestions', 'POST', {
    name: 'Test Trader',
    text: 'Add more gold charts please!'
  });

  // 7. POST /api/emails
  await testEndpoint('POST /api/emails', '/api/emails', 'POST', {
    email: 'testtrader@midasmarkets.com',
    name: 'Test Trader',
    source: 'waitlist'
  });

  // 8. POST /api/analytics/track
  await testEndpoint('POST /api/analytics/track', '/api/analytics/track', 'POST', {
    event_type: 'click',
    event_target: 'telegram_hero_mobile'
  });

  // 9. Edge case: Invalid email
  await testEndpoint('POST /api/emails (invalid email rejected with 400)', '/api/emails', 'POST', {
    email: 'invalid-email',
    name: 'Test'
  }, 400);

  // 10. Edge case: Missing review fields
  await testEndpoint('POST /api/reviews (missing fields rejected with 400)', '/api/reviews', 'POST', {
    name: 'Missing fields'
  }, 400);

  // 11. Edge case: Missing suggestion text
  await testEndpoint('POST /api/suggestions (missing text rejected with 400)', '/api/suggestions', 'POST', {
    name: 'Trader'
  }, 400);

  // 12. Edge case: Missing analytics event_type/event_target
  await testEndpoint('POST /api/analytics/track (missing fields rejected with 400)', '/api/analytics/track', 'POST', {
    event_type: 'click'
  }, 400);

  // 13. Admin Fallback: GET /api/admin/stats
  const stats = await testEndpoint('GET /api/admin/stats', '/api/admin/stats');
  if (typeof stats?.totalReviews !== 'number') {
    console.error('FAIL: admin stats missing totalReviews');
    failures++;
  } else {
    console.log(`PASS: admin stats returned totalReviews: ${stats.totalReviews}`);
  }

  // 14. Admin Fallback: GET /api/admin/reviews
  const adminReviews = await testEndpoint('GET /api/admin/reviews', '/api/admin/reviews');
  if (!Array.isArray(adminReviews?.reviews)) {
    console.error('FAIL: admin reviews missing reviews array');
    failures++;
  } else {
    console.log(`PASS: admin reviews returned ${adminReviews.reviews.length} reviews`);
  }

  // 15. Admin Fallback: GET /api/admin/emails
  const adminEmails = await testEndpoint('GET /api/admin/emails', '/api/admin/emails');
  if (!Array.isArray(adminEmails?.emails)) {
    console.error('FAIL: admin emails missing emails array');
    failures++;
  } else {
    console.log(`PASS: admin emails returned array successfully`);
  }

  // 16. Admin Fallback: GET /api/admin/suggestions
  const adminSuggestions = await testEndpoint('GET /api/admin/suggestions', '/api/admin/suggestions');
  if (!Array.isArray(adminSuggestions?.suggestions)) {
    console.error('FAIL: admin suggestions missing suggestions array');
    failures++;
  } else {
    console.log(`PASS: admin suggestions returned array successfully`);
  }

  // 17. Malformed JSON Body resilience (must not produce 500 error)
  try {
    const rawRes = await fetch(BASE + '/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalid_json: true'
    });
    if (rawRes.status === 500) {
      console.error('FAIL: Malformed JSON returned 500');
      failures++;
    } else {
      console.log(`PASS: Malformed JSON handled gracefully with status ${rawRes.status}`);
    }
  } catch (e) {
    console.error('FAIL: Malformed JSON error:', e.message);
    failures++;
  }

  // 18. Admin Analytics Summary (used on Admin mount)
  const analyticsSummary = await testEndpoint('GET /api/admin/analytics/summary', '/api/admin/analytics/summary');
  if (!Array.isArray(analyticsSummary?.summary)) {
    console.error('FAIL: admin analytics summary missing summary array');
    failures++;
  } else {
    console.log(`PASS: admin analytics summary returned array successfully`);
  }

  // 19. Admin Emails Count
  const emailsCount = await testEndpoint('GET /api/admin/emails/count', '/api/admin/emails/count');
  if (typeof emailsCount?.count !== 'number') {
    console.error('FAIL: admin emails count missing count number');
    failures++;
  } else {
    console.log(`PASS: admin emails count returned: ${emailsCount.count}`);
  }

  // 20. Admin Mutations: Review Status, Respond, Delete
  await testEndpoint('PUT /api/admin/reviews/1/status', '/api/admin/reviews/1/status', 'PUT', { status: 'approved' });
  await testEndpoint('PUT /api/admin/reviews/1/respond', '/api/admin/reviews/1/respond', 'PUT', { response: 'Great work!' });
  await testEndpoint('DELETE /api/admin/reviews/1', '/api/admin/reviews/1', 'DELETE');

  // 21. Admin Mutations: Suggestion Delete
  await testEndpoint('DELETE /api/admin/suggestions/1', '/api/admin/suggestions/1', 'DELETE');

  // 22. Admin Mutations: FAQ Create & Delete
  await testEndpoint('POST /api/admin/faqs', '/api/admin/faqs', 'POST', { question: 'New FAQ', answer: 'New Answer' });
  await testEndpoint('DELETE /api/admin/faqs/1', '/api/admin/faqs/1', 'DELETE');

  // 23. Admin Mutations: Settings Update
  await testEndpoint('POST /api/admin/settings', '/api/admin/settings', 'POST', { key: 'test_key', value: 'test_value' });

  // 24. Admin Mutations: Proof Delete
  await testEndpoint('DELETE /api/admin/proofs/1', '/api/admin/proofs/1', 'DELETE');

  // 25. Catch-all 404 JSON for unknown /api/* endpoint
  try {
    const res404 = await fetch(BASE + '/api/unknown_route_xyz');
    const json404 = await res404.json();
    if (res404.status === 404 && json404?.error) {
      console.log('PASS: Unhandled /api/* route returns clean JSON 404 error');
    } else {
      console.error(`FAIL: Expected 404 JSON for unknown API, got status ${res404.status}`);
      failures++;
    }
  } catch (e) {
    console.error('FAIL: 404 API route error:', e.message);
    failures++;
  }

  server.close();

  if (failures > 0) {
    console.error(`--- ${failures} TESTS FAILED ---`);
    process.exit(1);
  } else {
    console.log('--- ALL API RESILIENCE TESTS PASSED ---');
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
