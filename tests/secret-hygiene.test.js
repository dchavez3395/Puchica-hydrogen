import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {extname} from 'node:path';

const TEXT_EXTENSIONS = new Set([
  '.csv',
  '.env',
  '.html',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mjs',
  '.py',
  '.sh',
  '.toml',
  '.txt',
  '.yaml',
  '.yml',
]);

const SECRET_PATTERNS = [
  ['Shopify Admin token', /shpat_[A-Za-z0-9_-]{12,}/],
  ['Shopify shared secret', /shpss_[A-Za-z0-9_-]{12,}/],
  ['Shopify app token', /shpca_[A-Za-z0-9_-]{12,}/],
];

test('tracked text files contain no recognizable Shopify secrets', () => {
  const files = execFileSync('git', ['ls-files', '-z'], {encoding: 'utf8'})
    .split('\0')
    .filter(Boolean)
    .filter((file) =>
      file.startsWith('.env.') || TEXT_EXTENSIONS.has(extname(file).toLowerCase()),
    );
  const findings = [];

  for (const file of files) {
    // Local Codex workspaces may use a sparse checkout; CI scans the complete
    // tree. Skip paths not materialized in the current working directory.
    if (!existsSync(file)) continue;
    const source = readFileSync(file, 'utf8');
    for (const [label, pattern] of SECRET_PATTERNS) {
      if (pattern.test(source)) findings.push(`${file}: ${label}`);
    }
  }

  assert.deepEqual(findings, [], `Remove exposed credentials:\n${findings.join('\n')}`);
});

test('tracked JavaScript never interpolates credential variables into logs', () => {
  const files = execFileSync('git', ['ls-files', '-z', '*.js', '*.jsx', '*.mjs'], {
    encoding: 'utf8',
  })
    .split('\0')
    .filter(Boolean)
    .filter(existsSync);
  const credentialLog =
    /console\.(?:log|info|warn|error)\s*\(\s*`[^`]*\$\{[^}]*(?:token|secret|password|api_?key)[^}]*\}[^`]*`/i;
  const findings = files.filter((file) =>
    credentialLog.test(readFileSync(file, 'utf8')),
  );

  assert.deepEqual(
    findings,
    [],
    `Never print credential-bearing variables:\n${findings.join('\n')}`,
  );
});
