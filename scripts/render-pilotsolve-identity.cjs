/** Render the PilotSolve identity set from its local SVG source.
 * Requires the site's existing `sharp` dependency. No network or generated imagery.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets/identities/pilotsolve');
const mark = fs.readFileSync(path.join(out, 'mark.svg'));
const background = '#e9e7e1';

const preview = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <rect width="1200" height="1200" fill="#e9e7e1"/>
  <circle cx="600" cy="484" r="300" fill="#dedbd3"/>
  <image href="data:image/svg+xml;base64,${mark.toString('base64')}" x="312" y="196" width="576" height="576"/>
  <text x="600" y="885" text-anchor="middle" fill="#242725" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="104" font-weight="700" letter-spacing="-4">PilotSolve</text>
  <text x="600" y="954" text-anchor="middle" fill="#555a55" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="27" font-weight="600" letter-spacing="7">FLIGHT CALCULATOR</text>
  <text x="600" y="1118" text-anchor="middle" fill="#242725" font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="8">SUAREZ.CFI</text>
</svg>`);

async function renderSquare(size, file) {
  const inset = Math.round(size * .12);
  const art = await sharp(mark, { density: 240 }).resize(size - inset * 2, size - inset * 2).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art, left: inset, top: inset }]).png().toFile(path.join(out, file));
}

(async () => {
  await sharp(mark, { density: 240 }).resize(512, 512).png().toFile(path.join(out, 'logo.png'));
  await renderSquare(48, 'icon-48.png');
  await renderSquare(180, 'icon-180.png');
  await renderSquare(192, 'icon-192.png');
  await renderSquare(512, 'icon-512.png');
  fs.writeFileSync(path.join(out, 'preview-source.svg'), preview);
  await sharp(preview).png().toFile(path.join(out, 'preview.png'));
  console.log('Rendered PilotSolve identity assets.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
