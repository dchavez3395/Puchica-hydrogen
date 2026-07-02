import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const CHECKPOINT_PATH = join('work', 'checkpoint.json');
const BATCH_A_PATH = join('work', 'batch_a_pending.json');
const BATCH_B_PATH = join('work', 'batch_b_pending.json');
const BATCH_C_PATH = join('work', 'batch_c_pending.json');

function loadCheckpoint() {
  if (existsSync(CHECKPOINT_PATH)) {
    try {
      return JSON.parse(readFileSync(CHECKPOINT_PATH, 'utf8'));
    } catch (e) {
      console.warn('Failed to parse checkpoint, restarting.');
    }
  }
  return {
    batch: 'A',
    index: 0,
    doneIds: [],
    failedIds: []
  };
}

function saveCheckpoint(state) {
  mkdirSync('work', { recursive: true });
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(state, null, 2));
}

// Generate the specific prompt for Batch A jerseys
function generateBatchAPrompt(title) {
  let nation = 'appropriate country';
  if (/Canada/i.test(title)) nation = 'Canada';
  else if (/Portugal/i.test(title)) nation = 'Portugal';
  else if (/Argentina/i.test(title)) nation = 'Argentina';
  else if (/Brasil/i.test(title)) nation = 'Brasil';

  let audience = 'fan or amateur player';
  if (/kid|enfant/i.test(title)) audience = 'child';
  else if (/men|homme/i.test(title)) audience = 'adult';

  return `Place the product in a natural, real-world lifestyle setting where it would actually be used. Show a ${audience} wearing this ${nation} soccer jersey in a World-Cup moment — street celebration, sports bar / living-room watch party, or stadium stands. Keep the crest/colours accurate to the reference. Authentic, joyful, not studio. The product is clearly recognizable and in sharp focus, but the scene feels lived-in and authentic rather than staged. Use the reference image to identify what the product is, then place it convincingly in the moment of use.`;
}

// Generate the lifestyle prompt for Batch B World Cup apparel
function generateBatchBPrompt(title) {
  let nation = 'appropriate country';
  if (/Canada/i.test(title)) nation = 'Canada';
  else if (/Portugal/i.test(title)) nation = 'Portugal';
  else if (/Argentina/i.test(title)) nation = 'Argentina';
  else if (/Brasil/i.test(title)) nation = 'Brasil';

  let productType = 'apparel item';
  if (/cap|hat/i.test(title)) productType = 'cap';
  else if (/tee|t-shirt/i.test(title)) productType = 't-shirt';
  else if (/jacket/i.test(title)) productType = 'track jacket';

  return `Place the product in a natural, real-world lifestyle setting where it would actually be used. Show a fan wearing this ${nation} World Cup ${productType} in a casual, real-world context — street celebration, watch party, or stadium stands. The product is clearly recognizable and in sharp focus, but the scene feels lived-in and authentic rather than staged. Use the reference image to identify what the product is, then place it convincingly in the moment of use.`;
}

