/**
 * Reusable low-poly model factories for Three.js.
 *
 * Usage:
 *   import { createLowPolyDog, createLowPolyOakTree } from './procedural-low-poly-models.js';
 *   const dog = createLowPolyDog(THREE, { scale: 1.2, bodyColor: 0x9b6a3c });
 *
 * Each function returns a THREE.Group with named child meshes, bottom-centered origin,
 * flat-shaded MeshStandardMaterials, and simple geometry that exports cleanly to GLB.
 */

export const LOW_POLY_SPECIES = {
  animals: {
    quadrupedWithTail: ['dog', 'cat', 'horse', 'deer', 'goat', 'tiger'],
    quadrupedNoTail: ['bear', 'panda'],
    bipedWithArms: ['monkey'],
    twoLeggedWithWings: ['bird', 'chicken'],
    noLegsWithTail: ['fish'],
  },
  humans: {
    basic: ['adult', 'child'],
    archetypes: ['worker', 'adventurer', 'robot'],
  },
  objects: {
    plants: ['oak-tree', 'pine-tree', 'palm-tree', 'flower', 'grass-clump', 'bush'],
    props: ['rock', 'crate', 'barrel', 'mushroom'],
  },
};

const DEG = Math.PI / 180;

const DEFAULT_PALETTE = {
  dog: 0x9b6a3c,
  cat: 0x30343b,
  horse: 0x7a4f2a,
  deer: 0x9a7040,
  bear: 0x5b3a29,
  pandaWhite: 0xf0eadc,
  pandaBlack: 0x171717,
  monkey: 0x7a4f2a,
  goat: 0xd8d0bb,
  tiger: 0xd97824,
  bird: 0x4f83cc,
  chicken: 0xf3f0df,
  fish: 0x3f8fb5,
  skin: 0xd9a06f,
  shirt: 0x3f6fb5,
  pants: 0x27364a,
  bark: 0x7a4f2a,
  leaf: 0x4f9d5d,
  pine: 0x2f7d4a,
  palm: 0x3a9b57,
  flowerStem: 0x4b8f3a,
  flowerPetal: 0xe85d75,
  grass: 0x4f9d5d,
  stone: 0x8a8f98,
  wood: 0x8b5a2b,
  metal: 0x69707a,
};

function mergeParams(defaults, params) {
  return { ...defaults, ...params };
}

function material(THREE, color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.9,
    metalness: options.metalness ?? 0,
    flatShading: true,
  });
}

function makeGroup(THREE, name, scale = 1) {
  const result = new THREE.Group();
  result.name = name;
  result.scale.setScalar(scale);
  return result;
}

function mesh(THREE, name, geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const result = new THREE.Mesh(geometry, mat);
  result.name = name;
  result.position.set(...position);
  result.rotation.set(...rotation);
  result.scale.set(...scale);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return result;
}

function box(THREE, name, size, mat, position, rotation, scale) {
  return mesh(THREE, name, new THREE.BoxGeometry(size[0], size[1], size[2]), mat, position, rotation, scale);
}

function cone(THREE, name, radius, height, segments, mat, position, rotation, scale) {
  return mesh(THREE, name, new THREE.ConeGeometry(radius, height, segments), mat, position, rotation, scale);
}

function cylinder(THREE, name, radiusTop, radiusBottom, height, segments, mat, position, rotation, scale) {
  return mesh(THREE, name, new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), mat, position, rotation, scale);
}

function ico(THREE, name, radius, mat, position, rotation, scale) {
  return mesh(THREE, name, new THREE.IcosahedronGeometry(radius, 0), mat, position, rotation, scale);
}

function addPair(target, left, right) {
  target.add(left, right);
  return target;
}

