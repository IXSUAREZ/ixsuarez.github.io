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
const rootIcons = [
  ['assets/favicon-48.png',48],
  ['assets/favicon-192.png',192],
  ['assets/apple-touch-icon.png',180],
];
(async () => {
  for (const [id, identity] of Object.entries(manifest.identities)) {
    const dir = path.join(root,'assets/identities',id); fs.mkdirSync(dir,{recursive:true});
    const master = path.join(dir,'icon-master.png');
    if (!fs.existsSync(master)) throw Error(`Missing icon master: ${master}`);
    const metadata = await sharp(master).metadata();
    if (metadata.width !== 1024 || metadata.height !== 1024) throw Error(`Icon master must be 1024x1024: ${master}`);
    const logo = await sharp(master).resize(512,512).png().toBuffer();
    fs.writeFileSync(path.join(dir,'logo.png'),logo);
    fs.writeFileSync(path.join(dir,'mark.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,${logo.toString('base64')}"/></svg>\n`);
    const preview = path.join(dir,'preview.png');
    if (identity.previewSource) {
      // Preserve an explicitly selected social preview independently of the icon artwork.
      const previewSource = path.join(root, identity.previewSource);
      await sharp(previewSource).resize(1200,1200,{fit:'fill'}).png().toFile(preview);
    } else {
      await sharp(master).resize(1200,1200).png().toFile(preview);
    }
    for (const size of [48,192,180]) {
      if (id === 'home') {
        // The site favicon is the yellow aircraft mark. Keep the home identity
        // icon sizes in sync without changing its separate social preview.
        const source = size === 180 ? 'apple-touch-icon.png' : `favicon-${size}.png`;
        fs.copyFileSync(path.join(root, 'assets', source), path.join(dir, `icon-${size}.png`));
      } else {
        await sharp(master).resize(size,size).png().toFile(path.join(dir,`icon-${size}.png`));
      }
    }
    for (const target of standaloneIcons[id] || []) {
      const [relativePath, dimension] = target.split(':');
      await sharp(master).resize(Number(dimension),Number(dimension)).png().toFile(path.join(root,id,relativePath));
    }
    if (id === 'home') {
      for (const [relativePath, dimension] of rootIcons) {
        await sharp(master).resize(dimension,dimension).png().toFile(path.join(root,relativePath));
      }
      fs.writeFileSync(path.join(root,'assets/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,${logo.toString('base64')}"/></svg>\n`);
      // Keep the explicit /favicon.ico link aligned with the same approved master.
      const pngs = await Promise.all([16,32,48].map(size => sharp(master).resize(size,size).png().toBuffer()));
      const header = Buffer.alloc(6 + 16 * pngs.length);
      header.writeUInt16LE(0,0); header.writeUInt16LE(1,2); header.writeUInt16LE(pngs.length,4);
      let offset = header.length;
      pngs.forEach((png,i) => {
        const entry = 6 + 16*i, size = [16,32,48][i];
        header[entry] = size; header[entry+1] = size; header[entry+2] = 0; header[entry+3] = 0;
        header.writeUInt16LE(1,entry+4); header.writeUInt16LE(32,entry+6);
        header.writeUInt32LE(png.length,entry+8); header.writeUInt32LE(offset,entry+12); offset += png.length;
      });
      const ico = Buffer.concat([header,...pngs]);
      if (ico.readUInt16LE(2) !== 1 || ico.readUInt16LE(4) !== 3) throw Error('Invalid root favicon ICO header');
      pngs.forEach((png,i) => {
        const entry=6+16*i, offset=ico.readUInt32LE(entry+12), length=ico.readUInt32LE(entry+8);
        if (ico[entry] !== [16,32,48][i] || length !== png.length || !ico.subarray(offset,offset+length).equals(png)) throw Error(`Root ICO frame mismatch: ${[16,32,48][i]}px`);
      });
      fs.writeFileSync(path.join(root,'favicon.ico'),ico);
    }
  }
  // Check the produced files against their intended dimensions and verify every
  // small icon is a deterministic resize of its approved master.
  for (const [id] of Object.entries(manifest.identities)) {
    const dir = path.join(root,'assets/identities',id);
    const master = path.join(dir,'icon-master.png');
    for (const size of [48,192,180]) {
      const outputPath = path.join(dir,`icon-${size}.png`);
      const output = await sharp(outputPath).metadata();
      if (output.width !== size || output.height !== size) throw Error(`Bad ${size}px icon: ${id}`);
      const expected = await sharp(master).resize(size,size).png().toBuffer();
      if (!expected.equals(fs.readFileSync(outputPath))) throw Error(`Icon/master mismatch: ${id} ${size}px`);
    }
  }
  for (const [relativePath, dimension] of rootIcons) {
    const outputPath = path.join(root,relativePath);
    const output = await sharp(outputPath).metadata();
    if (output.width !== dimension || output.height !== dimension) throw Error(`Bad root icon: ${relativePath}`);
    const expected = await sharp(path.join(root,'assets/identities/home/icon-master.png')).resize(dimension,dimension).png().toBuffer();
    if (!expected.equals(fs.readFileSync(outputPath))) throw Error(`Root icon/home master mismatch: ${relativePath}`);
  }
  console.log(`Rendered and validated ${Object.keys(manifest.identities).length} identity sets.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
