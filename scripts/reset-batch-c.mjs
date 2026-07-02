import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const checkpointPath = join('work', 'checkpoint.json');
const batchCPath = join('work', 'batch_c_pending.json');

const checkpoint = JSON.parse(readFileSync(checkpointPath, 'utf8'));
const productsC = JSON.parse(readFileSync(batchCPath, 'utf8'));

const idsToRemove = productsC.map(p => p.id);

// Keep only doneIds that are NOT in Batch C
const filteredDoneIds = (checkpoint.doneIds || []).filter(id => !idsToRemove.includes(id));

checkpoint.batch = "C";
checkpoint.index = 0;
checkpoint.doneIds = filteredDoneIds;
checkpoint.failedIds = [];

writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
console.log(`Reset checkpoint for Batch C! Keep ${filteredDoneIds.length} doneIds from Batch A & B.`);