function createQuadruped(THREE, params = {}) {
  const p = mergeParams({
    name: 'LowPolyQuadruped',
    scale: 1,
    bodyColor: DEFAULT_PALETTE.dog,
    accentColor: null,
    bodyLength: 1.8,
    bodyHeight: 0.55,
    bodyWidth: 0.55,
    shoulderHeight: 0.75,
    neckLength: 0.35,
    headSize: [0.55, 0.42, 0.45],
    snoutLength: 0.28,
    earStyle: 'pointed',
    legLength: 0.72,
    legThickness: 0.14,
    tail: 'curved',
    tailLength: 0.7,
    hornStyle: 'none',
  }, params);

  const root = makeGroup(THREE, p.name, p.scale);
  const bodyMat = material(THREE, p.bodyColor);
  const accentMat = material(THREE, p.accentColor ?? p.bodyColor);
  const darkMat = material(THREE, 0x111111);

  root.add(box(THREE, 'Body', [p.bodyLength, p.bodyHeight, p.bodyWidth], bodyMat, [0, p.shoulderHeight, 0], [0, 0, 0], [1, 1, 1]));
  root.add(box(THREE, 'Neck', [p.neckLength, p.bodyHeight * 0.75, p.bodyWidth * 0.55], bodyMat, [p.bodyLength * 0.52, p.shoulderHeight + 0.18, 0], [0, 0, -20 * DEG], [1, 1, 1]));
  root.add(box(THREE, 'Head', p.headSize, bodyMat, [p.bodyLength * 0.75, p.shoulderHeight + 0.33, 0], [0, 0, 0], [1, 1, 1]));

  if (p.snoutLength > 0) {
    root.add(box(THREE, 'Snout', [p.snoutLength, p.headSize[1] * 0.45, p.headSize[2] * 0.55], accentMat, [p.bodyLength * 0.75 + p.headSize[0] * 0.55, p.shoulderHeight + 0.28, 0], [0, 0, 0], [1, 1, 1]));
  }

  root.add(ico(THREE, 'Eye.L', 0.035, darkMat, [p.bodyLength * 0.75 + 0.18, p.shoulderHeight + 0.43, p.headSize[2] * 0.31], [0, 0, 0], [1, 1, 1]));
  root.add(ico(THREE, 'Eye.R', 0.035, darkMat, [p.bodyLength * 0.75 + 0.18, p.shoulderHeight + 0.43, -p.headSize[2] * 0.31], [0, 0, 0], [1, 1, 1]));

  const legX = [-p.bodyLength * 0.34, p.bodyLength * 0.34];
  const legZ = [-p.bodyWidth * 0.34, p.bodyWidth * 0.34];
  legX.forEach((x, xi) => {
    legZ.forEach((z, zi) => {
      const side = z > 0 ? 'L' : 'R';
      const end = xi === 0 ? 'Back' : 'Front';
      root.add(cylinder(THREE, `Leg.${end}.${side}`, p.legThickness, p.legThickness * 1.15, p.legLength, 5, bodyMat, [x, p.legLength / 2, z], [0, 0, 0], [1, 1, 1]));
      root.add(box(THREE, `Foot.${end}.${side}`, [p.legThickness * 1.8, p.legThickness * 0.55, p.legThickness * 1.25], accentMat, [x + 0.04, 0.08, z], [0, 0, 0], [1, 1, 1]));
    });
  });

  if (p.earStyle !== 'none') {
    const earRadius = p.earStyle === 'round' ? 0.13 : 0.16;
    const earHeight = p.earStyle === 'round' ? 0.16 : 0.34;
    addPair(
      root,
      cone(THREE, 'Ear.L', earRadius, earHeight, p.earStyle === 'round' ? 8 : 4, bodyMat, [p.bodyLength * 0.72, p.shoulderHeight + 0.66, p.headSize[2] * 0.33], [0, 0, 15 * DEG], [1, 1, 1]),
      cone(THREE, 'Ear.R', earRadius, earHeight, p.earStyle === 'round' ? 8 : 4, bodyMat, [p.bodyLength * 0.72, p.shoulderHeight + 0.66, -p.headSize[2] * 0.33], [0, 0, 15 * DEG], [1, 1, 1])
    );
  }

  if (p.tail !== 'none') {
    const tailY = p.shoulderHeight + (p.tail === 'upright' ? 0.15 : 0);
    const tailRotZ = p.tail === 'upright' ? -55 * DEG : p.tail === 'down' ? 35 * DEG : -20 * DEG;
    root.add(cylinder(THREE, 'Tail', p.legThickness * 0.55, p.legThickness * 0.75, p.tailLength, 5, bodyMat, [-p.bodyLength * 0.62, tailY, 0], [0, 0, tailRotZ], [1, 1, 1]));
  }

  if (p.hornStyle === 'antlers') {
    addPair(
      root,
      cone(THREE, 'Antler.L', 0.055, 0.55, 4, accentMat, [p.bodyLength * 0.71, p.shoulderHeight + 0.88, p.headSize[2] * 0.24], [18 * DEG, 0, -18 * DEG], [1, 1, 1]),
      cone(THREE, 'Antler.R', 0.055, 0.55, 4, accentMat, [p.bodyLength * 0.71, p.shoulderHeight + 0.88, -p.headSize[2] * 0.24], [-18 * DEG, 0, -18 * DEG], [1, 1, 1])
    );
  } else if (p.hornStyle === 'single') {
    root.add(cone(THREE, 'Horn', 0.055, 0.42, 5, accentMat, [p.bodyLength * 0.95, p.shoulderHeight + 0.62, 0], [0, 0, -70 * DEG], [1, 1, 1]));
  }

  root.userData.procedural = { category: 'animal.quadruped', params: p };
  return root;
}

export function createLowPolyDog(THREE, params = {}) {
  return createQuadruped(THREE, mergeParams({
    name: 'LowPolyDog',
    bodyColor: DEFAULT_PALETTE.dog,
    accentColor: 0x6f4528,
    bodyLength: 1.65,
    tail: 'upright',
    tailLength: 0.62,
    earStyle: 'pointed',
  }, params));
}

export function createLowPolyCat(THREE, params = {}) {
  return createQuadruped(THREE, mergeParams({
    name: 'LowPolyCat',
    bodyColor: DEFAULT_PALETTE.cat,
    accentColor: 0x20242a,
    bodyLength: 1.35,
    bodyHeight: 0.42,
    bodyWidth: 0.38,
    shoulderHeight: 0.52,
    legLength: 0.48,
    legThickness: 0.09,
    headSize: [0.42, 0.34, 0.34],
    snoutLength: 0.14,
    tail: 'upright',
    tailLength: 0.85,
  }, params));
}

export function createLowPolyHorse(THREE, params = {}) {
  return createQuadruped(THREE, mergeParams({
    name: 'LowPolyHorse',
    bodyColor: DEFAULT_PALETTE.horse,
    accentColor: 0x2a1b12,
    bodyLength: 2.25,
    bodyHeight: 0.75,
    bodyWidth: 0.62,
    shoulderHeight: 1.05,
    legLength: 1.0,
    legThickness: 0.13,
    neckLength: 0.55,
    headSize: [0.62, 0.46, 0.38],
    snoutLength: 0.36,
    earStyle: 'pointed',
    tail: 'down',
    tailLength: 0.8,
  }, params));
}

