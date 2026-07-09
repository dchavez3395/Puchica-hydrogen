import dotenv from 'dotenv';
dotenv.config();

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN is missing in env.');
  process.exit(1);
}

const MODEL_VERSION = "cd7bf1ce29ad3a9d8ac03d1d5b62a6bfa7b13c1cdc1b44784ebb481c621db966"; // gbieler/change-background-and-relight
const subjectUrl = "https://cdn.shopify.com/s/files/1/0842/2644/1466/files/A385QFF.jpg?v=1781887907"; // Canada Cap
const backgroundPrompt = "A fan wearing this red Canada baseball cap, celebrating in stadium stands, soft natural lighting, shallow depth of field, realistic textures, sports photography.";
const lightPrompt = "soft natural sun rays, matching shadows";

async function runTest() {
  console.log('Creating Replicate prediction using gbieler/change-background-and-relight...');
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        subject_image: subjectUrl,
        background_prompt: backgroundPrompt,
        light_prompt: lightPrompt,
        denoise_strength: 0.7
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
      console.log('Output image URL:', pollJson.output);
      
      console.log('Downloading generated image to work/test_change_bg.png...');
      const imgRes = await fetch(pollJson.output);
      const buf = await imgRes.arrayBuffer();
      import('fs').then(fs => {
        fs.writeFileSync('work/test_change_bg.png', Buffer.from(buf));
        console.log('Image saved to work/test_change_bg.png!');
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
