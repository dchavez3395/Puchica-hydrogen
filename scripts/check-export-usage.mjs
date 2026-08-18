import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';

const EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);
const FRAMEWORK_EXPORTS = new Set([
  'action',
  'ErrorBoundary',
  'headers',
  'Layout',
  'links',
  'loader',
  'meta',
  'shouldRevalidate',
]);
const EXPORT_PATTERN =
  /^export\s+(?:async\s+)?(?:const|function|class)\s+([A-Za-z_$][\w$]*)/gm;

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const candidate = path.resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await walk(candidate)));
    else if (EXTENSIONS.has(path.extname(entry.name))) output.push(candidate);
  }
  return output;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const files = await walk('app');
const sources = await Promise.all(
  files.map(async (file) => ({file, source: await readFile(file, 'utf8')})),
);
const operationalFiles = [path.resolve('server.js'), ...(await walk('scripts'))];
const corpus = [
  ...sources.map(({source}) => source),
  ...(await Promise.all(operationalFiles.map((file) => readFile(file, 'utf8')))),
].join('\n');
const unreferenced = [];

for (const {file, source} of sources) {
  for (const match of source.matchAll(EXPORT_PATTERN)) {
    const name = match[1];
    if (FRAMEWORK_EXPORTS.has(name)) continue;
    const occurrences = corpus.match(new RegExp(`\\b${escapeRegExp(name)}\\b`, 'g'));
    if ((occurrences?.length ?? 0) === 1) {
      unreferenced.push({
        name,
        path: path.relative('.', file).replaceAll('\\', '/'),
      });
    }
  }
}

unreferenced.sort((a, b) => a.path.localeCompare(b.path) || a.name.localeCompare(b.name));
console.log(
  JSON.stringify(
    {
      exportedSymbolCount: sources.reduce(
        (count, {source}) => count + [...source.matchAll(EXPORT_PATTERN)].length,
        0,
      ),
      unreferencedExportCount: unreferenced.length,
      unreferenced,
    },
    null,
    2,
  ),
);

if (unreferenced.length > 0) process.exitCode = 1;