export function createLowPolyDeer(THREE, params = {}) {
  return createQuadruped(THREE, mergeParams({
    name: 'LowPolyDeer',
    bodyColor: DEFAULT_PALETTE.deer,
    accentColor: 0xd8c49a,
    bodyLength: 1.75,
    bodyHeight: 0.58,
    bodyWidth: 0.42,
    shoulderHeight: 0.92,
    legLength: 0.88,
    legThickness: 0.09,
    headSize: [0.45, 0.38, 0.3],
    snoutLength: 0.22,
    hornStyle: 'antlers',
    tail: 'down',
    tailLength: 0.25,
  }, params));
}

export function createLowPolyGoat(THREE, params = {}) {
  const root = createQuadruped(THREE, mergeParams({
    name: 'LowPolyGoat',
    bodyColor: DEFAULT_PALETTE.goat,
    accentColor: 0x4a4237,
    bodyLength: 1.45,
    bodyHeight: 0.54,
    bodyWidth: 0.42,
    shoulderHeight: 0.72,
    legLength: 0.68,
    legThickness: 0.09,
    neckLength: 0.28,
    headSize: [0.42, 0.34, 0.3],
    snoutLength: 0.22,
    earStyle: 'pointed',
    tail: 'upright',
    tailLength: 0.22,
    hornStyle: 'none',
  }, params));
  const p = root.userData.procedural.params;
  const hornMat = material(THREE, p.accentColor ?? 0x4a4237);
  const beardMat = material(THREE, 0x3a332c);
  root.add(cone(THREE, 'Horn.L', 0.055, 0.38, 5, hornMat, [p.bodyLength * 0.72, p.shoulderHeight + 0.68, p.headSize[2] * 0.2], [16 * DEG, 0, -28 * DEG], [1, 1, 1]));
  root.add(cone(THREE, 'Horn.R', 0.055, 0.38, 5, hornMat, [p.bodyLength * 0.72, p.shoulderHeight + 0.68, -p.headSize[2] * 0.2], [-16 * DEG, 0, -28 * DEG], [1, 1, 1]));
  root.add(cone(THREE, 'GoatSimulatorBeard', 0.07, 0.24, 5, beardMat, [p.bodyLength * 0.93, p.shoulderHeight + 0.1, 0], [0, 0, 180 * DEG], [1, 1, 1]));
  root.add(box(THREE, 'AggressiveBrow', [0.32, 0.045, 0.05], hornMat, [p.bodyLength * 0.93, p.shoulderHeight + 0.49, 0], [0, 0, -8 * DEG], [1, 1, 1]));
  root.userData.procedural.category = 'animal.quadruped.goat-aggressive';
  return root;
}

export function createLowPolyTiger(THREE, params = {}) {
  const root = createQuadruped(THREE, mergeParams({
    name: 'LowPolyTiger',
    bodyColor: DEFAULT_PALETTE.tiger,
    accentColor: 0xf2d0a1,
    bodyLength: 1.9,
    bodyHeight: 0.5,
    bodyWidth: 0.46,
    shoulderHeight: 0.62,
    legLength: 0.56,
    legThickness: 0.1,
    headSize: [0.5, 0.38, 0.4],
    snoutLength: 0.16,
    earStyle: 'round',
    tail: 'curved',
    tailLength: 0.95,
  }, params));
  const p = root.userData.procedural.params;
  const stripeMat = material(THREE, 0x111111);
  const stripeXs = [-0.48, -0.18, 0.12, 0.42];
  stripeXs.forEach((x, i) => {
    root.add(box(THREE, `DangerCuteStripe.${i + 1}.L`, [0.06, p.bodyHeight * 1.05, 0.035], stripeMat, [x, p.shoulderHeight + 0.02, p.bodyWidth * 0.53], [0, 0, (i % 2 ? -12 : 12) * DEG], [1, 1, 1]));
    root.add(box(THREE, `DangerCuteStripe.${i + 1}.R`, [0.06, p.bodyHeight * 1.05, 0.035], stripeMat, [x, p.shoulderHeight + 0.02, -p.bodyWidth * 0.53], [0, 0, (i % 2 ? 12 : -12) * DEG], [1, 1, 1]));
  });
  root.add(box(THREE, 'ForeheadStripe', [0.05, 0.2, 0.035], stripeMat, [p.bodyLength * 0.98, p.shoulderHeight + 0.48, 0], [0, 0, 16 * DEG], [1, 1, 1]));
  root.add(cone(THREE, 'TinyFang.L', 0.025, 0.11, 4, material(THREE, 0xf7f1dc), [p.bodyLength * 0.98, p.shoulderHeight + 0.12, 0.08], [0, 0, 180 * DEG], [1, 1, 1]));
  root.add(cone(THREE, 'TinyFang.R', 0.025, 0.11, 4, material(THREE, 0xf7f1dc), [p.bodyLength * 0.98, p.shoulderHeight + 0.12, -0.08], [0, 0, 180 * DEG], [1, 1, 1]));
  root.userData.procedural.category = 'animal.quadruped.tiger-dangerously-cute';
  return root;
}

export function createLowPolyBear(THREE, params = {}) {
  const root = createQuadruped(THREE, mergeParams({
    name: 'LowPolyBear',
    bodyColor: DEFAULT_PALETTE.bear,
    accentColor: 0x3a241a,
    bodyLength: 1.9,
    bodyHeight: 0.72,
    bodyWidth: 0.72,
    shoulderHeight: 0.78,
    legLength: 0.58,
    legThickness: 0.17,
    headSize: [0.58, 0.46, 0.52],
    snoutLength: 0.18,
    earStyle: 'round',
    tail: 'none',
  }, params));
  const p = root.userData.procedural.params;
  const clawMat = material(THREE, 0xf2ead8);
  [-0.22, 0.22].forEach((x, xi) => {
    [-0.18, 0.18].forEach((z, zi) => {
      root.add(cone(THREE, `HungryClaw.${xi + 1}.${zi + 1}`, 0.035, 0.16, 4, clawMat, [x + 0.62, 0.08, z], [0, 0, -80 * DEG], [1, 1, 1]));
    });
  });
  root.add(ico(THREE, 'StolenSnack', 0.13, material(THREE, 0xe8b84d), [p.bodyLength * 0.78, 0.24, -0.34], [0, 0, 0], [1.2, 0.7, 1]));
  root.userData.procedural.category = 'animal.quadruped.bear-hungry-aggressive';
  return root;
}

