/** Export web sizes from each approved 1024px square icon master.
 * The source artwork lives beside its derived identity images.
 * Run with NODE_PATH pointing to installed sharp.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'config/site-pages.json')));
const standaloneIcons = {
  'simply-endorsed-cfi': ['icons/apple-touch-icon.png:180','icons/favicon-32.png:32','icons/favicon-192.png:192','icons/favicon-512.png:512'],
  'part-61-calculator': ['icons/apple-touch-icon.png:180','icons/favicon-32.png:32','icons/favicon-192.png:192','icons/favicon-512.png:512'],
  'aero-lab': ['icons/icon-32.png:32','icons/icon-48.png:48','icons/icon-180.png:180','icons/icon-192.png:192','icons/icon-512.png:512'],
  'pilotsolve': ['apple-touch-icon.png:180','icon-48.png:48','icon-192.png:192','icon-512.png:512'],
  'engine-explorer': ['app/apple-touch-icon.png:180','app/favicon-32.png:32','app/favicon-192.png:192'],
};
(async () => {
  for (const [id, identity] of Object.entries(manifest.identities)) {
    const dir = path.join(root,'assets/identities',id); fs.mkdirSync(dir,{recursive:true});
    const master = path.join(dir,'icon-master.png');
    if (!fs.existsSync(master)) throw Error(`Missing icon master: ${master}`);
    const metadata = await sharp(master).metadata();
    if (metadata.width !== 1024 || metadata.height !== 1024) throw Error(`Icon master must be 1024x1024: ${master}`);
    const logo = await sharp(master).resize(512,512).png().toBuffer();
    fs.writeFileSync(path.join(dir,'logo.png'),logo);
    const preview = path.join(dir,'preview.png');
    if (identity.previewSource) {
      // Preserve an explicitly selected social preview independently of the icon artwork.
      const previewSource = path.join(root, identity.previewSource);
      const sourceMetadata = await sharp(previewSource).metadata();
      if (sourceMetadata.width !== 1200 || sourceMetadata.height !== 1200) throw Error(`Preview source must be 1200x1200: ${previewSource}`);
      fs.copyFileSync(previewSource, preview);
    } else {
      await sharp(master).resize(1200,1200).png().toFile(preview);
    }
    for (const size of [48,192,180]) {
      await sharp(master).resize(size,size).png().toFile(path.join(dir,`icon-${size}.png`));
    }
    for (const target of standaloneIcons[id] || []) {
      const [relativePath, dimension] = target.split(':');
      await sharp(master).resize(Number(dimension),Number(dimension)).png().toFile(path.join(root,id,relativePath));
    }
  }
  console.log(`Rendered ${Object.keys(manifest.identities).length} identity sets.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
