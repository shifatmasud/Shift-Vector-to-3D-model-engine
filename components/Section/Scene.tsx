/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { createModelFromSVG, RGBShiftShader, PixelationShader, ScanLineShader } from '../../services/three.tsx';
import type { LightingPreset, MaterialProps } from '../../types/three.tsx';

interface ThreeSceneProps {
  svgData: string | null;
  extrusionDepth: number;
  bevelSegments: number;
  materialProps: MaterialProps;
  lightingPreset: LightingPreset;
  backgroundColor: string;
  isGridVisible: boolean;
  isGlitchEffectEnabled: boolean;
  isBloomEffectEnabled: boolean;
  isPixelationEffectEnabled: boolean;
  isChromaticAberrationEnabled: boolean;
  isScanLinesEnabled: boolean;
}

export interface ThreeSceneRef {
  getModel: () => THREE.Group | null;
  getAnimations: () => THREE.AnimationClip[];
}

const Scene = forwardRef<ThreeSceneRef, ThreeSceneProps>(({ 
    svgData, extrusionDepth, bevelSegments, materialProps, lightingPreset, 
    backgroundColor, isGridVisible, isGlitchEffectEnabled, isBloomEffectEnabled, 
    isPixelationEffectEnabled, isChromaticAberrationEnabled, isScanLinesEnabled 
}, ref) => {
    
    const mountRef = useRef<HTMLDivElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);
    const animationsRef = useRef<THREE.AnimationClip[]>([]);
    
    // Refs for effects and helpers
    const composerRef = useRef<EffectComposer | null>(null);
    const bloomPassRef = useRef<UnrealBloomPass | null>(null);
    const rgbShiftPassRef = useRef<ShaderPass | null>(null);
    const pixelationPassRef = useRef<ShaderPass | null>(null);
    const scanLinesPassRef = useRef<ShaderPass | null>(null);
    const gridHelperRef = useRef<THREE.GridHelper | null>(null);
    const lightsRef = useRef<THREE.Group | null>(null);

    useImperativeHandle(ref, () => ({
        getModel: () => modelRef.current,
        getAnimations: () => animationsRef.current,
    }), []);

    // Initial setup
    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        const scene = new THREE.Scene();
        sceneRef.current = scene;
        
        const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 50;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        rendererRef.current = renderer;
        currentMount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // Post-processing
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        composerRef.current = composer;

        // Effect Passes
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight), 0.4, 0.1, 0.1);
        composer.addPass(bloomPass);
        bloomPassRef.current = bloomPass;

        const rgbShiftPass = new ShaderPass(RGBShiftShader);
        composer.addPass(rgbShiftPass);
        rgbShiftPassRef.current = rgbShiftPass;

        const pixelationPass = new ShaderPass(PixelationShader);
        pixelationPass.uniforms['resolution'].value.set(currentMount.clientWidth, currentMount.clientHeight);
        composer.addPass(pixelationPass);
        pixelationPassRef.current = pixelationPass;

        const scanLinesPass = new ShaderPass(ScanLineShader);
        composer.addPass(scanLinesPass);
        scanLinesPassRef.current = scanLinesPass;
        
        // Helpers
        const lights = new THREE.Group();
        lightsRef.current = lights;
        scene.add(lights);

        const gridHelper = new THREE.GridHelper(200, 50, 0x555555, 0x333333);
        gridHelperRef.current = gridHelper;
        scene.add(gridHelper);

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            controls.update();
            composer.render();
        };
        animate();

        const handleResize = () => {
            if (mountRef.current) {
                const { clientWidth, clientHeight } = mountRef.current;
                camera.aspect = clientWidth / clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(clientWidth, clientHeight);
                composer.setSize(clientWidth, clientHeight);
                if (pixelationPassRef.current) {
                    pixelationPassRef.current.uniforms['resolution'].value.set(clientWidth, clientHeight);
                }
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if(currentMount && renderer.domElement) currentMount.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    // Update model when SVG data or geometry settings change
    useEffect(() => {
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const controls = camera && rendererRef.current ? new OrbitControls(camera, rendererRef.current.domElement) : null;
        if (!scene || !camera || !controls) return;

        if (modelRef.current) scene.remove(modelRef.current);
        
        if (svgData) {
            const model = createModelFromSVG(svgData, extrusionDepth, bevelSegments, materialProps);
            modelRef.current = model;
            scene.add(model);
            
            // Frame camera
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            cameraZ *= 1.5;
            
            camera.position.copy(center);
            camera.position.z += cameraZ;
            controls.target.copy(center);
            controls.update();

        } else {
            modelRef.current = null;
        }
    }, [svgData, extrusionDepth, bevelSegments]);

    // Update material
    useEffect(() => {
        if (modelRef.current) {
            modelRef.current.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    const material = object.material as THREE.MeshPhysicalMaterial;
                    material.color.set(materialProps.color).convertSRGBToLinear();
                    material.roughness = materialProps.roughness;
                    material.metalness = materialProps.metalness;
                    material.transmission = materialProps.transmission;
                    material.ior = materialProps.ior;
                    material.thickness = materialProps.thickness;
                    material.transparent = materialProps.transmission > 0;
                    material.needsUpdate = true;
                }
            });
        }
    }, [materialProps]);
    
    // Update lighting
    useEffect(() => {
        const lights = lightsRef.current;
        if (!lights) return;
        while (lights.children.length > 0) lights.remove(lights.children[0]);
        
        if (lightingPreset === 'studio') {
            lights.add(new THREE.AmbientLight(0xffffff, 0.7));
            const dir1 = new THREE.DirectionalLight(0xffffff, 1.0);
            dir1.position.set(50, 50, 50);
            const dir2 = new THREE.DirectionalLight(0xffffff, 0.6);
            dir2.position.set(-50, 50, -50);
            lights.add(dir1, dir2);
        } else if (lightingPreset === 'dramatic') {
            lights.add(new THREE.AmbientLight(0xffffff, 0.2));
            const key = new THREE.SpotLight(0xffffff, 2.5, 300, Math.PI / 4, 0.5);
            key.position.set(60, 80, 40);
            lights.add(key);
        } else if (lightingPreset === 'soft') {
            lights.add(new THREE.AmbientLight(0xffffff, 0.8));
            const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
            hemi.position.set(0, 100, 0);
            lights.add(hemi);
        }
    }, [lightingPreset]);

    // Update scene background
    useEffect(() => {
        if (rendererRef.current) {
            rendererRef.current.setClearColor(new THREE.Color(backgroundColor));
        }
    }, [backgroundColor]);
    
    // Update grid visibility
    useEffect(() => {
        if (gridHelperRef.current) gridHelperRef.current.visible = isGridVisible;
    }, [isGridVisible]);

    // Update effects
    useEffect(() => {
        if (bloomPassRef.current) bloomPassRef.current.enabled = isBloomEffectEnabled;
        if (pixelationPassRef.current) pixelationPassRef.current.enabled = isPixelationEffectEnabled;
        if (scanLinesPassRef.current) scanLinesPassRef.current.enabled = isScanLinesEnabled;
        if (rgbShiftPassRef.current) {
            rgbShiftPassRef.current.enabled = isChromaticAberrationEnabled || isGlitchEffectEnabled;
            if (isChromaticAberrationEnabled && !isGlitchEffectEnabled) {
                rgbShiftPassRef.current.uniforms['amount'].value = 0.0035;
            }
        }
    }, [isBloomEffectEnabled, isPixelationEffectEnabled, isScanLinesEnabled, isChromaticAberrationEnabled, isGlitchEffectEnabled]);


    return <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute' }} />;
});

export default Scene;
