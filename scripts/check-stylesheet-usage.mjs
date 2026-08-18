import {readdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';

const STYLESHEET = path.resolve('app/styles/app.css');
const SOURCE_ROOTS = ['app', 'tests'];
const SOURCE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs', '.ts', '.tsx']);
const CLASS_PATTERN = /\.([A-Za-z_][\w-]*)/g;

async function sourceFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (path.resolve(candidate) !== path.resolve('app/styles')) {
        output.push(...(await sourceFiles(candidate)));
      }
    } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      output.push(candidate);
    }
  }
  return output;
}

const files = (await Promise.all(SOURCE_ROOTS.map(sourceFiles))).flat();
const corpus = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join(
  '\n',
);
const source = await readFile(STYLESHEET, 'utf8');
const root = postcss.parse(source, {from: STYLESHEET});

function isReferenced(className) {
  if (!className.startsWith('pk-')) return true;
  if (corpus.includes(className)) return true;

  // Template expressions commonly append a bounded modifier after `--`.
  const modifierAt = className.lastIndexOf('--');
  return modifierAt !== -1 && corpus.includes(className.slice(0, modifierAt + 2));
}

const unusedClasses = new Set();
const removableRules = [];
root.walkRules((rule) => {
  if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) {
    return;
  }

  const selectors = rule.selectors || [rule.selector];
  const referencedSelectors = selectors.filter((selector) => {
    const classes = [...selector.matchAll(CLASS_PATTERN)].map((match) => match[1]);
    const unused = classes.filter((className) => !isReferenced(className));
    unused.forEach((className) => unusedClasses.add(className));
    return unused.length === 0;
  });

  if (referencedSelectors.length === 0) removableRules.push(rule);
  else if (referencedSelectors.length !== selectors.length) {
    rule.selectors = referencedSelectors;
  }
});

const apply = process.argv.includes('--apply');
const confirmed = process.argv.includes('--confirm-unused-selectors');
if (apply && !confirmed) {
  throw new Error(
    'Refusing to rewrite the stylesheet without --confirm-unused-selectors.',
  );
}

if (apply) {
  removableRules.forEach((rule) => rule.remove());
  root.walkAtRules((atRule) => {
    if (atRule.nodes?.length === 0) atRule.remove();
  });
  await writeFile(STYLESHEET, root.toString());
}

console.log(
  JSON.stringify(
    {
      stylesheetBytes: Buffer.byteLength(source),
      unusedClassCount: unusedClasses.size,
      removableRuleCount: removableRules.length,
      unusedClasses: [...unusedClasses].sort(),
      applied: apply,
    },
    null,
    2,
  ),
);
