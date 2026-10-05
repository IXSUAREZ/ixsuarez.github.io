/* Separate, cancellable local decoder. Select the primary still image,
   excluding Live Photo motion/auxiliary frames. */
'use strict';
importScripts('/certificate-generator/vendor/libheif-1.23.5/libheif-bundle.js');
var ready = libheif({print:function(){},printErr:function(){}});
self.onmessage = async function (event) {
  var images=[], decoder, lib;
  try {
    lib=await ready;
    decoder=new lib.HeifDecoder();
    images=decoder.decode(new Uint8Array(event.data.buffer));
    var image=images.find(function(img){return img.is_primary();})||images[0];
    if(!image) throw new Error('This HEIC/HEIF photo could not be read. Save a JPEG from Photos and upload it.');
    var w=image.get_width(), h=image.get_height();
    if(!w||!h||w>event.data.maxEdge||h>event.data.maxEdge||w*h>event.data.maxPixels) {
      self.postMessage({code:'dimensions',error:'This photo is too large to process. Choose a photo under 50 megapixels and 12,000 pixels per side.'}); return;
    }
    var rgba={data:new Uint8ClampedArray(w*h*4),width:w,height:h};
    await new Promise(function(resolve,reject){image.display(rgba,function(result){result?resolve():reject(new Error('This HEIC/HEIF photo could not be decoded. Save a JPEG from Photos and upload it.'));});});
    var k=Math.min(1,event.data.outputEdge/Math.max(w,h));
    // Send only bounded output pixels. Modern Safari/Chrome support 2D
    // OffscreenCanvas in workers; otherwise use the checked full-size result.
    if(typeof OffscreenCanvas==='function') {
      var source=new OffscreenCanvas(w,h); source.getContext('2d').putImageData(new ImageData(rgba.data,w,h),0,0);
      var scaled=new OffscreenCanvas(Math.max(1,Math.round(w*k)),Math.max(1,Math.round(h*k)));
      scaled.getContext('2d').drawImage(source,0,0,scaled.width,scaled.height);
      rgba=scaled.getContext('2d').getImageData(0,0,scaled.width,scaled.height);
    }
    self.postMessage({width:rgba.width,height:rgba.height,pixels:rgba.data.buffer},[rgba.data.buffer]);
  } catch(error) {
    self.postMessage({code:'decode',error:error.message||'This HEIC/HEIF photo could not be read. Save a JPEG from Photos and upload it.'});
  } finally {
    images.forEach(function(image){image.free();});
    if(decoder&&decoder.decoder&&lib) lib.heif_context_free(decoder.decoder);
  }
};
