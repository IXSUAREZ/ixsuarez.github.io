// Bristell-style low-wing trainer, built from primitives. Flat-shaded,
// brand palette (yellow airframe, navy accents/glass). Returns a THREE.Group
// with +Z as the tail direction (nose toward -Z), ~7 units long, ~8.6 span.
// The full CDN URL keeps this module importable without an import map; it
// resolves to the SAME three.js instance hero-plane.js imports.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.166.1/build/three.module.min.js';

const YELLOW = 0xFFD000;
const NAVY = 0x1C2142;
const GLASS = 0x10182F;

function flat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color, flatShading: true, roughness: opts.roughness ?? 0.55,
    metalness: opts.metalness ?? 0.12, ...opts.extra,
  });
}

export function buildTrainer() {
  const plane = new THREE.Group();
  const yellow = flat(YELLOW);
  const navy = flat(NAVY, { roughness: 0.5 });
  const glass = flat(GLASS, { roughness: 0.18, metalness: 0.55 });

  // --- Fuselage (lathe profile, nose -Z) ---
  const profile = [
    [0.02, -3.30], [0.16, -3.22], [0.30, -3.00], [0.40, -2.45],
    [0.50, -1.60], [0.55, -0.80], [0.53, -0.05], [0.44, 0.80],
    [0.32, 1.60], [0.20, 2.30], [0.10, 2.85], [0.03, 3.15],
  ].map(([r, z]) => new THREE.Vector2(r, z));
  const fuselage = new THREE.Mesh(new THREE.LatheGeometry(profile, 18), yellow);
  fuselage.rotation.x = Math.PI / 2; // lathe axis Y -> Z
  plane.add(fuselage);

  // --- Canopy (bubble over cabin) ---
  const canopy = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), glass);
  canopy.scale.set(0.78, 0.62, 1.55);
  canopy.position.set(0, 0.30, -0.55);
  canopy.rotation.x = 0.10;
  plane.add(canopy);

  // --- Wings (tapered extrusions, low mount, slight dihedral) ---
  function wingPanel(sign) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.75);          // root leading edge
    shape.lineTo(0, -0.85);         // root trailing edge
    shape.lineTo(4.28, -0.32);      // tip trailing edge
    shape.lineTo(4.28, 0.28);       // tip leading edge
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.10, bevelEnabled: false });
    geo.rotateX(Math.PI / 2); // lie flat (x = span, z = chord)
    const wing = new THREE.Mesh(geo, yellow);
    wing.scale.x = sign;
    wing.position.set(0, -0.22, -0.75);
    wing.rotation.z = sign * -0.055; // dihedral
    return wing;
  }
  plane.add(wingPanel(1));
  plane.add(wingPanel(-1));

  // --- Horizontal stabilizer ---
  function stabPanel(sign) {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.35);
    shape.lineTo(0, -0.40);
    shape.lineTo(1.35, -0.16);
    shape.lineTo(1.35, 0.14);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: false });
    geo.rotateX(Math.PI / 2);
    const stab = new THREE.Mesh(geo, yellow);
    stab.scale.x = sign;
    stab.position.set(0, 0.10, 2.72);
    stab.rotation.z = sign * -0.04;
    return stab;
  }
  plane.add(stabPanel(1));
  plane.add(stabPanel(-1));

  // --- Vertical tail ---
  const finShape = new THREE.Shape();
  finShape.moveTo(0, 0);
  finShape.lineTo(0, 1.05);
  finShape.lineTo(0.62, 0);
  finShape.closePath();
  const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.08, bevelEnabled: false });
  const fin = new THREE.Mesh(finGeo, yellow);
  fin.position.set(-0.04, 0.18, 2.30);
  plane.add(fin);
  // rudder accent in navy
  const rudderShape = new THREE.Shape();
  rudderShape.moveTo(0, 0.30);
  rudderShape.lineTo(0, 1.05);
  rudderShape.lineTo(0.42, 0.30);
  rudderShape.closePath();
  const rudder = new THREE.Mesh(new THREE.ExtrudeGeometry(rudderShape, { depth: 0.085, bevelEnabled: false }), navy);
  rudder.position.set(-0.0425, 0.18, 2.62);
  plane.add(rudder);

  // --- Spinner + prop ---
  const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.30, 0.62, 14), navy);
  spinner.rotation.x = -Math.PI / 2;
  spinner.position.set(0, 0, -3.30);
  plane.add(spinner);
  const propGroup = new THREE.Group();
  const bladeGeo = new THREE.BoxGeometry(0.14, 1.85, 0.045);
  // taper blades slightly
  const blade1 = new THREE.Mesh(bladeGeo, navy);
  const blade2 = new THREE.Mesh(bladeGeo, navy);
  blade2.rotation.z = Math.PI / 2;
  propGroup.add(blade1, blade2);
  propGroup.position.set(0, 0, -3.28);
  plane.add(propGroup);

  // --- Gear: nose strut + mains (all wheels share one ground plane, y=-1.03) ---
  const strutGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.55, 8);
  const noseStrut = new THREE.Mesh(strutGeo, navy);
  noseStrut.position.set(0, -0.58, -2.55);
  plane.add(noseStrut);
  const wheelGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.13, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const noseWheel = new THREE.Mesh(wheelGeo, navy);
  noseWheel.position.set(0, -0.82, -2.55);
  plane.add(noseWheel);
  for (const s of [1, -1]) {
    const leg = new THREE.Mesh(strutGeo, navy);
    leg.position.set(s * 0.85, -0.50, -0.85);
    leg.rotation.z = s * 0.35;
    plane.add(leg);
    const wheel = new THREE.Mesh(wheelGeo, navy);
    wheel.position.set(s * 1.02, -0.82, -0.85);
    plane.add(wheel);
  }

  plane.userData.prop = propGroup;
  return plane;
}
