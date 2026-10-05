# Local HEIC decoder

`libheif-bundle.js` is the unmodified browser/worker IIFE from
`libheif-js@1.23.5`, `libheif-wasm/libheif-bundle.js`. It includes the WASM
binary. Only a failed native HEIC/HEIF decode loads it; ordinary JPEG/PNG
and Safari-native HEIC do not incur this download. No CDN is used at runtime.

- Bundle: 2,044,206 bytes; local gzip measurement: 716,973 bytes.
- Bundle SHA-256: `074b2b55ef3de477ba9f794ca381f3f0324c1cba8c91b4af07395f39c22d54cc`.
- npm archive integrity verified before copying:
  `sha512-umXZPthnWZtF3iG/5mQG+AZ2V6i0UeYpo3z2CkggTEgL8dKmIIwJT6TDuAMuabXa1yTW8uJ1ZAgR+CxNTklYYw==`.
- npm package source: `catdad-experiments/libheif-js`, commit
  `d8ec4bc3bc5bf8055975577bccbbc7e1d7313c2d`.
- Emscripten build: `catdad-experiments/libheif-emscripten`, release/tag
  `v1.23.5`, Emscripten **3.1.61**.
- Its libheif submodule: `strukturag/libheif`, commit
  `413e2a87e6a70b3eccc3a3adc5801179dd2d9e00`.
- Default HEVC decoder dependency: **libde265 1.0.15**. AOM, WebCodecs,
  uncompressed and OpenJPEG builds are disabled by upstream defaults.

The bundled source archives are served with this dependency. Their original
URLs, byte counts and SHA-256 hashes are in [sources/manifest.json](sources/manifest.json).
`LICENSE`, `LICENSE-libheif-js` and `LICENSE-libde265` retain upstream notices.
Source archives also contain component copyright and license files.

## Rebuild or replace

Extract the source archives into separate directories. Use libheif at the
specified commit as the Emscripten repository's `libheif` submodule. Its
`.github/workflows/emscripten.yml` records the release build:

```sh
USE_WASM=1 USE_UNSAFE_EVAL=0 USE_TYPESCRIPT=1 ./build-emscripten.sh .
```

Run this inside the libheif source using Emscripten 3.1.61. The root
`build-emscripten.sh` fetches/builds libde265 1.0.15 and records the complete
compiler/linker flags. A matching libde265 source archive is included here.
The Emscripten release packages `libheif-wasm/libheif.js`, `.wasm`, licenses,
and type definitions. In the libheif-js source, `scripts/install.js` consumes
that release tarball (or a supplied local tarball) and esbuild creates the
IIFE using `scripts/bundle.js`. See its package.json for build dependencies:

```sh
npm install
node scripts/install.js /path/to/rebuilt/libheif.tar.gz
```

The runtime import in `../../js/heif-worker.js` is deliberately a separate
same-origin file. Replace this bundle there with a compatible rebuilt IIFE
and change the worker/intake cache hashes. No application obfuscation or
restriction prevents library modification or debugging. No reproduction
build was run here; the original upstream bundle was integrity checked.
