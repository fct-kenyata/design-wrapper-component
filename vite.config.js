import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

// Dev-only playground config. Has NO effect on how the library is consumed
// (consumers import source via their own bundler + the prebuilt CSS).
export default defineConfig({
  root: 'playground',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Mirror the consumer's @design-pattern alias so not-yet-migrated
      // components (which self-reference it) resolve here too.
      '@design-pattern': root,
      '@': root,
    },
  },
  server: {
    port: 5180,
    fs: { allow: [root] },
  },
});
