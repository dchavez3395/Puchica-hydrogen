import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {oxygen} from '@shopify/mini-oxygen/vite';
import {reactRouter} from '@react-router/dev/vite';
import {fileURLToPath} from 'node:url';

export default defineConfig({
  plugins: [hydrogen(), oxygen(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      // fflate is a transitive dep of three-stdlib /
      // @react-three/drei. Its default ESM entry
      // (esm/index.mjs) starts with
      // `import{createRequire}from"module"`, which Vite
      // then auto-externalizes — and the Node `module`
      // builtin doesn't exist in the Oxygen Workers
      // runtime, so the deploy fails with
      // "No such module 'module' imported from
      // 'worker.mjs'". fflate's browser entry
      // (esm/browser.js) has the same API but no Node
      // import, so we alias to it for both dev and build.
      fflate: fileURLToPath(
        new URL(
          './node_modules/three-stdlib/node_modules/fflate/esm/browser.js',
          import.meta.url,
        ),
      ),
    },
  },
  build: {
    // Allow a strict Content-Security-Policy
    // without inlining assets as base64:
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      /**
       * Include dependencies here if they throw CJS<>ESM errors.
       * For example, for the following error:
       *
       * > ReferenceError: module is not defined
       * >   at /Users/.../node_modules/example-dep/index.js:1:1
       *
       * Include 'example-dep' in the array below.
       * @see https://vitejs.dev/config/dep-optimization-options
       */
      include: [
        'react-router > set-cookie-parser',
        'react-router > cookie',
        'react-router',
        'fflate',
      ],
    },
  },
  server: {
    allowedHosts: ['.tryhydrogen.dev'],
  },
});
