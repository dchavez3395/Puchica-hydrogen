import dotenv from 'dotenv';
dotenv.config();

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { adminGraphQL } from './shopify-oauth.mjs';

const CHECKPOINT_PATH = join('work', 'checkpoint.json');
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_VERSION = "54a0e1e1841cbb8c4ef226bd5e197798bef44acd0f63ed38338bda222205a7b0"; // asiryan/flux-schnell (text-to-image)

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

// Auto-commit work state after every checkpoint save so the working
// tree stays clean and `hydrogen deploy` is never blocked by
// in-flight runner progress. Best-effort: git errors are logged but
// don't fail the batch. Skips if any non-work/ file is dirty so we
// never clobber unrelated in-progress edits.
function commitCheckpoint(batch, index, total, status) {
  try {
    const dirty = execSync('git status --porcelain', { encoding: 'utf8' });
    const offending = dirty
      .split('\n')
      .filter(Boolean)
      .filter(line => !/^.. work\//.test(line));
    if (offending.length) {
      console.warn(`  [git] Skipping auto-commit — dirty files outside work/: ${offending.length}`);
      return;
    }
    const staged = execSync('git add work/checkpoint.json work/failed_images.txt work/batch_a_pending.json work/batch_b_pending.json work/batch_c_pending.json work/batch_d_pending.json && git diff --cached --name-only', { encoding: 'utf8' }).trim();
    if (!staged) return;
    const msg = `chore(automation): checkpoint batch ${batch} ${index}/${total} (${status})`;
    execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
  } catch (e) {
    console.warn(`  [git] Auto-commit failed (non-fatal): ${e.message?.split('\n')[0]}`);
  }
}

// Prompt generators matching batch-runner.mjs
function generateBatchBPrompt(title) {
  let nation = 'appropriate country';
  if (/Canada/i.test(title)) nation = 'Canada';
  else if (/Portugal/i.test(title)) nation = 'Portugal';
  else if (/Argentina/i.test(title)) nation = 'Argentina';
  else if (/Brasil/i.test(title)) nation = 'Brasil';

  let details = 'a sporty apparel item';
  if (/cap|hat/i.test(title)) {
    if (nation === 'Canada') details = 'a red baseball cap with bold black "CANADA" text embroidered on the front';
    else if (nation === 'Portugal') details = 'a green and red baseball cap with the Portugal football federation crest on the front';
    else if (nation === 'Argentina') details = 'a sky blue and white baseball cap with the Argentina football association golden sun crest on the front';
    else if (nation === 'Brasil') details = 'a yellow and green baseball cap with the Brasil football crest on the front';
  } else if (/tee|t-shirt/i.test(title)) {
    if (nation === 'Canada') details = 'a red ringer t-shirt with black collars and "CANADA" text on the chest';
    else if (nation === 'Portugal') details = 'a red ringer t-shirt with green collars and "PORTUGAL" text on the chest';
    else if (nation === 'Argentina') details = 'a white and sky blue striped ringer t-shirt with the Argentina crest on the chest';
    else if (nation === 'Brasil') details = 'a yellow ringer t-shirt with green collars and "BRASIL" text on the chest';
  } else if (/jacket/i.test(title)) {
    details = `a sporty track jacket representing ${nation} with their national colors and crest on the chest`;
  }

  return `A professional candid lifestyle photograph of a fan in the stadium stands, wearing ${details}. They are celebrating a goal, soft natural sunlight, shallow depth of field, realistic textures, premium editorial sports photography.`;
}

function generateBatchCPrompt(title, type) {
  const t = title.toLowerCase();
  
  if (t.includes('almond latte')) {
    let item = 'iPhone case';
    if (t.includes('ipad')) item = 'iPad case';
    else if (t.includes('kindle')) item = 'Kindle case';
    else if (t.includes('airpods')) item = 'AirPods case';
    else if (t.includes('sleeve')) item = 'laptop sleeve';
    else if (t.includes('ring holder')) item = 'magnetic ring holder';
    else if (t.includes('yoga mat')) item = 'yoga mat';
    
    if (item === 'yoga mat') {
      return `A professional lifestyle photo of a high-end yoga mat with a beige and black spotted pattern (leopard-print style). The mat is rolled out on a clean, light-filled wooden floor of a modern yoga studio with plants in the background, soft natural sunlight, serene atmosphere.`;
    }
    
    return `A professional lifestyle flat-lay photograph of a ${item}. The accessory features a stylish beige background with black leopard-print spots (Almond Latte design). It is lying on a rustic wooden coffee table in a modern aesthetic cafe, next to a warm latte cup with latte art and some green monstera leaves, soft natural lighting, editorial product photography.`;
  }
  
  if (t.includes('feeder') || t.includes('fountain')) {
    return `A lifestyle photo of a modern smart pet feeder and water fountain placed on a clean kitchen floor. A cute fluffy cat or dog is eating contentedly, bright kitchen interior, soft natural light, warm and cozy domestic scene.`;
  }
  
  if (t.includes('massager')) {
    return `A professional lifestyle photo of a rechargeable shiatsu back and neck massager pillow. It is resting on a cozy grey fabric armchair in a warmly lit living room, inviting atmosphere, editorial home decor photography.`;
  }
  
  if (t.includes('plant moisture') || t.includes('moisture meter')) {
    return `A lifestyle photo of a smart digital wireless plant moisture meter inserted into the soil of a beautiful potted houseplant (like a fiddle leaf fig) in a bright, modern living room next to a window, soft sunrays, clean aesthetic.`;
  }
  
  if (t.includes('watch') || t.includes('tracker')) {
    return `A lifestyle close-up photo of a person's wrist wearing a sleek black smart watch fitness tracker. They are outdoors on a morning run, blurred green nature trail in the background, bright natural morning sunlight.`;
  }

  if (t.includes('rangefinder')) {
    return `A lifestyle photo of a hunting laser rangefinder resting on a camo backpack in the forest during autumn, warm morning fog, hunting gear, outdoor adventure photography.`;
  }

  if (t.includes('chicken waterer')) {
    return `A lifestyle photo of automatic chicken waterer cups installed on a container in a clean backyard chicken coop, with chickens drinking water, natural outdoor lighting, authentic homestead scene.`;
  }

  if (t.includes('camera') || t.includes('shaver')) {
    return `A lifestyle photo of a smart shaver placed on a clean bathroom vanity marble countertop next to a sink, modern bright bathroom interior.`;
  }
  
  return `A premium product lifestyle photograph of ${title}. It is placed in a natural, real-world context where it would actually be used, with beautiful soft lighting, shallow depth of field, and a clean, modern aesthetic.`;
}

async function downloadImage(url, destPath) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(25000)
  });
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
          width: 1024,
          height: 1024,
          num_inference_steps: 4
        }
      }),
      signal: AbortSignal.timeout(25000)
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
      },
      signal: AbortSignal.timeout(25000)
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
        commitCheckpoint(state.batch, state.index, products.length, 'transitioned');
        continue;
      } else if (state.batch === 'B') {
        console.log('--- Batch B complete! Transitioning to Batch C. ---');
        state.batch = 'C';
        state.index = 0;
        saveCheckpoint(state);
        commitCheckpoint(state.batch, state.index, products.length, 'transitioned');
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
      commitCheckpoint(state.batch, state.index, products.length, 'skipped');
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
    const status = state.failedIds.includes(product.id) ? 'failed' : 'ok';
    commitCheckpoint(state.batch, state.index, products.length, status);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
