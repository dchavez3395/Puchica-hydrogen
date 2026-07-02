import dotenv from 'dotenv';
dotenv.config();

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { adminGraphQL } from './shopify-oauth.mjs';

const CHECKPOINT_PATH = join('work', 'checkpoint.json');
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_VERSION = "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"; // SDXL Image-to-Image

if (!REPLICATE_API_TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN is missing in env.');
  process.exit(1);
}

function loadCheckpoint() {
  if (existsSync(CHECKPOINT_PATH)) {
    try {
      return JSON.parse(readFileSync(CHECKPOINT_PATH, 'utf8'));
    } catch (e) {
      console.warn('Failed to parse checkpoint, restarting.');
    }
  }
  return {
    batch: 'B',
    index: 0,
    doneIds: [],
    failedIds: []
  };
}

function saveCheckpoint(state) {
  mkdirSync('work', { recursive: true });
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(state, null, 2));
}

// Prompt generators matching batch-runner.mjs
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

function generateBatchCPrompt(title, type) {
  return `Place the product in a natural, real-world lifestyle setting where it would actually be used. If it is something worn or carried (hat, shoe, garment, swimsuit, pet vest, baby float, clip-on fan, etc.), show it being worn by an appropriate person, child, baby, or pet in a candid editorial style. If it is an object used in a space (fan, cooler, humidifier, garden tool, kitchen item, etc.), show it on the right surface or in the right environment for that use, with subtle context props or hands in frame if appropriate. The product is clearly recognizable and in sharp focus, but the scene feels lived-in and authentic rather than staged. Use the reference image to identify what the product is, then place it convincingly in the moment of use.`;
}

async function downloadImage(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download: ${res.statusText}`);
  const ab = await res.arrayBuffer();
  writeFileSync(destPath, Buffer.from(ab));
}

const tagMutation = `
mutation($id: ID!, $tags: [String!]!) {
  tagsAdd(id: $id, tags: $tags) {
    node { id }
    userErrors { field message }
  }
}
`;

async function tagProduct(productId) {
  try {
    const res = await adminGraphQL(tagMutation, {
      id: productId,
      tags: ['for-you']
    });
    if (res?.data?.tagsAdd?.userErrors?.length) {
      console.warn(`[WARN] Failed to tag product: ${JSON.stringify(res.data.tagsAdd.userErrors)}`);
    } else {
      console.log(`  Tagged product with 'for-you'.`);
    }
  } catch (err) {
    console.warn(`[WARN] Tag request failed: ${err.message}`);
  }
}

async function generateReplicateImage(refUrl, prompt) {
  let predictionId = null;
  while (true) {
    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: MODEL_VERSION,
        input: {
          prompt: prompt,
          image: refUrl,
          prompt_strength: 0.65,
          width: 1024,
          height: 1024,
          num_inference_steps: 30
        }
      })
    });

    if (res.status === 429) {
      const errJson = await res.json().catch(() => ({}));
      const retryAfter = errJson.retry_after || 3;
      console.log(`  [429 Throttled] Replicate rate limit hit. Waiting ${retryAfter}s before retrying...`);
      await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
      continue;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Replicate creation failed: ${text}`);
    }

    const json = await res.json();
    predictionId = json.id;
    break;
  }

  while (true) {
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`
      }
    });

    if (!pollRes.ok) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      continue;
    }

    const pollJson = await pollRes.json();
    const status = pollJson.status;

    if (status === 'succeeded') {
      return pollJson.output[0];
    } else if (status === 'failed' || status === 'canceled') {
      throw new Error(`Prediction ${status}: ${pollJson.error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function main() {
  let state = loadCheckpoint();

  // Make sure work directory exists
  mkdirSync('work', { recursive: true });

  while (true) {
    const productsPath = join('work', `batch_${state.batch.toLowerCase()}_pending.json`);
    if (!existsSync(productsPath)) {
      console.log(`Finished active batches. Pending file does not exist: ${productsPath}`);
      break;
    }

    const products = JSON.parse(readFileSync(productsPath, 'utf8'));
    if (state.index >= products.length) {
      if (state.batch === 'A') {
        console.log('--- Batch A complete! Transitioning to Batch B. ---');
        state.batch = 'B';
        state.index = 0;
        saveCheckpoint(state);
        continue;
      } else if (state.batch === 'B') {
        console.log('--- Batch B complete! Transitioning to Batch C. ---');
        state.batch = 'C';
        state.index = 0;
        saveCheckpoint(state);
        continue;
      } else {
        console.log('--- ALL BATCHES COMPLETE! ---');
        break;
      }
    }

    const product = products[state.index];
    console.log(`\n--- [Batch ${state.batch}] Processing ${state.index + 1}/${products.length}: ${product.title} ---`);
    
    const refUrl = product.featuredImage?.url || (product.images?.edges?.[0]?.node?.url);
    if (!refUrl) {
      console.log(`[WARN] No reference image found. Skipping.`);
      state.failedIds.push(product.id);
      state.index++;
      saveCheckpoint(state);
      continue;
    }

    let prompt = '';
    if (state.batch === 'A') {
      // (Should already be done, but keep for safety)
      continue; 
    } else if (state.batch === 'B') {
      prompt = generateBatchBPrompt(product.title);
    } else {
      prompt = generateBatchCPrompt(product.title, product.productType);
    }

    try {
      console.log(`  Calling Replicate image-to-image...`);
      const generatedUrl = await generateReplicateImage(refUrl, prompt);
      console.log(`  Image generated successfully! URL: ${generatedUrl}`);

      const tempGenPath = join('work', 'temp_gen.jpg');
      console.log(`  Downloading generated image...`);
      await downloadImage(generatedUrl, tempGenPath);

      console.log(`  Attaching to Shopify product...`);
      execSync(`node --env-file=.env scripts/process-image.mjs "${product.id}" "${tempGenPath}" "${product.title}"`, { stdio: 'inherit' });
      
      console.log(`  Tagging product...`);
      await tagProduct(product.id);

      state.doneIds.push(product.id);
      console.log(`  SUCCESS: Product ${state.index + 1}/${products.length} completed.`);
    } catch (err) {
      console.error(`  [ERROR] Failed to process product: ${err.message}`);
      state.failedIds.push(product.id);
      writeFileSync(join('work', 'failed_images.txt'), `${product.id}\n`, { flag: 'a' });
    }

    state.index++;
    saveCheckpoint(state);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
