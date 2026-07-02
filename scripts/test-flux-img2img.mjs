import dotenv from 'dotenv';
dotenv.config();

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN is missing in env.');
  process.exit(1);
}

const version = "54a0e1e1841cbb8c4ef226bd5e197798bef44acd0f63ed38338bda222205a7b0";
const refUrl = "https://cdn.shopify.com/s/files/1/0842/2644/1466/files/A385QFF.jpg?v=1781887907"; // Canada Cap
const prompt = "A candid, close-up lifestyle photo of a person wearing this red Canada World Cup baseball cap. They are celebrating in the stadium stands, soft natural lighting, depth of field, realistic textures, high detail product photography.";

async function runTest() {
  console.log('Creating Replicate Flux prediction...');
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version,
      input: {
        prompt: prompt,
        image: refUrl,
        strength: 0.75, // Flux is very strong, 0.75 preserves cap details while replacing background
        width: 1024,
        height: 1024,
        num_inference_steps: 4
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
      
      console.log('Downloading generated image to work/test_flux_img2img.png...');
      const imgRes = await fetch(pollJson.output[0]);
      const buf = await imgRes.arrayBuffer();
      import('fs').then(fs => {
        fs.writeFileSync('work/test_flux_img2img.png', Buffer.from(buf));
        console.log('Image saved to work/test_flux_img2img.png!');
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
