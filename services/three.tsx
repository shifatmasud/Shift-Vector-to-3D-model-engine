/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import type { MaterialProps } from '../types/three.tsx';

export const createModelFromSVG = (svgString: string, extrusionDepth: number, bevelSegments: number, materialProps: MaterialProps): THREE.Group => {
  const loader = new SVGLoader();
  const data = loader.parse(svgString);

  const group = new THREE.Group();
  const extrudeSettings = {
    depth: extrusionDepth,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.5,
    bevelSegments: bevelSegments,
  };

  data.paths.forEach((path) => {
    const fillColor = path.userData?.style?.fill;
    const initialColor = (fillColor && fillColor !== 'none') ? fillColor : materialProps.color;

    const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(initialColor),
        roughness: materialProps.roughness,
        metalness: materialProps.metalness,
        side: THREE.DoubleSide,
        transmission: materialProps.transmission,
        ior: materialProps.ior,
        thickness: materialProps.thickness,
        transparent: materialProps.transmission > 0,
    });
    material.color.convertSRGBToLinear();

    if (path.userData?.style?.fill !== 'none' && path.userData?.style?.fill !== undefined) {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      });
    }
  });
  
  group.scale.y *= -1;

  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.position.sub(center);

  return group;
};

// --- SHADERS ---

export const RGBShiftShader = {
    uniforms: { 'tDiffuse': { value: null }, 'amount': { value: 0.005 }, 'angle': { value: 0.0 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float amount; uniform float angle; varying vec2 vUv; void main() { vec2 offset = amount * vec2( cos(angle), sin(angle)); vec4 r = texture2D(tDiffuse, vUv + offset); vec4 g = texture2D(tDiffuse, vUv); vec4 b = texture2D(tDiffuse, vUv - offset); gl_FragColor = vec4(r.r, g.g, b.b, g.a); }`
};

export const PixelationShader = {
    uniforms: { 'tDiffuse': { value: null }, 'pixelSize': { value: 8.0 }, 'resolution': { value: new THREE.Vector2() } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float pixelSize; uniform vec2 resolution; varying vec2 vUv; void main() { vec2 newUv = floor(vUv * resolution / pixelSize) * pixelSize / resolution; gl_FragColor = texture2D(tDiffuse, newUv); }`
};

export const ScanLineShader = {
    uniforms: { 'tDiffuse': { value: null }, 'intensity': { value: 0.15 } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float intensity; varying vec2 vUv; void main() { vec4 originalColor = texture2D(tDiffuse, vUv); float lineFactor = 400.0; float lineIntensity = sin(vUv.y * lineFactor); vec3 scanLineColor = originalColor.rgb * (1.0 - intensity * pow(lineIntensity, 2.0)); gl_FragColor = vec4(scanLineColor, originalColor.a); }`
};
