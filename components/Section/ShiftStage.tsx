/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'https://esm.sh/three@0.180.0/examples/jsm/controls/OrbitControls.js';
import { SVGLoader } from 'https://esm.sh/three@0.180.0/examples/jsm/loaders/SVGLoader.js';
import { GLTFExporter } from 'https://esm.sh/three@0.180.0/examples/jsm/exporters/GLTFExporter.js';
import { EffectComposer } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://esm.sh/three@0.180.0/examples/jsm/postprocessing/ShaderPass.js';
import { LoopSubdivision } from 'https://esm.sh/three@0.180.0/examples/jsm/modifiers/LoopSubdivision.js';
import { ShiftState } from '../../types/index.tsx';

// --- SHADERS ---
const RGBShiftShader = { uniforms: { 'tDiffuse': { value: null }, 'amount': { value: 0.005 }, 'angle': { value: 0.0 } }, vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`, fragmentShader: `uniform sampler2D tDiffuse; uniform float amount; uniform float angle; varying vec2 vUv; void main() { vec2 offset = amount * vec2( cos(angle), sin(angle)); vec4 r = texture2D(tDiffuse, vUv + offset); vec4 g = texture2D(tDiffuse, vUv); vec4 b = texture2D(tDiffuse, vUv - offset); gl_FragColor = vec4(r.r, g.g, b.b, g.a); }` };
const PixelationShader = { uniforms: { 'tDiffuse': { value: null }, 'pixelSize': { value: 8.0 }, 'resolution': { value: new THREE.Vector2() } }, vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`, fragmentShader: `uniform sampler2D tDiffuse; uniform float pixelSize; uniform vec2 resolution; varying vec2 vUv; void main() { vec2 newUv = floor(vUv * resolution / pixelSize) * pixelSize / resolution; gl_FragColor = texture2D(tDiffuse, newUv); }` };
const ScanLineShader = { uniforms: { 'tDiffuse': { value: null } }, vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }`, fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; void main() { vec4 originalColor = texture2D(tDiffuse, vUv); float lineFactor = 400.0; float intensity = sin(vUv.y * lineFactor); vec3 scanLineColor = originalColor.rgb * (1.0 - 0.15 * pow(intensity, 2.0)); gl_FragColor = vec4(scanLineColor, originalColor.a); }` };

// --- HELPERS ---
const createModelFromSVG = (svgString: string, extrusionDepth: number, bevelSegments: number, subdivisions: number, color: string): THREE.Group => {
  const loader = new SVGLoader();
  const data = loader.parse(svgString);
  const group = new THREE.Group();
  const extrudeSettings = { depth: extrusionDepth, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments };
  const subdivisionModifier = new LoopSubdivision();

  data.paths.forEach((path) => {
    const fillColor = path.userData?.style?.fill;
    const initialColor = (fillColor && fillColor !== 'none') ? fillColor : color;
    const material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(initialColor),
        side: THREE.DoubleSide
    });
    
    if (path.userData?.style?.fill !== 'none') {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape) => {
        let geometry: THREE.BufferGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        if (subdivisions > 0) {
            geometry = subdivisionModifier.modify(geometry, subdivisions);
        }
        const mesh = new THREE.Mesh(geometry, material);
        group.add(mesh);
      });
    }
  });
  group.scale.y *= -1; // Flip Y for SVG
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.position.sub(center); // Center it
  return group;
};

export interface ShiftStageRef {
  exportGLB: () => void;
}

interface ShiftStageProps {
  state: ShiftState;
}