// Generate general lifestyle prompt for Batch C
function generateBatchCPrompt(title, type) {
  return `Place the product in a natural, real-world lifestyle setting where it would actually be used. If it is something worn or carried (hat, shoe, garment, swimsuit, pet vest, baby float, clip-on fan, etc.), show it being worn by an appropriate person, child, baby, or pet in a candid editorial style. If it is an object used in a space (fan, cooler, humidifier, garden tool, kitchen item, etc.), show it on the right surface or in the right environment for that use, with subtle context props or hands in frame if appropriate. The product is clearly recognizable and in sharp focus, but the scene feels lived-in and authentic rather than staged. Use the reference image to identify what the product is, then place it convincingly in the moment of use.`;
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download reference image: ${res.statusText}`);
  const ab = await res.arrayBuffer();
  writeFileSync(destPath, Buffer.from(ab));
}

async function main() {
  const args = process.argv.slice(2);
  const completeFlag = args.indexOf('--complete');
  const skipFlag = args.indexOf('--skip');

  let state = loadCheckpoint();

  // If complete flag is passed, process the generated image for the current item
  if (completeFlag >= 0 && args[completeFlag + 1]) {
    const generatedImagePath = args[completeFlag + 1];
    const products = JSON.parse(readFileSync(join('work', `batch_${state.batch.toLowerCase()}_pending.json`), 'utf8'));
    const currentProduct = products[state.index];

    if (!currentProduct) {
      console.error('No current product to complete.');
      process.exit(1);
    }

    console.log(`Completing product: ${currentProduct.title} (${currentProduct.id})`);
    try {
      // Run the process-image script to attach and set featured
      execSync(`node --env-file=.env scripts/process-image.mjs "${currentProduct.id}" "${generatedImagePath}" "${currentProduct.title}"`, { stdio: 'inherit' });
      state.doneIds.push(currentProduct.id);
      console.log(`Successfully completed product ${state.index + 1}/${products.length}`);
    } catch (err) {
      console.error(`Failed to process image for product: ${err.message}`);
      state.failedIds.push(currentProduct.id);
      // Write failure to work/failed_images.txt
      writeFileSync(join('work', 'failed_images.txt'), `${currentProduct.id}\n`, { flag: 'a' });
    }

    state.index++;
    saveCheckpoint(state);
  } else if (skipFlag >= 0) {
    // Skip the current product
    const products = JSON.parse(readFileSync(join('work', `batch_${state.batch.toLowerCase()}_pending.json`), 'utf8'));
    const currentProduct = products[state.index];
    if (currentProduct) {
      console.log(`Skipping product: ${currentProduct.title} (${currentProduct.id})`);
      state.failedIds.push(currentProduct.id);
      writeFileSync(join('work', 'failed_images.txt'), `${currentProduct.id}\n`, { flag: 'a' });
      state.index++;
      saveCheckpoint(state);
    }
  }

  // Load products for the active batch
  let productsPath = join('work', `batch_${state.batch.toLowerCase()}_pending.json`);
  if (!existsSync(productsPath)) {
    console.error(`Pending file not found: ${productsPath}`);
    process.exit(1);
  }

  let products = JSON.parse(readFileSync(productsPath, 'utf8'));

  // If index is past the end of the current batch, advance the batch
  if (state.index >= products.length) {
    if (state.batch === 'A') {
      console.log('Batch A complete! Transitioning to Batch B.');
      state.batch = 'B';
      state.index = 0;
      saveCheckpoint(state);
      productsPath = join('work', `batch_b_pending.json`);
      products = JSON.parse(readFileSync(productsPath, 'utf8'));
    } else if (state.batch === 'B') {
      console.log('Batch B complete! Transitioning to Batch C.');
      state.batch = 'C';
      state.index = 0;
      saveCheckpoint(state);
      productsPath = join('work', `batch_c_pending.json`);
      products = JSON.parse(readFileSync(productsPath, 'utf8'));
    } else {
      console.log('ALL BATCHES COMPLETE!');
      process.exit(0);
    }
  }

  const nextProduct = products[state.index];
  if (!nextProduct) {
    console.log('No more products in this batch.');
    process.exit(0);
  }

  console.log(`\n--- Next Product (${state.index + 1}/${products.length} in Batch ${state.batch}) ---`);
  console.log(`ID: ${nextProduct.id}`);
  console.log(`Title: ${nextProduct.title}`);

  // Find reference image
  const refUrl = nextProduct.featuredImage?.url || (nextProduct.images?.edges?.[0]?.node?.url);
  if (!refUrl) {
    console.log(`[WARN] No reference image found for product ${nextProduct.id}. Skipping.`);
    state.failedIds.push(nextProduct.id);
    state.index++;
    saveCheckpoint(state);
    process.exit(0);
  }

  const tempRefPath = join('work', 'temp_ref.jpg');
  console.log(`Downloading reference image: ${refUrl}`);
  try {
    await downloadImage(refUrl, tempRefPath);
    console.log(`Reference image downloaded to: ${tempRefPath}`);
  } catch (err) {
    console.error(`Failed to download reference image: ${err.message}. Skipping.`);
    state.failedIds.push(nextProduct.id);
    state.index++;
    saveCheckpoint(state);
    process.exit(0);
  }

  // Generate prompt
  let prompt = '';
  if (state.batch === 'A') {
    prompt = generateBatchAPrompt(nextProduct.title);
  } else if (state.batch === 'B') {
    prompt = generateBatchBPrompt(nextProduct.title);
  } else {
    prompt = generateBatchCPrompt(nextProduct.title, nextProduct.productType);
  }

  console.log('\n--- AGENT GENERATION PAYLOAD ---');
  console.log(`IMAGE_NAME: hf_temp_${state.batch}_${state.index}`);
  console.log(`PROMPT: ${prompt}`);
  console.log(`REF_PATH: ${join(process.cwd(), tempRefPath)}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
