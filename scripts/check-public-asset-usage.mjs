import {readdir, readFile, stat} from 'node:fs/promises';
import path from 'node:path';

const PUBLIC_DIRECTORY = path.resolve('public');
const SOURCE_EXTENSIONS = new Set(['.css', '.js', '.jsx', '.json', '.ts', '.tsx']);

async function walk(directory) {
  const output = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const candidate = path.resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await walk(candidate)));
    else output.push(candidate);
  }
  return output;
}

const publicFiles = (await walk(PUBLIC_DIRECTORY)).filter(
  (file) => path.basename(file) !== '.gitkeep',
);
const sourceFiles = (await walk(path.resolve('app'))).filter((file) =>
  SOURCE_EXTENSIONS.has(path.extname(file)),
);
for (const candidate of ['server.js', 'vite.config.js']) {
  sourceFiles.push(path.resolve(candidate));
}

const sources = await Promise.all(sourceFiles.map((file) => readFile(file, 'utf8')));
const unusedFiles = publicFiles.filter((file) => {
    const publicPath = `/${path.relative(PUBLIC_DIRECTORY, file).replaceAll('\\', '/')}`;
    return !sources.some((source) => source.includes(publicPath));
  });
const unused = await Promise.all(
  unusedFiles.map(async (file) => ({
    path: path.relative('.', file).replaceAll('\\', '/'),
    bytes: (await stat(file)).size,
  })),
);

console.log(
  JSON.stringify(
    {
      publicAssetCount: publicFiles.length,
      unusedAssetCount: unused.length,
      unusedBytes: unused.reduce((sum, item) => sum + item.bytes, 0),
      unused,
    },
    null,
    2,
  ),
);

if (unused.length > 0) process.exitCode = 1;
