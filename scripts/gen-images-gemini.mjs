/**
 * Generate an image with Gemini "Nano Banana" (gemini-2.5-flash-image)
 * and write it to disk.
 *
 * Usage:
 *   node --env-file=.env scripts/gen-images-gemini.mjs "<prompt>" <outfile.png>
 *
 * Reads the API key from GEMINI_BANANA_PRO in .env. Requires Node 18+
 * (uses global fetch). No external deps.
 */

import {requirePaidGenerationConfirmation} from './lib/paid-action-guard.mjs';

requirePaidGenerationConfirmation();

const MODEL = 'gemini-2.5-flash-image';
const KEY = process.env.GEMINI_BANANA_PRO;

const [, , prompt, outfile] = process.argv;

if (!KEY) {
  console.error('Missing GEMINI_BANANA_PRO in env. Run with: node --env-file=.env ...');
  process.exit(1);
}
if (!prompt || !outfile) {
  console.error('Usage: node --env-file=.env scripts/gen-images-gemini.mjs "<prompt>" <outfile.png>');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`;

const res = await fetch(url, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    contents: [{parts: [{text: prompt}]}],
  }),
});

if (!res.ok) {
  console.error(`HTTP ${res.status}`);
  console.error(await res.text());
  process.exit(1);
}

const data = await res.json();
const parts = data?.candidates?.[0]?.content?.parts ?? [];
const imagePart = parts.find((p) => p.inlineData?.data);

if (!imagePart) {
  const text = parts.map((p) => p.text).filter(Boolean).join('\n');
  console.error('No image returned. Model said:', text || JSON.stringify(data).slice(0, 500));
  process.exit(1);
}

const {writeFile, mkdir} = await import('node:fs/promises');
const {dirname} = await import('node:path');
await mkdir(dirname(outfile), {recursive: true});
await writeFile(outfile, Buffer.from(imagePart.inlineData.data, 'base64'));

console.log(`✓ wrote ${outfile} (${imagePart.inlineData.mimeType})`);
