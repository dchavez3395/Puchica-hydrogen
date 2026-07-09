import { createJimp } from '@jimp/core';
import { defaultFormats, defaultPlugins } from 'jimp';
import webp from '@jimp/wasm-webp';
import { join } from 'node:path';

const CustomJimp = createJimp({
  formats: [...defaultFormats, webp],
  plugins: defaultPlugins,
});

async function main() {
  const filePath = join('work', 'ring_holder_generated.png');
  console.log('Reading image:', filePath);
  const img = await CustomJimp.read(filePath);
  console.log('Successfully read WebP image!');
  console.log('Dimensions:', img.width, 'x', img.height);
}

main().catch(console.error);
