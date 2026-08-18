// scripts/batch-runner-hybrid.mjs
//
// Automated Hybrid Compositing Runner for Batch C and beyond.
// Preserves rigid products (phone cases, ring holders, electronics, etc.) 
// with 1/1 accuracy by removing backgrounds, generating flat backdrops, 
// compositing them, and uploading to Shopify.

import dotenv from 'dotenv';
dotenv.config();

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import {requirePaidGenerationConfirmation} from './lib/paid-action-guard.mjs';
import { createJimp } from '@jimp/core';
import { defaultFormats, defaultPlugins } from 'jimp';
import webp from '@jimp/wasm-webp';
import { adminGraphQL } from './shopify-oauth.mjs';

requirePaidGenerationConfirmation();

const CHECKPOINT_PATH = join('work', 'checkpoint.json');
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

// Initialize Custom Jimp with WebP decoding support
const Jimp = createJimp({
  formats: [...defaultFormats, webp],
  plugins: defaultPlugins,
});

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
    batch: 'C',
    index: 0,
    doneIds: [],
    failedIds: []
  };
}

function saveCheckpoint(state) {
  mkdirSync('work', { recursive: true });
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(state, null, 2));
}

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
    const staged = execSync('git add work/checkpoint.json work/failed_images.txt && git diff --cached --name-only', { encoding: 'utf8' }).trim();
    if (!staged) return;
    const msg = `chore(automation): checkpoint hybrid batch ${batch} ${index}/${total} (${status})`;
    execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
  } catch (e) {
    console.warn(`  [git] Auto-commit failed (non-fatal): ${e.message?.split('\n')[0]}`);
  }
}

// Generate category-specific background prompts and compositing configs
function getHybridConfig(title, productType) {
  const t = title.toLowerCase();
  
  // 1. Phone Cases
  if (productType?.toLowerCase().includes('case') || t.includes('case') || t.includes('cover') || t.includes('sleeve')) {
    let deviceName = 'smartphone';
    if (t.includes('ipad') || t.includes('tablet')) deviceName = 'iPad tablet';
    else if (t.includes('kindle')) deviceName = 'Kindle e-reader';
    else if (t.includes('buds') || t.includes('pods')) deviceName = 'earbuds case';

    return {
      prompt: `A premium top-down flat-lay photograph of the back of a clean, matte black ${deviceName} resting flat in the center of a rustic wooden office desk. No hands, no human body parts, no fingers, clean empty scene. Minimalist desk accessories are neatly organized around it, soft natural side lighting, realistic textures, high-end catalog style.`,
      scalePercent: 0.45,
      yOffsetPercent: 0.5 // Centered
    };
  }

  // 2. Phone Ring Holders
  if (t.includes('ring holder') || t.includes('ring-holder') || t.includes('magsafe ring')) {
    return {
      prompt: "A premium top-down flat-lay photograph of the back of a clean, matte black smartphone resting flat in the center of a rustic wooden office desk. No hands, no human body parts, no fingers, clean empty scene. Minimalist desk accessories are neatly organized around it, soft natural side lighting, realistic textures, high-end catalog style.",
      scalePercent: 0.22,
      yOffsetPercent: 0.5 // Centered on the back of the phone
    };
  }

  // 3. Clocks & Clocks/Sensors
  if (t.includes('clock') || t.includes('sensor') || t.includes('weather station')) {
    return {
      prompt: "A professional lifestyle photograph of a clean, brightly lit modern living room or kitchen counter. Minimalist home decor items, soft morning light filtering through a window, clean aesthetic, no people, no hands, empty counter.",
      scalePercent: 0.35,
      yOffsetPercent: 0.7 // Place it resting on the counter/table
    };
  }

  // 4. Massage Chairs
  if (t.includes('massage chair') || t.includes('chair') || t.includes('seat')) {
    return {
      prompt: "A high-end, spacious modern living room with large windows showing green gardens outside. Sunbeams lighting up the room, oak wood floors, luxury interior design editorial, empty room, no people.",
      scalePercent: 0.55,
      yOffsetPercent: 0.75 // Place resting on the floor
    };
  }

  // 5. Pillows & Bedding
  if (t.includes('pillow') || t.includes('wedge') || t.includes('bedding')) {
    return {
      prompt: "A cozy, bright master bedroom with a neatly made bed, clean white linen sheets, morning sunlight coming through a side window, warm and inviting atmosphere, no people, no hands.",
      scalePercent: 0.45,
      yOffsetPercent: 0.65 // Resting on the bed
    };
  }

  // Default fallback (Generic Home/Office Goods)
  return {
    prompt: `A professional lifestyle photograph of a minimalist wood and marble kitchen countertop or desk surface. Cozy home environment in the background, soft warm lighting, shallow depth of field, premium editorial catalog photography, no hands, no people.`,
    scalePercent: 0.40,
    yOffsetPercent: 0.7 // Resting on the surface
  };
}

