/* CloudySky, adapted from the supplied Framer component.
   Preserve its complete shader and day/night colors. The published reference
   uses cloudDensity 1, cloudSpeed 1.3, sunIntensity 1, and automatic solar time. */
(() => {
  'use strict';
  const hero = document.querySelector('.horizon-hero');
  const canvas = document.getElementById('horizon-clouds');
  if (!hero || !canvas) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const presets = {
    day: { top: [.3, .5, .9], bottom: [.6, .8, 1], sun: [1, 1, .9], cloud: [1, 1, 1], cloudShadow: [.7, .75, .8] },
    night: { top: [.02, .03, .1], bottom: [.1, .14, .28], sun: [.9, .93, 1], cloud: [.55, .6, .75], cloudShadow: [.15, .18, .3] },
  };

  // NOAA approximation from the source component, at Bowman Field.
  function getSunMinutesUTC(date) {
    const start = Date.UTC(date.getUTCFullYear(), 0, 0);
    const day = Math.floor((date.getTime() - start) / 86400000);
    const gamma = 2 * Math.PI / 365 * (day - 1);
    const eqtime = 229.18 * (.000075 + .001868 * Math.cos(gamma) - .032077 * Math.sin(gamma)
      - .014615 * Math.cos(2 * gamma) - .040849 * Math.sin(2 * gamma));
    const decl = .006918 - .399912 * Math.cos(gamma) + .070257 * Math.sin(gamma)
      - .006758 * Math.cos(2 * gamma) + .000907 * Math.sin(2 * gamma)
      - .002697 * Math.cos(3 * gamma) + .00148 * Math.sin(3 * gamma);
    const lat = 38.228 * Math.PI / 180;
    const cosHa = Math.cos(90.833 * Math.PI / 180) / (Math.cos(lat) * Math.cos(decl)) - Math.tan(lat) * Math.tan(decl);
    const ha = Math.acos(Math.min(1, Math.max(-1, cosHa))) * 180 / Math.PI;
    const noon = 720 - 4 * -85.664 - eqtime;
    return { sunriseMin: noon - 4 * ha, sunsetMin: noon + 4 * ha };
  }

  function getNightFactor(now) {
    const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const half = 30 * 60000;
    const t = now.getTime();
    // Louisville's summer sunset can fall after UTC midnight. Include the
    // previous solar day so the sky does not abruptly turn dark at 8pm EDT.
    for (const offset of [-1, 0, 1]) {
      const base = midnight + offset * 86400000;
      const { sunriseMin, sunsetMin } = getSunMinutesUTC(new Date(base));
      const rise = base + sunriseMin * 60000;
      const set = base + sunsetMin * 60000;
      if (t < rise - half || t > set + half) continue;
      if (t < rise + half) return 1 - (t - rise + half) / (2 * half);
      if (t > set - half) return (t - set + half) / (2 * half);
      return 0;
    }
    return 1;
  }

  function colorsAt(factor) {
    return Object.fromEntries(Object.keys(presets.day).map(key => [key,
      presets.day[key].map((value, i) => value + (presets.night[key][i] - value) * factor)]));
  }

  function makeCloudRenderer() {
    let gl;
    try { gl = canvas.getContext('webgl', { alpha: false, antialias: false }); } catch { return null; }
    if (!gl) return null;
    const vertexSource = 'attribute vec2 position; void main() { gl_Position = vec4(position, 0.0, 1.0); }';
    const fragmentSource = `
            precision highp float;
            uniform vec2 resolution;
            uniform float time;
            uniform float cloudDensity;
            uniform float cloudSpeed;
            uniform float sunIntensity;
            uniform float starIntensity;
            uniform vec3 skyColorTop;
            uniform vec3 skyColorBottom;
            uniform vec3 sunColor;
            uniform vec3 cloudColor;
            uniform vec3 cloudShadow;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                float a = hash(i);
                float b = hash(i + vec2(1.0, 0.0));
                float c = hash(i + vec2(0.0, 1.0));
                float d = hash(i + vec2(1.0, 1.0));
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }

            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                for(int i = 0; i < 6; i++) {
                    value += amplitude * noise(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            // Sparse star field, composited only at night (starIntensity > 0).
            // Grid-cell stars reusing the value-noise hash: most cells stay
            // dark, lit cells get one small star at a stable random offset
            // that slowly twinkles over time.
            float starField(vec2 uv, float aspect) {
                vec2 sp = vec2(uv.x * aspect, uv.y) * 60.0;
                vec2 cell = floor(sp);
                vec2 f = fract(sp);
                float rnd = hash(cell);
                vec2 starPos = vec2(
                    hash(cell + vec2(1.7, 9.2)),
                    hash(cell + vec2(4.3, 2.8))
                );
                float d = length(f - starPos);
                float star = smoothstep(0.08, 0.0, d) * step(0.92, rnd);
                float twinkle = 0.6 + 0.4 * sin(time * (1.0 + rnd * 3.0) + rnd * 6.2831);
                return star * twinkle;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / resolution;
                vec2 p = uv * 3.0;

                // Sky gradient
                vec3 skyColor = mix(skyColorBottom, skyColorTop, uv.y);

                // Sun/moon position
                vec2 sunPos = vec2(0.7, 0.7);
                vec2 aspectUV = uv;
                aspectUV.x *= resolution.x / resolution.y;
                vec2 aspectSunPos = sunPos;
                aspectSunPos.x *= resolution.x / resolution.y;
                float sunDist = length(aspectUV - aspectSunPos);
                float sun = smoothstep(0.05, 0.0, sunDist);
                float sunGlow = smoothstep(0.3, 0.0, sunDist) * 0.2;

                // Add sun/moon to sky
                skyColor = mix(skyColor, sunColor, (sun + sunGlow) * sunIntensity);

                // Clouds
                vec2 cloudUV = p + vec2(time * cloudSpeed * 0.1, 0.0);
                float clouds = fbm(cloudUV * 2.0);
                clouds = fbm(cloudUV + clouds * 0.5);

                // Cloud layers
                float cloudLayer1 = smoothstep(0.3, 0.7, clouds);
                float cloudLayer2 = smoothstep(0.4, 0.8, fbm(cloudUV * 1.5 + time * cloudSpeed * 0.05));

                // Combine cloud layers
                float cloudMask = mix(cloudLayer1, cloudLayer2, 0.5) * cloudDensity;

                // Cloud color with depth
                vec3 finalCloudColor = mix(cloudShadow, cloudColor, clouds);

                // Mix sky and clouds
                vec3 finalColor = mix(skyColor, finalCloudColor, cloudMask);

                // Stars sit behind the clouds and fade out near the horizon.
                // The uniform branch is coherent across all pixels, so day
                // mode pays nothing for this.
                if (starIntensity > 0.0) {
                    float stars = starField(uv, resolution.x / resolution.y);
                    finalColor += vec3(0.9, 0.95, 1.0) * stars * starIntensity
                        * (1.0 - cloudMask) * smoothstep(0.15, 0.5, uv.y);
                }

                // Add atmospheric perspective
                float atmosphere = pow(1.0 - uv.y, 2.0) * 0.2;
                finalColor += atmosphere * skyColorTop;

                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
    function compile(type, source) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
      gl.deleteShader(shader);
      return null;
    }
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      return null;
    }
    const program = gl.createProgram();
    if (!program) { gl.deleteShader(vertex); gl.deleteShader(fragment); return null; }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); return null; }
    const position = gl.getAttribLocation(program, 'position');
    const buffer = gl.createBuffer();
    if (!buffer || position < 0) { gl.deleteProgram(program); if (buffer) gl.deleteBuffer(buffer); return null; }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = Object.fromEntries(['resolution', 'time', 'cloudDensity', 'cloudSpeed', 'sunIntensity',
      'starIntensity', 'skyColorTop', 'skyColorBottom', 'sunColor', 'cloudColor', 'cloudShadow']
      .map(name => [name, gl.getUniformLocation(program, name)]));
    gl.uniform1f(uniforms.cloudDensity, 1);
    gl.uniform1f(uniforms.cloudSpeed, 1.3);
    gl.uniform1f(uniforms.sunIntensity, 1);
    let frame = null;
    let active = false;
    let elapsed = 0;
    let lastDraw = null;
    let lastTimestamp = null;
    let nightFactor = null;

    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        gl.uniform2f(uniforms.resolution, width, height);
      }
      gl.uniform1f(uniforms.time, elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function stop() {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      lastDraw = lastTimestamp = null;
    }
    function loop(timestamp) {
      if (!active) return;
      if (lastDraw === null || timestamp - lastDraw >= 1000 / 30 - 1) {
        if (lastTimestamp !== null) elapsed += (timestamp - lastTimestamp) / 1000;
        lastTimestamp = lastDraw = timestamp;
        draw();
      }
      frame = window.requestAnimationFrame(loop);
    }
    return {
      update(factor) {
        if (factor === nightFactor) return;
        nightFactor = factor;
        const colors = colorsAt(factor);
        gl.uniform1f(uniforms.starIntensity, factor);
        for (const [uniform, key] of [['skyColorTop', 'top'], ['skyColorBottom', 'bottom'],
          ['sunColor', 'sun'], ['cloudColor', 'cloud'], ['cloudShadow', 'cloudShadow']]) {
          gl.uniform3f(uniforms[uniform], ...colors[key]);
        }
        draw(); // Mode changes also work with motion paused or reduced.
      },
      setActive(next) {
        active = next;
        if (!active) stop();
        else if (frame === null) frame = window.requestAnimationFrame(loop);
      },
      resize: draw,
      dispose() { active = false; stop(); gl.deleteBuffer(buffer); gl.deleteProgram(program); },
    };
  }

  let visible = true;
  let renderer = makeCloudRenderer();
  let lastFactor = null;

  function render() {
    const factor = getNightFactor(new Date());
    const motion = !reduced.matches && Boolean(renderer);
    const active = motion && visible && !document.hidden;
    hero.classList.toggle('has-cloud-sky', Boolean(renderer));
    hero.dataset.skyMode = 'auto';
    hero.dataset.skyPhase = factor < .55 ? 'day' : 'night';
    hero.dataset.motion = active ? 'on' : 'off';
    if (factor !== lastFactor) {
      hero.style.setProperty('--sky-night', String(factor));
      lastFactor = factor;
    }
    if (renderer) { renderer.update(factor); renderer.setActive(active); }
  }

  if (reduced.addEventListener) reduced.addEventListener('change', render);
  else reduced.addListener(render);
  document.addEventListener('visibilitychange', render);
  window.addEventListener('pageshow', render);
  window.addEventListener('pagehide', () => { if (renderer) renderer.setActive(false); });
  window.setInterval(() => { if (!document.hidden) render(); }, 60000);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; render(); }).observe(hero);
  }
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { if (renderer) renderer.resize(); }).observe(canvas);
  } else {
    window.addEventListener('resize', () => { if (renderer) renderer.resize(); });
  }
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    if (renderer) renderer.dispose();
    renderer = null;
    render();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    renderer = makeCloudRenderer();
    render();
  });
  render();
})();
