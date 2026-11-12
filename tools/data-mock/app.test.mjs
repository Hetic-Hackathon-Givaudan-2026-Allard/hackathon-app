import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApp } from './app.mjs';

const input = {
  product_type: 'parfum',
  brief: 'Un parfum chaleureux.',
  region: 'Europe',
  preferences: {
    gourmand: 0,
    premium: 10,
    naturel: 5,
    audace: 5,
    bien_etre: 5,
  },
};

test('contrat HTTP du mock : santé, types, erreurs, absence de résultat et CORS', async (t) => {
  const server = createApp({ delayMs: 0, slowDelayMs: 1 }).listen(
    0,
    '127.0.0.1',
  );
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  );
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = (body) =>
    globalThis.fetch(`${url}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  assert.deepEqual(await (await globalThis.fetch(`${url}/health`)).json(), {
    status: 'ok',
  });
  for (const product_type of ['parfum', 'arome']) {
    const response = await post({ ...input, product_type });
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.status, 'success');
    assert.equal(result.recommendation.product.product_type, product_type);
    assert.equal(result.recommendation.match_score, 85);
  }
  const slow = await post({ ...input, brief: '[lent]' });
  assert.equal(slow.status, 200);
  assert.equal((await slow.json()).status, 'success');
  const noMatch = await post({ ...input, brief: '[sans-resultat]' });
  assert.equal(noMatch.status, 200);
  assert.equal((await noMatch.json()).recommendation, null);
  const unavailable = await post({ ...input, brief: '[erreur]' });
  assert.equal(unavailable.status, 503);
  assert.equal((await unavailable.json()).error.code, 'SERVICE_UNAVAILABLE');
  for (const body of [
    { ...input, region: '' },
    { ...input, brief: '  ' },
    { ...input, preferences: { ...input.preferences, audace: 11 } },
    { ...input, preferences: {} },
  ]) {
    const invalid = await post(body);
    assert.equal(invalid.status, 422);
    const result = await invalid.json();
    assert.equal(result.error.code, 'VALIDATION_ERROR');
    assert.ok(result.error.details.length > 0);
  }
  const malformed = await globalThis.fetch(`${url}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(malformed.status, 422);
  assert.equal((await malformed.json()).error.code, 'VALIDATION_ERROR');
  const preflight = await globalThis.fetch(`${url}/ask`, {
    method: 'OPTIONS',
    headers: {
      Origin: 'http://localhost:5173',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  assert.equal(preflight.status, 204);
  assert.equal(
    preflight.headers.get('access-control-allow-origin'),
    'http://localhost:5173',
  );
});
