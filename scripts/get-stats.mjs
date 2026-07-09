import { readFileSync } from 'node:fs';
import { join } from 'node:path';

try {
  const data = JSON.parse(readFileSync(join('work', 'checkpoint.json'), 'utf8'));
  console.log('--- CHECKPOINT STATS ---');
  console.log(`Current Batch: ${data.batch}`);
  console.log(`Current Index: ${data.index}`);
  console.log(`Done IDs count: ${data.doneIds?.length || 0}`);
  console.log(`Failed IDs count: ${data.failedIds?.length || 0}`);
} catch (e) {
  console.error(e);
}
