import dotenv from 'dotenv';
dotenv.config();

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
if (!REPLICATE_API_TOKEN) {
  console.error('Error: REPLICATE_API_TOKEN is missing in env.');
  process.exit(1);
}

const MODEL_VERSION = "b1c17d148455c1fda435ababe9ab1e03bc0d917cc3cf4251916f22c45c83c7df"; // logerzhu/ad-inpaint
const subjectUrl = "https://cdn.shopify.com/s/files/1/0842/2644/1466/files/A385QFF.jpg?v=1781887907"; // Canada Cap
const prompt = "The product is a red Canada baseball cap. It is worn by a fan in the stadium stands, soft natural sunlight, shallow depth of field, premium editorial sports photography.";

async function runTest() {
  console.log('Creating Replicate prediction using logerzhu/ad-inpaint...');
  const res = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        image_path: subjectUrl,
        prompt: prompt,
        pixel: "768 * 768",
        scale: 3,
        image_num: 1,
        num_inference_steps: 25
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
      const outputUrl = Array.isArray(pollJson.output) ? pollJson.output[0] : pollJson.output;
      console.log('Output image URL:', outputUrl);
      
      console.log('Downloading generated image to work/test_ad_inpaint.png...');
      const imgRes = await fetch(outputUrl);
      const buf = await imgRes.arrayBuffer();
      import('fs').then(fs => {
        fs.writeFileSync('work/test_ad_inpaint.png', Buffer.from(buf));
        console.log('Image saved to work/test_ad_inpaint.png!');
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
