import assert from 'node:assert/strict';
import { test } from 'node:test';
import { newBriefSchema } from './new-brief.ts';

const validForm = {
  productType: 'parfum',
  brief: 'Un parfum boisé.',
  clientName: 'Client test',
  market: 'Europe',
  category: 'Parfumerie Fine',
  clientType: 'Jeune marque',
  preferences: {
    gourmand: 0,
    premium: 10,
    naturel: 5,
    audace: 5,
    bien_etre: 5,
  },
};

test('accepte les deux types de produit et les bornes 0 et 10', () => {
  assert.equal(newBriefSchema.safeParse(validForm).success, true);
  assert.equal(
    newBriefSchema.safeParse({
      ...validForm,
      productType: 'arome',
      category: 'Boissons',
    }).success,
    true,
  );
});

test('refuse chaque information obligatoire vide, y compris les espaces seuls', () => {
  for (const field of [
    'brief',
    'clientName',
    'market',
    'category',
    'clientType',
  ]) {
    for (const value of ['', '   ']) {
      const result = newBriefSchema.safeParse({ ...validForm, [field]: value });
      assert.equal(result.success, false, field);
      assert.ok(
        result.error.issues.some((issue) => issue.path[0] === field),
        field,
      );
    }
  }
});

test('refuse les catégories incompatibles et les choix inconnus', () => {
  for (const changes of [
    { category: 'Boissons' },
    { productType: 'arome' },
    { market: 'Inconnu' },
    { clientType: 'Inconnu' },
    { productType: 'inconnu' },
  ]) {
    assert.equal(
      newBriefSchema.safeParse({ ...validForm, ...changes }).success,
      false,
    );
  }
});

test('refuse les préférences absentes, non entières ou hors limites', () => {
  for (const value of [undefined, -1, 11, 1.5, '5']) {
    assert.equal(
      newBriefSchema.safeParse({
        ...validForm,
        preferences: { ...validForm.preferences, audace: value },
      }).success,
      false,
    );
  }
});

test('normalise les espaces des textes valides', () => {
  const result = newBriefSchema.parse({
    ...validForm,
    brief: '  Un brief  ',
    clientName: ' Client ',
  });
  assert.equal(result.brief, 'Un brief');
  assert.equal(result.clientName, 'Client');
});