export function createLowPolyPanda(THREE, params = {}) {
  const root = createQuadruped(THREE, mergeParams({
    name: 'LowPolyPanda',
    bodyColor: DEFAULT_PALETTE.pandaWhite,
    accentColor: DEFAULT_PALETTE.pandaBlack,
    bodyLength: 1.65,
    bodyHeight: 0.68,
    bodyWidth: 0.68,
    shoulderHeight: 0.72,
    legLength: 0.52,
    legThickness: 0.16,
    headSize: [0.58, 0.5, 0.56],
    snoutLength: 0.08,
    earStyle: 'round',
    tail: 'none',
  }, params));
  const p = root.userData.procedural.params;
  const blackMat = material(THREE, p.accentColor ?? DEFAULT_PALETTE.pandaBlack);
  root.add(ico(THREE, 'EyePatch.L', 0.09, blackMat, [p.bodyLength * 0.98, p.shoulderHeight + 0.43, p.headSize[2] * 0.28], [0, 0, 0], [1, 0.75, 0.45]));
  root.add(ico(THREE, 'EyePatch.R', 0.09, blackMat, [p.bodyLength * 0.98, p.shoulderHeight + 0.43, -p.headSize[2] * 0.28], [0, 0, 0], [1, 0.75, 0.45]));
  root.add(box(THREE, 'BellyPatch', [0.58, 0.42, 0.06], blackMat, [0.1, p.shoulderHeight + 0.02, p.bodyWidth * 0.53], [0, 0, 0], [1, 1, 1]));
  root.add(cylinder(THREE, 'BambooSnack', 0.035, 0.035, 0.62, 5, material(THREE, 0x5d9c59), [p.bodyLength * 0.74, 0.28, -0.34], [24 * DEG, 0, 84 * DEG], [1, 1, 1]));
  root.add(box(THREE, 'ConfusedCuteBrow', [0.26, 0.035, 0.04], blackMat, [p.bodyLength * 0.97, p.shoulderHeight + 0.55, 0], [0, 0, 10 * DEG], [1, 1, 1]));
  root.userData.procedural.category = 'animal.quadruped.panda-cutely-stupid';
  return root;
}