async function runPrediction(versionHash, inputPayload) {
  let predictionId = null;
  while (true) {
    const res = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: versionHash,
        input: inputPayload
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (res.status === 429) {
      const errJson = await res.json().catch(() => ({}));
      const retryAfter = errJson.retry_after || 3;
      console.log(`  [429 Throttled] Replicate rate limit hit. Waiting ${retryAfter}s...`);
      await new Promise(r => setTimeout(r, (retryAfter + 1) * 1000));
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
      await new Promise(r => setTimeout(r, 3000));
      continue;
    }

    const pollJson = await pollRes.json();
    const status = pollJson.status;

    if (status === 'succeeded') {
      return Array.isArray(pollJson.output) ? pollJson.output[0] : pollJson.output;
    } else if (status === 'failed' || status === 'canceled') {
      throw new Error(`Prediction failed: ${pollJson.error}`);
    }

    await new Promise(r => setTimeout(r, 2000));
  }
}

async function downloadToBuffer(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
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
      tags: ['for-you-hybrid']
    });
    if (res?.data?.tagsAdd?.userErrors?.length) {
      console.warn(`[WARN] Failed to tag product: ${JSON.stringify(res.data.tagsAdd.userErrors)}`);
    } else {
      console.log(`  Tagged product with 'for-you-hybrid'.`);
    }
  } catch (err) {
    console.warn(`[WARN] Tag request failed: ${err.message}`);
  }
}

async function main() {
  let state = loadCheckpoint();
  mkdirSync('work', { recursive: true });

  const removeBgVersion = "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1"; // lucataco/remove-bg
  const fluxSchnellVersion = "54a0e1e1841cbb8c4ef226bd5e197798bef44acd0f63ed38338bda222205a7b0"; // black-forest-labs/flux-schnell

  while (true) {
    const productsPath = join('work', `batch_${state.batch.toLowerCase()}_pending.json`);
    if (!existsSync(productsPath)) {
      console.log(`Finished active batches. Pending file does not exist: ${productsPath}`);
      break;
    }

    const products = JSON.parse(readFileSync(productsPath, 'utf8'));
    if (state.index >= products.length) {
      const currentLetter = state.batch.toUpperCase();
      const nextLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
      const nextPath = join('work', `batch_${nextLetter.toLowerCase()}_pending.json`);
      if (existsSync(nextPath)) {
        console.log(`--- Batch ${currentLetter} complete! Transitioning to Batch ${nextLetter}. ---`);
        state.batch = nextLetter;
        state.index = 0;
        saveCheckpoint(state);
        commitCheckpoint(state.batch, state.index, products.length, 'transitioned');
        continue;
      } else {
        console.log(`--- ALL BATCHES COMPLETE! No pending file found for Batch ${nextLetter} (${nextPath}) ---`);
        break;
      }
    }

    const product = products[state.index];
    console.log(`\n--- [Hybrid Batch ${state.batch}] Processing ${state.index + 1}/${products.length}: ${product.title} ---`);
    
    // Find the first image that is NOT a generated one (i.e. does NOT contain "/hf_" in the filename)
    let refUrl = null;
    const imagesList = product.images?.edges || [];
    for (const edge of imagesList) {
      const url = edge.node?.url;
      if (url && !url.includes('/hf_')) {
        refUrl = url;
        break;
      }
    }
    
    if (!refUrl) {
      refUrl = product.featuredImage?.url || (imagesList[0]?.node?.url);
    }

    if (!refUrl) {
      console.log(`[WARN] No reference image found. Skipping.`);
      state.failedIds.push(product.id);
      state.index++;
      saveCheckpoint(state);
      commitCheckpoint(state.batch, state.index, products.length, 'skipped');
      continue;
    }

    const config = getHybridConfig(product.title, product.productType);

    try {
      console.log(`  1. Removing background from product image...`);
      const cutoutUrl = await runPrediction(removeBgVersion, { image: refUrl });

      console.log(`  2. Generating lifestyle background...`);
      const bgUrl = await runPrediction(fluxSchnellVersion, {
        prompt: config.prompt,
        width: 1024,
        height: 1024,
        num_inference_steps: 4,
        output_format: "png"
      });

      console.log(`  3. Downloading components...`);
      const [cutoutBuffer, bgBuffer] = await Promise.all([
        downloadToBuffer(cutoutUrl),
        downloadToBuffer(bgUrl)
      ]);

      console.log(`  4. Compositing locally using Jimp...`);
      const [bgImage, cutoutImage] = await Promise.all([
        Jimp.read(bgBuffer),
        Jimp.read(cutoutBuffer)
      ]);

      // Crop transparent space around the product cutout to ensure consistent sizing
      cutoutImage.autocrop(0.02);

      const targetSize = Math.floor(bgImage.width * config.scalePercent);
      cutoutImage.resize({ w: targetSize, h: targetSize });

      const x = Math.floor((bgImage.width - targetSize) / 2);
      const y = Math.floor((bgImage.height * config.yOffsetPercent) - (targetSize / 2));

      bgImage.composite(cutoutImage, x, y);

      const tempGenPath = join('work', 'temp_gen.jpg');
      const finalBuffer = await bgImage.getBuffer('image/jpeg', { quality: 90 });
      writeFileSync(tempGenPath, finalBuffer);

      console.log(`  5. Attaching to Shopify product...`);
      execSync(`node --env-file=.env scripts/process-image.mjs "${product.id}" "${tempGenPath}" "${product.title}"`, { stdio: 'inherit' });
      
      console.log(`  6. Tagging product...`);
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
