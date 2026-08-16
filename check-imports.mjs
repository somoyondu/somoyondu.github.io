import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const roots = { 'somoyon-admin': 'somoyon-admin/src', 'somoyon-api': 'somoyon-api/src' };
const files = execSync('find somoyon-api/src somoyon-admin/src src -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.js" \\)')
  .toString().trim().split('\n');

const EXT = ['', '.ts', '.tsx', '.jsx', '.js', '/index.ts', '/index.tsx', '/index.jsx', '/index.js'];
let missing = 0;

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const specs = [...src.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
  for (const spec of specs) {
    let target = null;
    if (spec.startsWith('.')) target = path.resolve(path.dirname(f), spec);
    else if (spec.startsWith('@/')) target = path.resolve('somoyon-admin/src', spec.slice(2));
    else if (spec.startsWith('src/')) target = path.resolve('somoyon-api', spec);
    if (!target) continue;
    if (!EXT.some(e => existsSync(target + e))) {
      console.error(`MISSING  ${f}  ->  ${spec}`);
      missing++;
    }
  }
}
console.log(`\nchecked ${files.length} files, ${missing} unresolved imports`);
