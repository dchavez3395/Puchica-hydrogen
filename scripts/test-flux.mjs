import dotenv from 'dotenv';
dotenv.config();

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN is missing in env.');
  process.exit(1);
}

// Flux Schnell is a highly realistic text-to-image model
const model = "black-forest-labs/flux-schnell";
const prompt = "A professional lifestyle flat-lay photograph of an iPhone case. The case has a cute beige background with black leopard-print spots (Almond Latte pattern). The phone case is lying on a rustic wooden coffee table in a cozy cafe, next to a warm latte cup and green plant leaves, soft natural lighting, premium editorial product photography.";

async function runTest() {
  console.log('Creating Replicate Flux prediction...');
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      input: {
        prompt: prompt,
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
      
      console.log('Downloading generated image to work/test_flux.png...');
      const imgRes = await fetch(pollJson.output[0]);
      const buf = await imgRes.arrayBuffer();
      import('fs').then(fs => {
        fs.writeFileSync('work/test_flux.png', Buffer.from(buf));
        console.log('Image saved to work/test_flux.png!');
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
