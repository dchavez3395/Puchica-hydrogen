import dotenv from 'dotenv';
dotenv.config();

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createJimp } from '@jimp/core';
import { defaultFormats, defaultPlugins } from 'jimp';
import webp from '@jimp/wasm-webp';

const Jimp = createJimp({
  formats: [...defaultFormats, webp],
  plugins: defaultPlugins,
});

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN is missing in env.');
  process.exit(1);
}

// URLs and Prompts
const productImageUrl = "https://cdn.shopify.com/s/files/1/0842/2644/1466/files/LC_15RH_Gunmetal_1.jpg"; // Green clover ring holder
const backgroundPrompt = "A premium top-down flat-lay photograph of the back of a clean, matte black smartphone resting flat in the center of a rustic wooden office desk. Minimalist desk accessories are neatly organized around it, soft natural side lighting, realistic textures, high-end catalog style.";

async function runPrediction(modelName, inputPayload) {
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: modelName,
      input: inputPayload
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Replicate API failed (HTTP ${res.status}): ${text}`);
  }

  const json = await res.json();
  const predictionId = json.id;
  console.log(`[${modelName}] Prediction created! ID: ${predictionId}`);

  while (true) {
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`
      }
    });

    if (!pollRes.ok) {
      console.error(`Poll failed: ${pollRes.statusText}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      continue;
    }

    const pollJson = await pollRes.json();
    const status = pollJson.status;
    console.log(`  [${modelName}] Status: ${status}`);

    if (status === 'succeeded') {
      return Array.isArray(pollJson.output) ? pollJson.output[0] : pollJson.output;
    } else if (status === 'failed' || status === 'canceled') {
      throw new Error(`[${modelName}] Prediction failed: ${pollJson.error}`);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function downloadToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.statusText}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function main() {
  try {
    console.log('Step 1: Removing background from the product image...');
    const cutoutUrl = await runPrediction('95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1', {
      image: productImageUrl
    });
    console.log(`Cutout URL: ${cutoutUrl}`);

    console.log('\nStep 2: Generating lifestyle background scene...');
    const bgUrl = await runPrediction('54a0e1e1841cbb8c4ef226bd5e197798bef44acd0f63ed38338bda222205a7b0', {
      prompt: backgroundPrompt,
      width: 1024,
      height: 1024,
      num_inference_steps: 4,
      output_format: "png"
    });
    console.log(`Background URL: ${bgUrl}`);

    console.log('\nStep 3: Downloading both images...');
    const [cutoutBuffer, bgBuffer] = await Promise.all([
      downloadToBuffer(cutoutUrl),
      downloadToBuffer(bgUrl)
    ]);

    // Save intermediate images for debugging/verification
    writeFileSync(join('work', 'hybrid_cutout.png'), cutoutBuffer);
    writeFileSync(join('work', 'hybrid_bg.png'), bgBuffer);
    console.log('Saved intermediate images to work/hybrid_cutout.png and work/hybrid_bg.png');

    console.log('\nStep 4: Compositing images locally using Jimp...');
    const [bgImage, cutoutImage] = await Promise.all([
      Jimp.read(bgBuffer),
      Jimp.read(cutoutBuffer)
    ]);

    // Scale the ring holder. In this flat lay, let's make it a realistic size
    // e.g. 220x220 pixels (about 20% of the 1024x1024 background width)
    const targetSize = 220;
    cutoutImage.resize({ w: targetSize, h: targetSize });

    // Place the ring holder. We'll center it on the background.
    const x = Math.floor((bgImage.width - targetSize) / 2);
    const y = Math.floor((bgImage.height - targetSize) / 2);

    bgImage.composite(cutoutImage, x, y);

    const finalPath = join('work', 'hybrid_final.png');
    const finalBuffer = await bgImage.getBuffer('image/png');
    writeFileSync(finalPath, finalBuffer);
    console.log(`\n🎉 SUCCESS: Combined image saved to ${finalPath}`);
  } catch (err) {
    console.error('Pipeline failed:', err);
  }
}

main();
