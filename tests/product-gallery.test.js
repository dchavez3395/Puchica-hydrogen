import test from 'node:test';
import assert from 'node:assert/strict';
import {buildApprovedGallery} from '../app/lib/product-gallery.js';

const selectedImage = {id: 'selected', url: 'https://cdn.example/selected.jpg'};

test('single-variant products expose their deduplicated product gallery', () => {
  const extraImage = {id: 'extra', url: 'https://cdn.example/extra.jpg'};
  const product = {
    variants: {nodes: [{id: 'only-variant'}]},
    images: {nodes: [selectedImage, extraImage, extraImage]},
  };

  assert.deepEqual(
    buildApprovedGallery(product, {image: selectedImage}),
    [selectedImage, extraImage],
  );
});

test('multi-variant products remain restricted to the selected SKU image', () => {
  const product = {
    variants: {nodes: [{id: 'one'}, {id: 'two'}]},
    images: {nodes: [{id: 'unapproved', url: 'https://cdn.example/mixed.jpg'}]},
  };

  assert.deepEqual(buildApprovedGallery(product, {image: selectedImage}), [
    selectedImage,
  ]);
});

test('gallery fails closed without selected-variant image evidence', () => {
  const product = {
    variants: {nodes: [{id: 'only-variant'}]},
    images: {nodes: [{id: 'product-image'}]},
  };

  assert.deepEqual(buildApprovedGallery(product, {}), []);
});
