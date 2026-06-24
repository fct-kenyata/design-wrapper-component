// Copies the self-hosted Geist font files next to the built stylesheet so the
// standalone `dist/design-system.css` (the zero-config drop-in path) can resolve
// its `url(./files/geist-*.woff2)` @font-face references. The source-consumption
// path (importing design-system.css through the host bundler) doesn't need this
// — bundlers resolve the fonts from node_modules directly.
import { mkdirSync, readdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'dist', 'files');
const sources = [
  join(root, 'node_modules', '@fontsource-variable', 'geist', 'files'),
  join(root, 'node_modules', '@fontsource-variable', 'geist-mono', 'files'),
];

mkdirSync(outDir, { recursive: true });

let copied = 0;
for (const dir of sources) {
  if (!existsSync(dir)) {
    console.warn(`[copy-fonts] skipped missing source: ${dir}`);
    continue;
  }
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.woff2') && !file.endsWith('.woff')) continue;
    copyFileSync(join(dir, file), join(outDir, file));
    copied++;
  }
}

console.log(`[copy-fonts] copied ${copied} font files → dist/files/`);
