/* SuarezCFI — homepage CloudySky adaptation
   The Framer reference is rendered here as a small WebGL layer over the
   photographic horizon. It keeps the aircraft and composition from the
   approved hero image while adding slow, tactile cloud movement. */
(() => {
  'use strict';

  const hero = document.querySelector('.horizon-hero');
  const control = document.getElementById('sky-motion');
  const canvas = document.getElementById('horizon-clouds');
  if (!hero || !control) return;

  const stateLabel = hero.querySelector('.sky-state');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function listen(query, eventName, handler) {
    if (query.addEventListener) query.addEventListener(eventName, handler);
    else if (query.addListener) query.addListener(handler);
  }

  function makeCloudRenderer(target) {
    if (!target || !window.WebGLRenderingContext) return null;

    let gl;
    try {
      gl = target.getContext('webgl', {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
      });
    } catch {
      return null;
    }
    if (!gl) return null;

    const vertexSource = `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `;
    const fragmentSource = `
      precision mediump float;
      uniform vec2 resolution;
      uniform float time;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 cell = floor(p);
        vec2 local = fract(p);
        local = local * local * (3.0 - 2.0 * local);
        float a = hash(cell);
        float b = hash(cell + vec2(1.0, 0.0));
        float c = hash(cell + vec2(0.0, 1.0));
        float d = hash(cell + vec2(1.0, 1.0));
        return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p = p * 2.0 + vec2(17.17, 9.31);
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        float aspect = resolution.x / max(resolution.y, 1.0);
        vec2 p = vec2(uv.x * aspect, uv.y) * 3.15;
        float drift = time * 0.045;

        // Two FBM layers mirror the Framer component's soft cloud depth.
        float lowCloud = fbm(p * 0.82 + vec2(drift * 0.45, -drift * 0.08));
        float highCloud = fbm(p * 1.62 + vec2(drift, -drift * 0.15));
        float cloudMask = smoothstep(0.46, 0.76, mix(lowCloud, highCloud, 0.44));

        vec3 skyTop = vec3(0.16, 0.21, 0.25);
        vec3 skyBottom = vec3(0.68, 0.48, 0.30);
        vec3 sky = mix(skyBottom, skyTop, uv.y);

        vec2 sunPosition = vec2(0.76, 0.72);
        vec2 sunUv = vec2(uv.x * aspect, uv.y);
        vec2 sun = vec2(sunPosition.x * aspect, sunPosition.y);
        float sunDistance = length(sunUv - sun);
        float sunGlow = smoothstep(0.34, 0.0, sunDistance) * 0.18;
        sky = mix(sky, vec3(1.0, 0.82, 0.58), sunGlow);

        vec3 cloudColor = mix(vec3(0.10, 0.14, 0.17), vec3(1.0, 0.88, 0.69), highCloud);
        vec3 color = mix(sky, cloudColor, cloudMask * 0.68);
        color += pow(1.0 - uv.y, 2.0) * vec3(0.05, 0.06, 0.06);

        // Keep the layer transparent enough for the photographic aircraft to
        // remain the visual anchor beneath the moving atmosphere.
        float alpha = 0.08 + cloudMask * 0.28;
        gl_FragColor = vec4(color, alpha);
      }
    `;

    function compile(type, source) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compile(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    if (!program) return null;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

    const positionLocation = gl.getAttribLocation(program, 'position');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');
    const timeLocation = gl.getUniformLocation(program, 'time');
    const buffer = gl.createBuffer();
    if (!buffer || positionLocation < 0) return null;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.clearColor(0, 0, 0, 0);

    let raf = null;
    let active = false;
    let elapsed = 0;
    let lastTimestamp = null;
    let lastDraw = null;
    const frameInterval = 1000 / 30;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(target.clientWidth * dpr));
      const height = Math.max(1, Math.round(target.clientHeight * dpr));
      if (target.width === width && target.height === height) return;
      target.width = width;
      target.height = height;
      gl.viewport(0, 0, width, height);
      if (resolutionLocation) gl.uniform2f(resolutionLocation, width, height);
    }

    function draw(timestamp) {
      resize();
      if (lastTimestamp !== null) elapsed += (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      lastDraw = timestamp;
      if (timeLocation) gl.uniform1f(timeLocation, elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function stop() {
      if (raf !== null) window.cancelAnimationFrame(raf);
      raf = null;
      lastTimestamp = null;
      lastDraw = null;
    }

    function loop(timestamp) {
      if (!active) {
        raf = null;
        return;
      }
      if (lastDraw === null || timestamp - lastDraw >= frameInterval - 1) draw(timestamp);
      raf = window.requestAnimationFrame(loop);
    }

    function start() {
      if (!active || raf !== null) return;
      lastTimestamp = null;
      lastDraw = null;
      raf = window.requestAnimationFrame(loop);
    }

    resize();
    return {
      setActive(next) {
        active = Boolean(next);
        if (active) start();
        else stop();
      },
    };
  }

  const clouds = makeCloudRenderer(canvas);
  if (clouds) hero.classList.add('has-cloud-sky');

  let visible = true;
  let enabled = !reduced.matches;
  try {
    const saved = window.localStorage.getItem('suarezcfi.sky-motion');
    if (saved !== null) enabled = saved === 'on' && !reduced.matches;
  } catch { /* The control still works when storage is unavailable. */ }

  function render() {
    if (reduced.matches) enabled = false;
    const active = enabled && visible && !document.hidden && !reduced.matches;
    control.checked = enabled;
    control.disabled = reduced.matches;
    control.title = reduced.matches
      ? 'Motion is off to match your reduced-motion preference.'
      : 'Turn sky motion on or off';
    if (stateLabel) stateLabel.textContent = enabled ? 'On' : 'Off';
    hero.dataset.motion = active ? 'on' : 'off';
    if (clouds) clouds.setActive(active);
  }

  control.addEventListener('change', () => {
    enabled = control.checked;
    try {
      window.localStorage.setItem('suarezcfi.sky-motion', enabled ? 'on' : 'off');
    } catch { /* no-op */ }
    render();
  });

  listen(reduced, 'change', (event) => {
    if (event.matches) enabled = false;
    render();
  });
  document.addEventListener('visibilitychange', render);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      visible = entry.isIntersecting;
      render();
    }).observe(hero);
  }

  render();
})();
