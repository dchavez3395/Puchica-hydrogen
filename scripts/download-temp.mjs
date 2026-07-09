import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

async function main() {
  const origUrl = 'https://cdn.shopify.com/s/files/1/0842/2644/1466/files/LC_15RH_Gunmetal_1.jpg';
  const genUrl = 'https://cdn.shopify.com/s/files/1/0842/2644/1466/files/hf_1783142019868_9269953626362.png?v=1783142024';
  
  console.log(`Downloading original to work/ring_holder_original.jpg...`);
  let res = await fetch(origUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  let ab = await res.arrayBuffer();
  writeFileSync(join('work', 'ring_holder_original.jpg'), Buffer.from(ab));

  console.log(`Downloading generated to work/ring_holder_generated.png...`);
  res = await fetch(genUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  ab = await res.arrayBuffer();
  writeFileSync(join('work', 'ring_holder_generated.png'), Buffer.from(ab));
  
  console.log('Downloaded successfully.');
}

main().catch(console.error);
