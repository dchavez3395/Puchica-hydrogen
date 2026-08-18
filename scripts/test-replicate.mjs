import dotenv from 'dotenv';
import {requirePaidGenerationConfirmation} from './lib/paid-action-guard.mjs';
dotenv.config();

requirePaidGenerationConfirmation();

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN is missing in env.');
  process.exit(1);
}

const modelVersion = "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";
const refUrl = "https://cdn.shopify.com/s/files/1/0842/2644/1466/files/A385QFF.jpg?v=1781887907";
const prompt = "Place the product in a natural, real-world lifestyle setting where it would actually be used. Show a fan wearing this Canada World Cup cap in a casual, real-world context — street celebration, watch party, or stadium stands. The product is clearly recognizable and in sharp focus, but the scene feels lived-in and authentic rather than staged. Use the reference image to identify what the product is, then place it convincingly in the moment of use.";

async function runTest() {
  console.log('Creating Replicate prediction...');
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: modelVersion,
      input: {
        prompt: prompt,
        image: refUrl,
        prompt_strength: 0.8,
        width: 1024,
        height: 1024,
        num_inference_steps: 30
      }
    })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Error: Replicate API failed (HTTP ${res.status}): ${text}`);
    process.exit(1);
  }

  const json = await res.json();
  const predictionId = json.id;
  console.log(`Prediction created! ID: ${predictionId}`);
  console.log(`Polling status...`);

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
    console.log(`  Status: ${status}`);

    if (status === 'succeeded') {
      console.log('Success!');
      console.log('Output image URL:', pollJson.output[0]);
      
      console.log('Downloading generated image to work/test_strength_80.png...');
      const imgRes = await fetch(pollJson.output[0]);
      const buf = await imgRes.arrayBuffer();
      import('fs').then(fs => {
        fs.writeFileSync('work/test_strength_80.png', Buffer.from(buf));
        console.log('Image saved to work/test_strength_80.png!');
      });
      break;
    } else if (status === 'failed' || status === 'canceled') {
      console.error('Prediction failed or canceled:', pollJson.error);
      process.exit(1);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

runTest().catch(console.error);