const ShiftStage = forwardRef<ShiftStageRef, ShiftStageProps>(({ state }, ref) => {
    const mountRef = useRef<HTMLDivElement>(null);
    // Three.js Refs
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);
    const modelWrapperRef = useRef<THREE.Group | null>(null);
    const lightsRef = useRef<THREE.Group | null>(null);
    const gridHelperRef = useRef<THREE.GridHelper | null>(null);
    
    // Pass Refs
    const bloomPassRef = useRef<UnrealBloomPass | null>(null);
    const rgbShiftPassRef = useRef<ShaderPass | null>(null);
    const pixelationPassRef = useRef<ShaderPass | null>(null);
    const scanLinesPassRef = useRef<ShaderPass | null>(null);

    // Animation Refs
    const clockRef = useRef<THREE.Clock | null>(null);
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);

    // --- EXPORT IMPERATIVE HANDLE ---
    useImperativeHandle(ref, () => ({
        exportGLB: () => {
             const model = modelWrapperRef.current; // Export the wrapper
             if (model) {
                const exporter = new GLTFExporter();
                exporter.parse(model, (gltf) => {
                    const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'model.glb';
                    link.click();
                }, (err) => console.error(err), { binary: true });
             }
        }
    }), []);

    // --- INIT SCENE ---
    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        clockRef.current = new THREE.Clock();
        const scene = new THREE.Scene(); sceneRef.current = scene;
        
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 50; cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Post Processing
        const composer = new EffectComposer(renderer); composerRef.current = composer;
        composer.addPass(new RenderPass(scene, camera));
        
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight), 0.4, 0.1, 0.1); 
        composer.addPass(bloomPass); bloomPassRef.current = bloomPass;
        
        const rgbShiftPass = new ShaderPass(RGBShiftShader); composer.addPass(rgbShiftPass); rgbShiftPassRef.current = rgbShiftPass;
        const pixelationPass = new ShaderPass(PixelationShader); pixelationPass.uniforms['resolution'].value.set(currentMount.clientWidth, currentMount.clientHeight); composer.addPass(pixelationPass); pixelationPassRef.current = pixelationPass;
        const scanLinesPass = new ShaderPass(ScanLineShader); composer.addPass(scanLinesPass); scanLinesPassRef.current = scanLinesPass;

        // Lights, Grid, and Model Wrapper
        const lights = new THREE.Group(); lightsRef.current = lights; scene.add(lights);
        const gridHelper = new THREE.GridHelper(200, 50, 0x444444, 0x222222); gridHelperRef.current = gridHelper; scene.add(gridHelper);
        const modelWrapper = new THREE.Group(); modelWrapperRef.current = modelWrapper; scene.add(modelWrapper);

        // Loop
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            controls.update();
            const clock = clockRef.current;
            if (clock) {
                 const delta = clock.getDelta();
                 const time = clock.getElapsedTime();
                 if (mixerRef.current) mixerRef.current.update(delta);
                 // Glitch Animation
                 if (rgbShiftPassRef.current && state.isGlitchEnabled) {
                     rgbShiftPassRef.current.uniforms['amount'].value = Math.sin(time * 20) * 0.003 + 0.003;
                     rgbShiftPassRef.current.uniforms['angle'].value = Math.sin(time * 5) * Math.PI;
                 }
            }
            composer.render();
        };
        animate();

        // Resize
        const handleResize = () => {
            if (!mountRef.current || !camera || !renderer || !composer) return;
            const width = mountRef.current.clientWidth;
            const height = mountRef.current.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
            composer.setSize(width, height);
            if (pixelationPassRef.current) pixelationPassRef.current.uniforms['resolution'].value.set(width, height);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            if (currentMount && renderer.domElement) currentMount.removeChild(renderer.domElement);
            renderer.dispose();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    // --- UPDATE GEOMETRY (When SVG Data changes) ---
    useEffect(() => {
        const camera = cameraRef.current;
        const modelWrapper = modelWrapperRef.current;
        if (!camera || !modelWrapper) return;

        if (modelRef.current) {
            modelWrapper.remove(modelRef.current);
            modelRef.current.traverse((o) => {
                if (o instanceof THREE.Mesh) o.geometry.dispose();
            });
        }

        if (state.svgData) {
            const model = createModelFromSVG(state.svgData, state.extrusion, state.bevelSegments, state.subdivisions, state.color);
            modelRef.current = model;
            modelWrapper.add(model);

            // Fit Camera
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
            camera.position.set(size.x/4, size.y/4, cameraZ);
            camera.lookAt(0,0,0);
        } else {
            modelRef.current = null;
        }
    }, [state.svgData, state.extrusion, state.bevelSegments, state.subdivisions]);

    // --- UPDATE MATERIAL ---
    useEffect(() => {
        if (!modelRef.current) return;
        modelRef.current.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const material = object.material as THREE.MeshPhysicalMaterial;
                material.color.set(state.color);
                material.roughness = state.roughness;
                material.metalness = state.metalness;
                material.transmission = state.transmission;
                material.ior = state.ior;
                material.thickness = state.thickness;
                material.transparent = state.transmission > 0;
            }
        });
    }, [state.color, state.roughness, state.metalness, state.transmission, state.ior, state.thickness, state.svgData]);

    // --- UPDATE SCENE & EFFECTS ---
    useEffect(() => {
        // Lighting
        const lights = lightsRef.current;
        if (lights) {
            lights.clear();
            if (state.lightingPreset === 'studio') { 
                lights.add(new THREE.AmbientLight(0xffffff, 0.7)); 
                const d1 = new THREE.DirectionalLight(0xffffff, 1); d1.position.set(50,50,50); lights.add(d1);
            } else if (state.lightingPreset === 'dramatic') {
                lights.add(new THREE.AmbientLight(0xffffff, 0.2));
                const key = new THREE.SpotLight(0xffffff, 2.5); key.position.set(60,80,40); lights.add(key);
            } else {
                 lights.add(new THREE.AmbientLight(0xffffff, 0.8));
                 const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9); hemi.position.set(0,100,0); lights.add(hemi);
            }
        }
        
        // Background & Grid
        if (sceneRef.current) sceneRef.current.background = new THREE.Color(state.backgroundColor);
        if (gridHelperRef.current) gridHelperRef.current.visible = state.isGridVisible;

        // Transforms
        if (modelWrapperRef.current) {
            modelWrapperRef.current.rotation.x = THREE.MathUtils.degToRad(state.rotateX);
            modelWrapperRef.current.rotation.y = THREE.MathUtils.degToRad(state.rotateY);
            modelWrapperRef.current.scale.set(state.scale, state.scale, state.scale);
        }

        // Post Processing toggles
        if (bloomPassRef.current) bloomPassRef.current.enabled = state.isBloomEnabled;
        if (pixelationPassRef.current) pixelationPassRef.current.enabled = state.isPixelationEnabled;
        if (scanLinesPassRef.current) scanLinesPassRef.current.enabled = state.isScanLinesEnabled;
        
        // Glitch Logic
        if (rgbShiftPassRef.current) {
            rgbShiftPassRef.current.enabled = state.isGlitchEnabled || state.isChromaticAberrationEnabled;
            if (state.isChromaticAberrationEnabled && !state.isGlitchEnabled) {
                 rgbShiftPassRef.current.uniforms['amount'].value = 0.0035;
                 rgbShiftPassRef.current.uniforms['angle'].value = 0.5;
            }
        }

    }, [state.lightingPreset, state.backgroundColor, state.isGridVisible, state.rotateX, state.rotateY, state.scale, state.isBloomEnabled, state.isPixelationEnabled, state.isScanLinesEnabled, state.isGlitchEnabled, state.isChromaticAberrationEnabled]);

    return (
        <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} onPointerDown={(e) => (e.target as HTMLDivElement).style.cursor = 'grabbing'} onPointerUp={(e) => (e.target as HTMLDivElement).style.cursor = 'grab'} />
    );
});

export default ShiftStage;