function createWingedBiped(THREE, params = {}) {
  const p = mergeParams({
    name: 'LowPolyBird',
    scale: 1,
    bodyColor: DEFAULT_PALETTE.bird,
    beakColor: 0xe0a13a,
    legColor: 0xc88b3a,
    bodyRadius: 0.42,
    bodyScale: [1, 1.25, 0.78],
    headRadius: 0.26,
    legLength: 0.38,
    wingSpan: 0.72,
    tail: true,
    crest: false,
  }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  const bodyMat = material(THREE, p.bodyColor);
  const beakMat = material(THREE, p.beakColor);
  const legMat = material(THREE, p.legColor);

  root.add(ico(THREE, 'Body', p.bodyRadius, bodyMat, [0, p.legLength + 0.35, 0], [0, 0, 0], p.bodyScale));
  root.add(ico(THREE, 'Head', p.headRadius, bodyMat, [0.36, p.legLength + 0.83, 0], [0, 0, 0], [1, 1, 1]));
  root.add(cone(THREE, 'Beak', 0.11, 0.32, 4, beakMat, [0.62, p.legLength + 0.83, 0], [0, 0, -90 * DEG], [1, 1, 1]));
  addPair(
    root,
    box(THREE, 'Wing.L', [0.12, p.wingSpan, 0.44], bodyMat, [0, p.legLength + 0.42, 0.42], [0, 0, -18 * DEG], [1, 1, 1]),
    box(THREE, 'Wing.R', [0.12, p.wingSpan, 0.44], bodyMat, [0, p.legLength + 0.42, -0.42], [0, 0, -18 * DEG], [1, 1, 1])
  );
  addPair(
    root,
    cylinder(THREE, 'Leg.L', 0.035, 0.045, p.legLength, 5, legMat, [0.12, p.legLength / 2, 0.12], [0, 0, 0], [1, 1, 1]),
    cylinder(THREE, 'Leg.R', 0.035, 0.045, p.legLength, 5, legMat, [0.12, p.legLength / 2, -0.12], [0, 0, 0], [1, 1, 1])
  );
  if (p.tail) {
    root.add(cone(THREE, 'TailFeathers', 0.18, 0.5, 5, bodyMat, [-0.43, p.legLength + 0.36, 0], [0, 0, 80 * DEG], [1, 0.75, 1]));
  }
  if (p.crest) {
    root.add(cone(THREE, 'Crest', 0.09, 0.28, 5, bodyMat, [0.31, p.legLength + 1.08, 0], [0, 0, 0], [1, 1, 1]));
  }
  root.userData.procedural = { category: 'animal.two-legged-with-wings', params: p };
  return root;
}

export function createLowPolyBird(THREE, params = {}) {
  return createWingedBiped(THREE, mergeParams({ name: 'LowPolyBird', bodyColor: DEFAULT_PALETTE.bird }, params));
}

export function createLowPolyChicken(THREE, params = {}) {
  return createWingedBiped(THREE, mergeParams({
    name: 'LowPolyChicken',
    bodyColor: DEFAULT_PALETTE.chicken,
    beakColor: 0xe7a82f,
    legColor: 0xd6973d,
    bodyRadius: 0.46,
    headRadius: 0.24,
    wingSpan: 0.48,
    tail: true,
    crest: true,
  }, params));
}

export function createLowPolyFish(THREE, params = {}) {
  const p = mergeParams({
    name: 'LowPolyFish',
    scale: 1,
    bodyColor: DEFAULT_PALETTE.fish,
    finColor: 0x2d6f99,
    bodyLength: 1.2,
    bodyRadius: 0.34,
    tailSize: 0.34,
  }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  const bodyMat = material(THREE, p.bodyColor);
  const finMat = material(THREE, p.finColor);
  root.add(ico(THREE, 'Body', p.bodyRadius, bodyMat, [0, p.bodyRadius, 0], [0, 0, 0], [p.bodyLength / 0.7, 0.85, 0.85]));
  root.add(cone(THREE, 'Tail', p.tailSize, p.tailSize * 1.35, 4, finMat, [-p.bodyLength * 0.72, p.bodyRadius, 0], [0, 0, 90 * DEG], [1, 1, 0.2]));
  root.add(cone(THREE, 'TopFin', 0.16, 0.32, 4, finMat, [-0.1, p.bodyRadius + 0.28, 0], [0, 0, 0], [1, 1, 0.35]));
  root.add(cone(THREE, 'SideFin.L', 0.12, 0.28, 4, finMat, [0.08, p.bodyRadius, 0.3], [90 * DEG, 0, 0], [1, 1, 0.35]));
  root.add(cone(THREE, 'SideFin.R', 0.12, 0.28, 4, finMat, [0.08, p.bodyRadius, -0.3], [-90 * DEG, 0, 0], [1, 1, 0.35]));
  root.userData.procedural = { category: 'animal.no-legs-with-tail', params: p };
  return root;
}

export function createLowPolyMonkey(THREE, params = {}) {
  const p = mergeParams({
    name: 'LowPolyMonkey',
    scale: 1,
    bodyColor: DEFAULT_PALETTE.monkey,
    faceColor: 0xd6a36f,
    chaosColor: 0xe8b84d,
    bodyHeight: 0.78,
    bodyWidth: 0.48,
    armLength: 0.78,
    legLength: 0.46,
    tailLength: 1.05,
  }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  const bodyMat = material(THREE, p.bodyColor);
  const faceMat = material(THREE, p.faceColor);
  const chaosMat = material(THREE, p.chaosColor);
  const darkMat = material(THREE, 0x111111);

  root.add(ico(THREE, 'Body', p.bodyWidth, bodyMat, [0, p.legLength + p.bodyHeight * 0.45, 0], [0, 0, 0], [0.8, 1.1, 0.72]));
  root.add(ico(THREE, 'Head', 0.32, bodyMat, [0.18, p.legLength + p.bodyHeight + 0.26, 0], [0, 0, 0], [1, 1, 1]));
  root.add(box(THREE, 'FaceMask', [0.16, 0.22, 0.36], faceMat, [0.44, p.legLength + p.bodyHeight + 0.23, 0], [0, 0, 0], [1, 1, 1]));
  root.add(ico(THREE, 'Eye.L', 0.035, darkMat, [0.54, p.legLength + p.bodyHeight + 0.31, 0.1], [0, 0, 0], [1, 1, 1]));
  root.add(ico(THREE, 'Eye.R', 0.035, darkMat, [0.54, p.legLength + p.bodyHeight + 0.31, -0.1], [0, 0, 0], [1, 1, 1]));
  root.add(box(THREE, 'AbsolutelyNutsGrin', [0.04, 0.045, 0.2], darkMat, [0.56, p.legLength + p.bodyHeight + 0.16, 0], [0, 0, 0], [1, 1, 1]));

  addPair(
    root,
    ico(THREE, 'Ear.L', 0.12, bodyMat, [0.16, p.legLength + p.bodyHeight + 0.27, 0.3], [0, 0, 0], [0.8, 1, 0.45]),
    ico(THREE, 'Ear.R', 0.12, bodyMat, [0.16, p.legLength + p.bodyHeight + 0.27, -0.3], [0, 0, 0], [0.8, 1, 0.45])
  );
  addPair(
    root,
    cylinder(THREE, 'LongArm.L', 0.055, 0.07, p.armLength, 5, bodyMat, [0.0, p.legLength + 0.32, 0.39], [25 * DEG, 0, 12 * DEG], [1, 1, 1]),
    cylinder(THREE, 'LongArm.R', 0.055, 0.07, p.armLength, 5, bodyMat, [0.0, p.legLength + 0.32, -0.39], [-25 * DEG, 0, 12 * DEG], [1, 1, 1])
  );
  addPair(
    root,
    cylinder(THREE, 'BentLeg.L', 0.065, 0.08, p.legLength, 5, bodyMat, [-0.08, p.legLength / 2, 0.16], [0, 0, -10 * DEG], [1, 1, 1]),
    cylinder(THREE, 'BentLeg.R', 0.065, 0.08, p.legLength, 5, bodyMat, [-0.08, p.legLength / 2, -0.16], [0, 0, -10 * DEG], [1, 1, 1])
  );
  root.add(cylinder(THREE, 'BananaTail', 0.045, 0.06, p.tailLength, 6, bodyMat, [-0.45, p.legLength + 0.46, 0], [0, 0, -58 * DEG], [1, 1, 1]));
  root.add(cone(THREE, 'ChaosBanana', 0.08, 0.36, 5, chaosMat, [0.28, p.legLength + 0.22, -0.52], [0, 0, -90 * DEG], [1, 1, 1]));
  root.add(cone(THREE, 'HairSpike', 0.08, 0.24, 5, bodyMat, [0.16, p.legLength + p.bodyHeight + 0.6, 0], [0, 0, 0], [1, 1, 1]));
  root.userData.procedural = { category: 'animal.biped.monkey-stupid-nuts', params: p };
  return root;
}

export function createLowPolyHuman(THREE, params = {}) {
  const p = mergeParams({
    name: 'LowPolyHuman',
    scale: 1,
    height: 1.8,
    skinColor: DEFAULT_PALETTE.skin,
    shirtColor: DEFAULT_PALETTE.shirt,
    pantsColor: DEFAULT_PALETTE.pants,
    hairColor: 0x2c1b12,
    build: 'average',
    hair: 'cap',
    tool: 'none',
  }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  const skinMat = material(THREE, p.skinColor);
  const shirtMat = material(THREE, p.shirtColor);
  const pantsMat = material(THREE, p.pantsColor);
  const hairMat = material(THREE, p.hairColor);
  const toolMat = material(THREE, DEFAULT_PALETTE.metal, { metalness: 0.1 });

  const width = p.build === 'strong' ? 1.15 : p.build === 'slim' ? 0.85 : 1;
  const legH = p.height * 0.46;
  const torsoH = p.height * 0.31;
  const headR = p.height * 0.085;
  const torsoY = legH + torsoH / 2;
  const shoulderY = legH + torsoH * 0.85;

  addPair(
    root,
    cylinder(THREE, 'Leg.L', 0.075 * width, 0.085 * width, legH, 5, pantsMat, [0, legH / 2, 0.095], [0, 0, 0], [1, 1, 1]),
    cylinder(THREE, 'Leg.R', 0.075 * width, 0.085 * width, legH, 5, pantsMat, [0, legH / 2, -0.095], [0, 0, 0], [1, 1, 1])
  );
  root.add(box(THREE, 'Torso', [0.42 * width, torsoH, 0.28 * width], shirtMat, [0, torsoY, 0], [0, 0, 0], [1, 1, 1]));
  addPair(
    root,
    cylinder(THREE, 'Arm.L', 0.055 * width, 0.065 * width, p.height * 0.34, 5, skinMat, [0, shoulderY - 0.14, 0.25 * width], [18 * DEG, 0, 0], [1, 1, 1]),
    cylinder(THREE, 'Arm.R', 0.055 * width, 0.065 * width, p.height * 0.34, 5, skinMat, [0, shoulderY - 0.14, -0.25 * width], [-18 * DEG, 0, 0], [1, 1, 1])
  );
  root.add(ico(THREE, 'Head', headR, skinMat, [0, p.height - headR * 1.1, 0], [0, 0, 0], [1, 1.1, 1]));
  if (p.hair !== 'none') {
    root.add(cone(THREE, p.hair === 'hat' ? 'Hat' : 'Hair', headR * 1.08, headR * 0.55, 8, hairMat, [0, p.height + headR * 0.2, 0], [0, 0, 0], [1, 1, 1]));
  }
  if (p.tool === 'axe') {
    root.add(cylinder(THREE, 'AxeHandle', 0.025, 0.025, p.height * 0.55, 5, material(THREE, DEFAULT_PALETTE.wood), [0.04, shoulderY - 0.12, -0.37], [0, 0, 18 * DEG], [1, 1, 1]));
    root.add(box(THREE, 'AxeHead', [0.2, 0.14, 0.05], toolMat, [0.14, shoulderY + 0.14, -0.42], [0, 0, 18 * DEG], [1, 1, 1]));
  } else if (p.tool === 'sword') {
    root.add(box(THREE, 'SwordBlade', [0.04, p.height * 0.42, 0.035], toolMat, [0.02, shoulderY - 0.06, -0.37], [0, 0, 12 * DEG], [1, 1, 1]));
  }
  root.userData.procedural = { category: 'human.basic', params: p };
  return root;
}

export function createLowPolyChild(THREE, params = {}) {
  return createLowPolyHuman(THREE, mergeParams({
    name: 'LowPolyChild',
    height: 1.25,
    build: 'slim',
    shirtColor: 0xe8b84d,
  }, params));
}

export function createLowPolyWorker(THREE, params = {}) {
  return createLowPolyHuman(THREE, mergeParams({
    name: 'LowPolyWorker',
    build: 'strong',
    shirtColor: 0xd68a2d,
    pantsColor: 0x353a40,
    hair: 'hat',
    hairColor: 0xe0b33f,
    tool: 'axe',
  }, params));
}

export function createLowPolyAdventurer(THREE, params = {}) {
  return createLowPolyHuman(THREE, mergeParams({
    name: 'LowPolyAdventurer',
    shirtColor: 0x4f7a42,
    pantsColor: 0x5a4734,
    hair: 'hat',
    hairColor: 0x6b4a2f,
    tool: 'sword',
  }, params));
}

export function createLowPolyRobot(THREE, params = {}) {
  return createLowPolyHuman(THREE, mergeParams({
    name: 'LowPolyRobot',
    skinColor: 0xaeb6bf,
    shirtColor: 0x77818c,
    pantsColor: 0x5a626b,
    hair: 'none',
    build: 'average',
  }, params));
}

export function createLowPolyOakTree(THREE, params = {}) {
  const p = mergeParams({ name: 'LowPolyOakTree', scale: 1, trunkColor: DEFAULT_PALETTE.bark, leafColor: DEFAULT_PALETTE.leaf, height: 2.2, crownRadius: 0.72 }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  root.add(cylinder(THREE, 'Trunk', 0.16, 0.24, p.height * 0.55, 6, material(THREE, p.trunkColor), [0, p.height * 0.275, 0], [0, 0, 0], [1, 1, 1]));
  root.add(ico(THREE, 'Crown.Center', p.crownRadius, material(THREE, p.leafColor), [0, p.height * 0.72, 0], [0, 0, 0], [1.1, 0.9, 1]));
  root.add(ico(THREE, 'Crown.Left', p.crownRadius * 0.62, material(THREE, p.leafColor), [-0.35, p.height * 0.68, 0.16], [0, 0, 0], [1, 0.9, 1]));
  root.add(ico(THREE, 'Crown.Right', p.crownRadius * 0.58, material(THREE, p.leafColor), [0.36, p.height * 0.7, -0.12], [0, 0, 0], [1, 0.9, 1]));
  root.userData.procedural = { category: 'object.plant.tree.oak', params: p };
  return root;
}

export function createLowPolyPineTree(THREE, params = {}) {
  const p = mergeParams({ name: 'LowPolyPineTree', scale: 1, trunkColor: DEFAULT_PALETTE.bark, leafColor: DEFAULT_PALETTE.pine, height: 2.4, tiers: 3 }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  root.add(cylinder(THREE, 'Trunk', 0.12, 0.18, p.height * 0.52, 6, material(THREE, p.trunkColor), [0, p.height * 0.26, 0], [0, 0, 0], [1, 1, 1]));
  for (let i = 0; i < p.tiers; i += 1) {
    const t = i / Math.max(1, p.tiers - 1);
    root.add(cone(THREE, `Needles.${i + 1}`, 0.74 - t * 0.22, 0.88 - t * 0.16, 7, material(THREE, p.leafColor), [0, p.height * (0.53 + t * 0.17), 0], [0, 0, 0], [1, 1, 1]));
  }
  root.userData.procedural = { category: 'object.plant.tree.pine', params: p };
  return root;
}

export function createLowPolyPalmTree(THREE, params = {}) {
  const p = mergeParams({ name: 'LowPolyPalmTree', scale: 1, trunkColor: DEFAULT_PALETTE.bark, leafColor: DEFAULT_PALETTE.palm, height: 2.5, leafCount: 7 }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  root.add(cylinder(THREE, 'CurvedTrunk', 0.13, 0.2, p.height * 0.82, 7, material(THREE, p.trunkColor), [0, p.height * 0.41, 0], [0, 0, -8 * DEG], [1, 1, 1]));
  for (let i = 0; i < p.leafCount; i += 1) {
    const angle = (i / p.leafCount) * Math.PI * 2;
    const x = Math.cos(angle) * 0.28;
    const z = Math.sin(angle) * 0.28;
    root.add(box(THREE, `PalmFrond.${i + 1}`, [0.72, 0.08, 0.18], material(THREE, p.leafColor), [x, p.height * 0.86, z], [0, -angle, -18 * DEG], [1, 1, 1]));
  }
  root.userData.procedural = { category: 'object.plant.tree.palm', params: p };
  return root;
}

export function createLowPolyFlower(THREE, params = {}) {
  const p = mergeParams({ name: 'LowPolyFlower', scale: 1, stemColor: DEFAULT_PALETTE.flowerStem, petalColor: DEFAULT_PALETTE.flowerPetal, centerColor: 0xf2c94c, height: 0.8, petals: 6 }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  root.add(cylinder(THREE, 'Stem', 0.025, 0.035, p.height, 5, material(THREE, p.stemColor), [0, p.height / 2, 0], [0, 0, 0], [1, 1, 1]));
  root.add(ico(THREE, 'Center', 0.08, material(THREE, p.centerColor), [0, p.height + 0.02, 0], [0, 0, 0], [1, 1, 1]));
  for (let i = 0; i < p.petals; i += 1) {
    const angle = (i / p.petals) * Math.PI * 2;
    root.add(ico(THREE, `Petal.${i + 1}`, 0.09, material(THREE, p.petalColor), [Math.cos(angle) * 0.13, p.height + Math.sin(angle) * 0.02, Math.sin(angle) * 0.13], [0, 0, 0], [1.2, 0.45, 0.8]));
  }
  root.userData.procedural = { category: 'object.plant.flower', params: p };
  return root;
}

export function createLowPolyGrassClump(THREE, params = {}) {
  const p = mergeParams({ name: 'LowPolyGrassClump', scale: 1, color: DEFAULT_PALETTE.grass, bladeCount: 9, radius: 0.35, height: 0.45 }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  const grassMat = material(THREE, p.color);
  for (let i = 0; i < p.bladeCount; i += 1) {
    const angle = (i / p.bladeCount) * Math.PI * 2;
    const r = p.radius * (0.35 + ((i * 37) % 100) / 180);
    root.add(cone(THREE, `Blade.${i + 1}`, 0.035, p.height * (0.75 + (i % 3) * 0.12), 3, grassMat, [Math.cos(angle) * r, p.height * 0.38, Math.sin(angle) * r], [0, angle, (i % 2 ? 8 : -8) * DEG], [1, 1, 1]));
  }
  root.userData.procedural = { category: 'object.plant.grass', params: p };
  return root;
}

export function createLowPolyBush(THREE, params = {}) {
  const p = mergeParams({ name: 'LowPolyBush', scale: 1, color: DEFAULT_PALETTE.leaf, radius: 0.45 }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  const bushMat = material(THREE, p.color);
  root.add(ico(THREE, 'Mass.Center', p.radius, bushMat, [0, p.radius * 0.75, 0], [0, 0, 0], [1.2, 0.8, 1]));
  root.add(ico(THREE, 'Mass.Left', p.radius * 0.68, bushMat, [-p.radius * 0.55, p.radius * 0.65, 0.12], [0, 0, 0], [1, 0.8, 1]));
  root.add(ico(THREE, 'Mass.Right', p.radius * 0.64, bushMat, [p.radius * 0.55, p.radius * 0.67, -0.14], [0, 0, 0], [1, 0.8, 1]));
  root.userData.procedural = { category: 'object.plant.bush', params: p };
  return root;
}

export function createLowPolyRock(THREE, params = {}) {
  const p = mergeParams({ name: 'LowPolyRock', scale: 1, color: DEFAULT_PALETTE.stone, radius: 0.45, stretch: [1.25, 0.65, 0.9] }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  root.add(ico(THREE, 'RockMass', p.radius, material(THREE, p.color), [0, p.radius * 0.55, 0], [0, 0, 0], p.stretch));
  root.userData.procedural = { category: 'object.prop.rock', params: p };
  return root;
}

export function createLowPolyCrate(THREE, params = {}) {
  const p = mergeParams({ name: 'LowPolyCrate', scale: 1, color: DEFAULT_PALETTE.wood, bandColor: 0x4b2e18, size: 0.8 }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  const woodMat = material(THREE, p.color);
  const bandMat = material(THREE, p.bandColor);
  root.add(box(THREE, 'Box', [p.size, p.size, p.size], woodMat, [0, p.size / 2, 0], [0, 0, 0], [1, 1, 1]));
  root.add(box(THREE, 'Band.Vertical', [p.size * 1.04, p.size * 1.06, p.size * 0.12], bandMat, [0, p.size / 2, p.size * 0.51], [0, 0, 0], [1, 1, 1]));
  root.add(box(THREE, 'Band.Horizontal', [p.size * 1.04, p.size * 0.12, p.size * 1.06], bandMat, [0, p.size * 0.55, 0], [0, 0, 0], [1, 1, 1]));
  root.userData.procedural = { category: 'object.prop.crate', params: p };
  return root;
}

export function createLowPolyBarrel(THREE, params = {}) {
  const p = mergeParams({ name: 'LowPolyBarrel', scale: 1, color: DEFAULT_PALETTE.wood, bandColor: DEFAULT_PALETTE.metal, height: 0.9, radius: 0.36 }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  const woodMat = material(THREE, p.color);
  const bandMat = material(THREE, p.bandColor, { metalness: 0.1 });
  root.add(cylinder(THREE, 'Body', p.radius * 0.9, p.radius, p.height, 8, woodMat, [0, p.height / 2, 0], [0, 0, 0], [1, 1, 1]));
  root.add(cylinder(THREE, 'Band.Top', p.radius * 0.94, p.radius * 0.96, 0.08, 8, bandMat, [0, p.height * 0.78, 0], [0, 0, 0], [1, 1, 1]));
  root.add(cylinder(THREE, 'Band.Bottom', p.radius * 0.98, p.radius, 0.08, 8, bandMat, [0, p.height * 0.22, 0], [0, 0, 0], [1, 1, 1]));
  root.userData.procedural = { category: 'object.prop.barrel', params: p };
  return root;
}

export function createLowPolyMushroom(THREE, params = {}) {
  const p = mergeParams({ name: 'LowPolyMushroom', scale: 1, stemColor: 0xe7d8bf, capColor: 0xc94f4f, height: 0.55 }, params);
  const root = makeGroup(THREE, p.name, p.scale);
  root.add(cylinder(THREE, 'Stem', 0.08, 0.12, p.height * 0.72, 6, material(THREE, p.stemColor), [0, p.height * 0.36, 0], [0, 0, 0], [1, 1, 1]));
  root.add(cone(THREE, 'Cap', 0.32, p.height * 0.38, 8, material(THREE, p.capColor), [0, p.height * 0.78, 0], [0, 0, 0], [1, 0.75, 1]));
  root.userData.procedural = { category: 'object.plant.mushroom', params: p };
  return root;
}

export const LOW_POLY_FACTORIES = {
  dog: createLowPolyDog,
  cat: createLowPolyCat,
  horse: createLowPolyHorse,
  deer: createLowPolyDeer,
  goat: createLowPolyGoat,
  tiger: createLowPolyTiger,
  bear: createLowPolyBear,
  panda: createLowPolyPanda,
  monkey: createLowPolyMonkey,
  bird: createLowPolyBird,
  chicken: createLowPolyChicken,
  fish: createLowPolyFish,
  human: createLowPolyHuman,
  child: createLowPolyChild,
  worker: createLowPolyWorker,
  adventurer: createLowPolyAdventurer,
  robot: createLowPolyRobot,
  oakTree: createLowPolyOakTree,
  pineTree: createLowPolyPineTree,
  palmTree: createLowPolyPalmTree,
  flower: createLowPolyFlower,
  grassClump: createLowPolyGrassClump,
  bush: createLowPolyBush,
  rock: createLowPolyRock,
  crate: createLowPolyCrate,
  barrel: createLowPolyBarrel,
  mushroom: createLowPolyMushroom,
};

export function createLowPolyModel(THREE, kind, params = {}) {
  const factory = LOW_POLY_FACTORIES[kind];
  if (!factory) {
    throw new Error(`Unknown low-poly model kind: ${kind}`);
  }
  return factory(THREE, params);
}
