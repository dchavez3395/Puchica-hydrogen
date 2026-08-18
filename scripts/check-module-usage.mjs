import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

async function sourceFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const candidate = path.resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await sourceFiles(candidate)));
    else if (EXTENSIONS.includes(path.extname(entry.name))) output.push(candidate);
  }
  return output;
}

const files = await sourceFiles('app');
const fileSet = new Set(files);
const referenced = new Set();
const importPattern = /(?:from\s*|import\s*\(|import\s+)\s*['"]([^'"]+)['"]/g;
const routeFilePattern = /\bfile:\s*['"]([^'"]+)['"]/g;

function resolveLocalImport(importer, specifier) {
  let base;
  if (specifier.startsWith('~/')) base = path.resolve('app', specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(importer), specifier);
  else return null;

  for (const candidate of [
    base,
    ...EXTENSIONS.map((extension) => `${base}${extension}`),
    ...EXTENSIONS.map((extension) => path.join(base, `index${extension}`)),
  ]) {
    if (fileSet.has(candidate)) return candidate;
  }
  return null;
}

const importSources = [...files, path.resolve('server.js')];
for (const file of importSources) {
  const source = await readFile(file, 'utf8');
  for (const match of source.matchAll(importPattern)) {
    const resolved = resolveLocalImport(file, match[1]);
    if (resolved) referenced.add(resolved);
  }
  if (path.basename(file) === 'routes.js') {
    for (const match of source.matchAll(routeFilePattern)) {
      const resolved = resolveLocalImport(file, `./${match[1]}`);
      if (resolved) referenced.add(resolved);
    }
  }
}

// React Router route modules and runtime entry points are discovered by the
// framework rather than imported by application source.
for (const file of files) {
  const relative = path.relative('app', file).replaceAll('\\', '/');
  if (
    relative.startsWith('routes/') ||
    /^entry\.(client|server)\./.test(relative) ||
    /^root\./.test(relative) ||
    /^routes\./.test(relative)
  ) {
    referenced.add(file);
  }
}

const unreferenced = files
  .filter((file) => !referenced.has(file))
  .map((file) => path.relative('.', file).replaceAll('\\', '/'))
  .sort();

console.log(
  JSON.stringify(
    {moduleCount: files.length, unreferencedCount: unreferenced.length, unreferenced},
    null,
    2,
  ),
);

if (unreferenced.length > 0) process.exitCode = 1;
