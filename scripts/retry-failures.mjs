import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const checkpointPath = join('work', 'checkpoint.json');
const batchCPath = join('work', 'batch_c_pending.json');

const checkpoint = JSON.parse(readFileSync(checkpointPath, 'utf8'));
const products = JSON.parse(readFileSync(batchCPath, 'utf8'));

const failedIds = checkpoint.failedIds || [];
if (failedIds.length === 0) {
  console.log('No failed products to retry.');
  process.exit(0);
}

// Filter products to keep only those that failed
const failedProducts = products.filter(p => failedIds.includes(p.id));

console.log(`Filtering Batch C from ${products.length} products to ${failedProducts.length} failed products.`);
writeFileSync(batchCPath, JSON.stringify(failedProducts, null, 2));

// Reset checkpoint
checkpoint.index = 0;
checkpoint.failedIds = [];
writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));

console.log('Checkpoint index reset to 0, failedIds cleared. Ready to retry!');
