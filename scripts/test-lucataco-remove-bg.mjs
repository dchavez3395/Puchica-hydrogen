import dotenv from 'dotenv';
import {requirePaidGenerationConfirmation} from './lib/paid-action-guard.mjs';
dotenv.config();

requirePaidGenerationConfirmation();

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN is missing in env.');
  process.exit(1);
}

const subjectUrl = "https://cdn.shopify.com/s/files/1/0842/2644/1466/files/LC_15RH_Gunmetal_1.jpg"; // Clover ring holder

async function main() {
  console.log('Calling lucataco/remove-bg...');
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: "95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
      input: {
        image: subjectUrl
      }
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API HTTP ${res.status}: ${text}`);
  }

  const json = await res.json();
  const predictionId = json.id;
  console.log(`Prediction ID: ${predictionId}. Polling...`);

  while (true) {
    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`
      }
    });
    const pollJson = await pollRes.json();
    const status = pollJson.status;
    console.log(`  Status: ${status}`);

    if (status === 'succeeded') {
      const outputUrl = Array.isArray(pollJson.output) ? pollJson.output[0] : pollJson.output;
      console.log('Output URL:', outputUrl);

      // Download and check magic bytes
      const imgRes = await fetch(outputUrl);
      const ab = await imgRes.arrayBuffer();
      const buf = Buffer.from(ab);
      console.log('Downloaded size:', buf.length, 'bytes');
      console.log('Magic bytes (hex):', buf.subarray(0, 12).toString('hex'));
      console.log('Magic bytes (ASCII):', buf.subarray(0, 12).toString('ascii'));
      break;
    } else if (status === 'failed' || status === 'canceled') {
      console.error('Failed:', pollJson.error);
      break;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}

main().catch(console.error);
