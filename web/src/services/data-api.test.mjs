import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requestRecommendation, toAskRequest } from './data-api.ts';

const form = {
  productType: 'parfum',
  brief: 'Un parfum boisé.',
  market: 'Europe',
  clientName: 'Client privé',
  clientType: 'Jeune marque',
  category: 'Parfumerie Fine',
  preferences: {
    gourmand: 0,
    premium: 10,
    naturel: 5,
    audace: 5,
    bien_etre: 5,
  },
};
const result = {
  status: 'success',
  recommendation: {
    match_score: 85,
    product: {
      id: 'DEMO',
      product_type: 'parfum',
      name: 'Test',
      description: 'Test',
    },
    reasons: [],
    limitations: [],
  },
};
const options = {
  baseUrl: 'https://data.example.test/',
  signal: new globalThis.AbortController().signal,
};

test('envoie uniquement le contrat Data et accepte une réponse valide', async (t) => {
  assert.deepEqual(Object.keys(toAskRequest(form)).sort(), [
    'brief',
    'preferences',
    'product_type',
    'region',
  ]);
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    assert.equal(url, 'https://data.example.test/ask');
    assert.deepEqual(JSON.parse(init.body), toAskRequest(form));
    return globalThis.Response.json(result);
  });
  assert.deepEqual(await requestRecommendation(form, options), result);
});

test('distingue absence de résultat, erreurs HTTP et réponses incompatibles', async (t) => {
  const noMatch = {
    status: 'no_match',
    recommendation: null,
    message: 'Aucun produit.',
  };
  const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
    globalThis.Response.json(noMatch),
  );
  assert.deepEqual(await requestRecommendation(form, options), noMatch);
  fetchMock.mock.mockImplementation(async () =>
    globalThis.Response.json(
      {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Indisponible.',
          details: [],
        },
      },
      { status: 503 },
    ),
  );
  await assert.rejects(requestRecommendation(form, options), /Indisponible/);
  fetchMock.mock.mockImplementation(async () =>
    globalThis.Response.json({ status: 'success' }),
  );
  await assert.rejects(requestRecommendation(form, options), /incompatible/);
  fetchMock.mock.mockImplementation(async () =>
    globalThis.Response.json({
      ...result,
      recommendation: {
        ...result.recommendation,
        product: { ...result.recommendation.product, product_type: 'arome' },
      },
    }),
  );
  await assert.rejects(requestRecommendation(form, options), /type demandé/);
});

test('présente une erreur lisible en cas de panne réseau', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw new TypeError('Failed to fetch');
  });
  await assert.rejects(
    requestRecommendation(form, options),
    /Service inaccessible/,
  );
});
