import {readdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import * as espree from 'espree';

import {DICTIONARIES} from '../app/lib/dictionaries.js';

const ROOTS = ['app', 'tests', 'scripts'];
const EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);
const EXCLUDED = new Set([
  path.resolve('app/lib/dictionaries.js'),
  path.resolve('scripts/check-dictionary-usage.mjs'),
]);

// These keys are selected through bounded template expressions in current UI.
const DYNAMIC_PREFIXES = ['about_delivery_step_', 'product_copy_'];

async function sourceFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await sourceFiles(candidate)));
    else if (EXTENSIONS.has(path.extname(entry.name))) output.push(candidate);
  }
  return output;
}

const files = (await Promise.all(ROOTS.map(sourceFiles)))
  .flat()
  .filter((file) => !EXCLUDED.has(path.resolve(file)));
const sources = await Promise.all(files.map((file) => readFile(file, 'utf8')));
const corpus = sources.join('\n');
const keys = Object.keys(DICTIONARIES.en);
const unused = keys.filter(
  (key) =>
    !corpus.includes(key) &&
    !DYNAMIC_PREFIXES.some((prefix) => key.startsWith(prefix)),
);

const apply = process.argv.includes('--apply');
const confirmed = process.argv.includes('--confirm-unused-keys');
if (apply && !confirmed) {
  throw new Error(
    'Refusing to rewrite dictionaries without --confirm-unused-keys.',
  );
}

if (apply && unused.length) {
  const dictionaryPath = path.resolve('app/lib/dictionaries.js');
  let source = await readFile(dictionaryPath, 'utf8');
  const ast = espree.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    range: true,
  });
  const declaration = ast.body
    .filter((node) => node.type === 'ExportNamedDeclaration')
    .flatMap((node) => node.declaration?.declarations || [])
    .find((node) => node.id?.name === 'DICTIONARIES');
  const localeObjects = declaration?.init?.properties
    ?.map((property) => property.value)
    .filter((value) => value?.type === 'ObjectExpression');
  if (!localeObjects?.length) {
    throw new Error('Could not find locale objects in DICTIONARIES.');
  }

  const unusedSet = new Set(unused);
  const ranges = [];
  for (const localeObject of localeObjects) {
    const properties = localeObject.properties;
    for (let index = 0; index < properties.length; index += 1) {
      const property = properties[index];
      const key = property.key?.name ?? property.key?.value;
      if (!unusedSet.has(key)) continue;
      const end = properties[index + 1]?.range?.[0] ?? localeObject.range[1] - 1;
      ranges.push([property.range[0], end]);
    }
  }

  for (const [start, end] of ranges.sort((a, b) => b[0] - a[0])) {
    source = source.slice(0, start) + source.slice(end);
  }
  await writeFile(dictionaryPath, source);
}

const localeParity = Object.fromEntries(
  Object.entries(DICTIONARIES).map(([locale, dictionary]) => [
    locale,
    {
      missing: keys.filter((key) => !(key in dictionary)),
      extra: Object.keys(dictionary).filter((key) => !keys.includes(key)),
    },
  ]),
);

console.log(
  JSON.stringify(
    {
      totalEnglishKeys: keys.length,
      referencedKeys: keys.length - unused.length,
      unusedKeys: unused,
      applied: apply,
      localeParity,
    },
    null,
    2,
  ),
);
