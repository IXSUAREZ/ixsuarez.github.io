/** Deterministic exports from approved marks and licensed Lucide icons.
 * Run with NODE_PATH pointing to installed sharp, react, react-dom and lucide-react.
 * No image generation API, external font, or network request is used.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const icons = require('lucide-react');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root,'config/site-pages.json')));
(async () => {
  for (const [id, identity] of Object.entries(manifest.identities)) {
    const dir = path.join(root,'assets/identities',id); fs.mkdirSync(dir,{recursive:true});
    let source;
    if (identity.source) source = fs.readFileSync(path.join(root,identity.source));
    else {
      const Icon = icons[identity.icon]; if (!Icon) throw Error(`Unknown Lucide icon ${identity.icon}`);
      source = Buffer.from(renderToStaticMarkup(React.createElement(Icon,{size:512,strokeWidth:1.6,color:'#242725'})));
      fs.writeFileSync(path.join(dir,'mark.svg'),source);
    }
    const logo = await sharp(source,{density:180}).resize(512,512,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
    fs.writeFileSync(path.join(dir,'logo.png'),logo);
    if (identity.previewSource) {
      await sharp(path.join(root,identity.previewSource)).resize(1200,1200,{fit:'contain'}).png().toFile(path.join(dir,'preview.png'));
    } else await sharp({create:{width:1200,height:1200,channels:4,background:identity.background}}).composite([{input:logo,left:344,top:344}]).png().toFile(path.join(dir,'preview.png'));
    for (const size of [48,192,180]) {
      const inset = Math.round(size*.12), artSize=size-2*inset;
      const art = await sharp(logo).resize(artSize,artSize).png().toBuffer();
      await sharp({create:{width:size,height:size,channels:4,background:identity.background}}).composite([{input:art,left:inset,top:inset}]).png().toFile(path.join(dir,`icon-${size}.png`));
    }
  }
  fs.copyFileSync(require.resolve('lucide-react/LICENSE'),path.join(root,'assets/identities/LUCIDE-LICENSE.txt'));
  console.log(`Rendered ${Object.keys(manifest.identities).length} identity sets.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
