/* Local still-photo intake. File signatures are authoritative; MIME/name are
   hints only. No image data is sent to a server. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CertgenPhoto = api;
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';
  var MAX_BYTES = 20 * 1024 * 1024, MAX_PIXELS = 50000000, MAX_EDGE = 12000;
  var OUTPUT_EDGE = 2400, TIMEOUT = 25000;
  var WORKER = '/certificate-generator/js/heif-worker.js?v=39cef840ec';
  var TYPES = {jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',bmp:'image/bmp',avif:'image/avif',heif:'image/heic',tiff:'image/tiff'};
  function failure(code, message) { var e = new Error(message); e.code = code; return e; }
  function aborted() { return failure('cancelled', 'Photo preparation cancelled.'); }
  function dimensions(w, h) {
    if (!w || !h || w > MAX_EDGE || h > MAX_EDGE || w * h > MAX_PIXELS) throw failure('dimensions', 'This photo is too large to process. Choose a photo under 50 megapixels and 12,000 pixels per side.');
    return {width:w, height:h};
  }
  function ascii(b, at, len) { return String.fromCharCode.apply(null, b.subarray(at, at + len)); }
  function inspect(bytes) {
    var b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    var v = new DataView(b.buffer, b.byteOffset, b.byteLength), format, size;
    function be(at) { return at + 4 <= b.length ? v.getUint32(at) : 0; }
    if (b.length >= 24 && ascii(b,0,8) === '\x89PNG\r\n\x1a\n' && ascii(b,12,4) === 'IHDR') { format='png'; size=dimensions(be(16),be(20)); }
    else if (b.length >= 10 && /^(GIF87a|GIF89a)$/.test(ascii(b,0,6))) { format='gif'; size=dimensions(v.getUint16(6,true),v.getUint16(8,true)); }
    else if (b.length >= 26 && ascii(b,0,2) === 'BM') {
      format='bmp'; var dib=v.getUint32(14,true);
      size=dib===12?dimensions(v.getUint16(18,true),v.getUint16(20,true)):dimensions(Math.abs(v.getInt32(18,true)),Math.abs(v.getInt32(22,true)));
    } else if (b.length >= 12 && ascii(b,0,4)==='RIFF' && ascii(b,8,4)==='WEBP') {
      format='webp';
      for (var p=12; p+8<=b.length;) {
        var chunk=ascii(b,p,4), length=v.getUint32(p+4,true), at=p+8;
        if(chunk==='VP8X' && at+10<=b.length) size=dimensions(1+b[at+4]+(b[at+5]<<8)+(b[at+6]<<16),1+b[at+7]+(b[at+8]<<8)+(b[at+9]<<16));
        if(chunk==='VP8L' && at+5<=b.length && b[at]===0x2f) size=dimensions(1+b[at+1]+((b[at+2]&63)<<8),1+(b[at+2]>>6)+(b[at+3]<<2)+((b[at+4]&15)<<10));
        if(chunk==='VP8 ' && at+10<=b.length && b[at+3]===0x9d && b[at+4]===1 && b[at+5]===0x2a) size=dimensions(v.getUint16(at+6,true)&16383,v.getUint16(at+8,true)&16383);
        if(size) break;
        if(!length || p+8+length>b.length) break;
        p+=8+length+(length%2);
      }
    } else if (b.length >= 3 && b[0]===255 && b[1]===216 && b[2]===255) {
      format='jpeg';
      for(var j=2;j+4<=b.length;) {
        if(b[j]!==255) break;
        while(b[j]===255) j++;
        var marker=b[j++];
        if(marker===217 || marker===218) break;
        if(marker===1 || (marker>=208 && marker<=215)) continue;
        if(j+2>b.length) break;
        var n=v.getUint16(j);
        if(n<2 || j+n>b.length) break;
        if([192,193,194,195,197,198,199,201,202,203,205,206,207].indexOf(marker)!==-1 && n>=8) { size=dimensions(v.getUint16(j+5),v.getUint16(j+3)); break; }
        j+=n;
      }
    } else if(b.length>=8 && (ascii(b,0,4)==='II\x2a\x00' || ascii(b,0,4)==='MM\x00\x2a')) {
      format='tiff'; var le=b[0]===73, ifd=v.getUint32(4,le);
      if(ifd+2<=b.length) {
        var count=Math.min(v.getUint16(ifd,le),1024), w,h;
        for(var t=0;t<count;t++) {
          var pos=ifd+2+t*12; if(pos+12>b.length) break;
          var tag=v.getUint16(pos,le), type=v.getUint16(pos+2,le);
          if(v.getUint32(pos+4,le)!==1) continue;
          var value=type===3?v.getUint16(pos+8,le):type===4?v.getUint32(pos+8,le):0;
          if(tag===256) w=value; if(tag===257) h=value;
        }
        if(w&&h) size=dimensions(w,h);
      }
    } else if(b.length>=16 && ascii(b,4,4)==='ftyp') {
      var box=be(0); if(box<16 || box>b.length) throw failure('corrupt','This photo file is incomplete. Save it again from Photos and use Upload photo.');
      var brands=[ascii(b,8,4)]; for(var f=16;f+4<=box;f+=4) brands.push(ascii(b,f,4));
      if(brands.some(function(x){return x==='avif'||x==='avis';})) format='avif';
      else if(brands.some(function(x){return ['heic','heix','hevc','hevx','heim','heis','mif1','msf1'].indexOf(x)!==-1;})) format='heif';
      // Check image spatial extents before native pixel decoding. The HEIF
      // worker also checks the primary image's authoritative handle dimensions.
      if(format) for(var q=box;q+16<=b.length;q++) if(b[q]===105 && b[q+1]===115 && b[q+2]===112 && b[q+3]===101 && q>=4 && be(q-4)===20) { var d=dimensions(be(q+8),be(q+12)); if(!size || d.width*d.height>size.width*size.height) size=d; }
    }
    if(!format) throw failure('unsupported','Choose a still photo: JPEG, PNG, HEIC/HEIF, WebP, GIF, BMP or AVIF. For a Live Photo, save its still image to Photos and use Upload photo.');
    if(!size && format!=='heif' && format!=='avif') throw failure('corrupt','This photo file is incomplete or unsupported. Save a JPEG or PNG from Photos and upload it.');
    return {format:format, mime:TYPES[format], width:size&&size.width, height:size&&size.height};
  }
  function fileHint(file) {
    var type=(file.type||'').toLowerCase();
    return /^image\//.test(type) || !type || /^(application\/octet-stream|public\.(heic|heif|jpeg|png|tiff)|com\.apple\.heic)$/.test(type) || /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|tiff?)$/i.test(file.name||'');
  }
  function clipboardHint(type) {
    return /^(?:web )?image\//i.test(type) || /^(application\/octet-stream|public\.(heic|heif|jpeg|png|tiff)|com\.apple\.heic|text\/html)$/i.test(type);
  }
  function inlineImage(html) {
    if(typeof html!=='string' || html.length>MAX_BYTES*1.4) return null;
    // Read inline image bytes only. Never insert clipboard HTML or fetch its
    // remote/blob/file URLs: Messages may expose a reference without bytes.
    var m=html.match(/\bsrc\s*=\s*["'](data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=\s]+)["']/i);
    if(!m) return null;
    try {
      var data=atob(m[1].split(',')[1].replace(/\s/g,'')); if(data.length>MAX_BYTES) return null;
      var bytes=new Uint8Array(data.length); for(var i=0;i<data.length;i++) bytes[i]=data.charCodeAt(i);
      return new Blob([bytes],{type:m[1].slice(5,m[1].indexOf(';'))});
    } catch(e) { return null; }
  }
  function prepare(file) {
    var cancelled=false, worker=null, rejectWorker=null, timer=null;
    function current() { if(cancelled) throw aborted(); }
    function cancel() { cancelled=true; if(worker) worker.terminate(); if(timer) clearTimeout(timer); if(rejectWorker) rejectWorker(aborted()); }
    function native(blob, info) {
      var options={imageOrientation:'from-image'};
      // Apply EXIF orientation before canvas drawing; resizing before this
      // can swap the intended axes on portrait iPhone photos.
      var bitmap=typeof createImageBitmap==='function'?createImageBitmap(blob,options):Promise.reject(new Error('bitmap unavailable'));
      return bitmap.then(function(image){if(cancelled){image.close();throw aborted();}return {image:image,width:image.width,height:image.height,release:function(){image.close();}};},function(){
        current(); return new Promise(function(resolve,reject){
          var url=URL.createObjectURL(blob), image=new Image(); image.decoding='async';
          image.onload=function(){URL.revokeObjectURL(url);try{current();resolve({image:image,width:image.naturalWidth,height:image.naturalHeight,release:function(){}});}catch(e){reject(e);}};
          image.onerror=function(){URL.revokeObjectURL(url);reject(failure('decode','This photo could not be read. Save a JPEG or PNG from Photos and upload it.'));}; image.src=url;
        });
      });
    }
    function heif(buffer) {
      current();
      return new Promise(function(resolve,reject){
        rejectWorker=reject;
        try { worker=new Worker(WORKER); } catch(e) { reject(failure('decoder','HEIC conversion is unavailable. Save a JPEG from Photos and upload it.')); return; }
        function finish() { worker.terminate(); worker=null; rejectWorker=null; clearTimeout(timer); timer=null; }
        timer=setTimeout(function(){finish();reject(failure('timeout','This HEIC photo took too long to convert. Save a JPEG from Photos and upload it.'));},TIMEOUT);
        worker.onerror=function(){finish();reject(failure('decoder','HEIC conversion could not load. Use Upload photo from Photos, or save a JPEG.'));};
        worker.onmessage=function(e){finish();try{current();if(e.data.error)throw failure(e.data.code||'decode',e.data.error);resolve(e.data);}catch(err){reject(err);}};
        worker.postMessage({buffer:buffer,maxPixels:MAX_PIXELS,maxEdge:MAX_EDGE,outputEdge:OUTPUT_EDGE},[buffer]);
      });
    }
    var promise=Promise.resolve().then(function(){
      current();
      if(!file || !file.size) throw failure('empty','The copied photo is empty. Save it to Photos and use Upload photo.');
      if(file.size>MAX_BYTES) throw failure('size','This photo is over 20 MB. Choose a smaller photo or export a JPEG from Photos.');
      if(/\.(dng|cr2|cr3|nef|arw|raf|raw)$/i.test(file.name||'') || /(?:raw|dng)/i.test(file.type||'')) throw failure('unsupported','RAW photos need to be exported as JPEG, PNG or HEIC first.');
      return file.arrayBuffer();
    }).then(function(buffer){
      current(); var info=inspect(buffer), blob=new Blob([buffer],{type:info.mime});
      return native(blob,info).catch(function(error){
        current(); if(info.format!=='heif') throw error;
        return heif(buffer).then(function(result){var canvas=document.createElement('canvas');canvas.width=result.width;canvas.height=result.height;canvas.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(result.pixels),result.width,result.height),0,0);return {image:canvas,width:result.width,height:result.height,release:function(){},decoder:'libheif'};});
      }).then(function(decoded){
        try {
          current(); dimensions(decoded.width,decoded.height);
          var k=Math.min(1,OUTPUT_EDGE/Math.max(decoded.width,decoded.height)), canvas=document.createElement('canvas');
          canvas.width=Math.max(1,Math.round(decoded.width*k));canvas.height=Math.max(1,Math.round(decoded.height*k));
          var ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(decoded.image,0,0,canvas.width,canvas.height);
          return {dataURL:canvas.toDataURL('image/jpeg',0.92),width:canvas.width,height:canvas.height,format:info.format,decoder:decoded.decoder||'browser'};
        } finally { decoded.release(); }
      });
    });
    return {promise:promise,cancel:cancel};
  }
  return {prepare:prepare,inspect:inspect,fileHint:fileHint,clipboardHint:clipboardHint,inlineImage:inlineImage,limits:{bytes:MAX_BYTES,pixels:MAX_PIXELS,edge:MAX_EDGE,outputEdge:OUTPUT_EDGE}};
});
