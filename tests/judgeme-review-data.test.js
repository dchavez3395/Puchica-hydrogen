import assert from 'node:assert/strict';
import test from 'node:test';
import {parseJudgemeReviewData} from '../app/lib/judgeme.js';

test('reads rating, count and external id out of Judge.me payload', () => {
  const v = JSON.stringify({number_of_reviews: 3, average_rating: '4.67', product_external_id: 9382722044154});
  assert.deepEqual(parseJudgemeReviewData(v), {rating: 4.67, count: 3, externalId: 9382722044154});
});

test('a product with no reviews yet still yields its external id', () => {
  const v = JSON.stringify({number_of_reviews: 0, average_rating: '0.00', product_external_id: 9365959246074});
  assert.deepEqual(parseJudgemeReviewData(v), {rating: 0, count: 0, externalId: 9365959246074});
});

test('absent metafield, malformed JSON and junk all degrade to null', () => {
  for (const v of [null, undefined, '', 'not json{', '[]', '"str"', '3']) {
    assert.equal(parseJudgemeReviewData(v), null, `expected null for ${JSON.stringify(v)}`);
  }
});

test('non-numeric fields do not leak NaN into the page', () => {
  const v = JSON.stringify({number_of_reviews: 'x', average_rating: null, product_external_id: 'nope'});
  assert.deepEqual(parseJudgemeReviewData(v), {rating: 0, count: 0, externalId: null});
});
