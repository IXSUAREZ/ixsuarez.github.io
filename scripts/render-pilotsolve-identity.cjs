/** Render PilotSolve identity derivatives from its approved master.
 * The main identity renderer owns its selected social preview.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets/identities/pilotsolve');
const master = path.join(out, 'icon-master.png');

async function renderSquare(size, file) {
  await sharp(master).resize(size,size).png().toFile(path.join(out,file));
}

(async () => {
  await sharp(master).resize(512,512).png().toFile(path.join(out,'logo.png'));
  fs.writeFileSync(path.join(out,'mark.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,${(await sharp(master).resize(512,512).png().toBuffer()).toString('base64')}"/></svg>\n`);
  await renderSquare(48, 'icon-48.png');
  await renderSquare(180, 'icon-180.png');
  await renderSquare(192, 'icon-192.png');
  await renderSquare(512, 'icon-512.png');
  // Do not replace the selected previewSource; render-identities.cjs owns it.
  console.log('Rendered PilotSolve identity assets.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
