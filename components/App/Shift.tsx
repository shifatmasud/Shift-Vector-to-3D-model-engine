/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { useTheme } from '../../Theme.tsx';
import Sidebar from '../Section/Sidebar.tsx';
import Scene, { type ThreeSceneRef } from '../Section/Scene.tsx';
import WelcomeStage from '../Section/WelcomeStage.tsx';
import Loader from '../Core/Loader.tsx';
import ThemeToggleButton from '../Core/ThemeToggleButton.tsx';
import type { LightingPreset, MaterialProps } from '../../types/three.tsx';

const Shift = () => {
    const { theme } = useTheme();

    // App State
    const [svgData, setSvgData] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [key, setKey] = useState<number>(0); // Used to force remount of Scene

    // 3D Model & Scene State
    const [extrusion, setExtrusion] = useState<number>(10);
    const [bevelSegments, setBevelSegments] = useState<number>(2);
    const [materialProps, setMaterialProps] = useState<MaterialProps>({
        color: '#cccccc',
        roughness: 0.5,
        metalness: 0.1,
        transmission: 0,
        ior: 1.5,
        thickness: 0.5,
    });
    const [lightingPreset, setLightingPreset] = useState<LightingPreset>('studio');
    const [backgroundColor, setBackgroundColor] = useState<string>(theme.Color.Base.Surface[1]);
    const [isGridVisible, setIsGridVisible] = useState<boolean>(true);

    // Post-Processing Effects State
    const [isGlitchEffectEnabled, setIsGlitchEffectEnabled] = useState<boolean>(false);
    const [isBloomEffectEnabled, setIsBloomEffectEnabled] = useState<boolean>(false);
    const [isPixelationEffectEnabled, setIsPixelationEffectEnabled] = useState<boolean>(false);
    const [isChromaticAberrationEnabled, setIsChromaticAberrationEnabled] = useState<boolean>(false);
    const [isScanLinesEnabled, setIsScanLinesEnabled] = useState<boolean>(false);

    const sceneRef = useRef<ThreeSceneRef>(null);

    const handleFileLoad = useCallback((svgContent: string) => {
        setIsLoading(true);
        setError(null);
        setTimeout(() => {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgContent, "image/svg+xml");
                if (doc.getElementsByTagName("parsererror").length > 0) {
                    throw new Error("Invalid SVG file format.");
                }
                setSvgData(svgContent);
                setKey(prevKey => prevKey + 1);
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
                setError(`Failed to process SVG: ${errorMessage}`);
                setSvgData(null);
            } finally {
                setIsLoading(false);
            }
        }, 500); // Simulate processing time
    }, []);

    const handleClear = useCallback(() => {
        setSvgData(null);
        setError(null);
        setKey(prevKey => prevKey + 1);
    }, []);

    const handleExport = () => {
        const model = sceneRef.current?.getModel();
        if (model) {
            const exporter = new GLTFExporter();
            const options = { animations: sceneRef.current?.getAnimations() || [], binary: true };
            exporter.parse(model, (gltf) => {
                const blob = new Blob([gltf as ArrayBuffer], { type: 'application/octet-stream' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'model.glb';
                link.click();
                URL.revokeObjectURL(link.href);
            }, (error) => {
                console.error('An error happened during GLTF export', error);
                alert("Could not export model. See console for details.");
            }, options);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            <ThemeToggleButton />
            <Sidebar
                onFileLoad={handleFileLoad}
                onClear={handleClear}
                onExport={handleExport}
                isLoading={isLoading}
                hasModel={!!svgData}
                error={error}
                extrusion={extrusion}
                setExtrusion={setExtrusion}
                bevelSegments={bevelSegments}
                setBevelSegments={setBevelSegments}
                materialProps={materialProps}
                setMaterialProps={setMaterialProps}
                lightingPreset={lightingPreset}
                setLightingPreset={setLightingPreset}
                backgroundColor={backgroundColor}
                setBackgroundColor={setBackgroundColor}
                isGridVisible={isGridVisible}
                setIsGridVisible={setIsGridVisible}
                isGlitchEffectEnabled={isGlitchEffectEnabled}
                setIsGlitchEffectEnabled={setIsGlitchEffectEnabled}
                isBloomEffectEnabled={isBloomEffectEnabled}
                setIsBloomEffectEnabled={setIsBloomEffectEnabled}
                isPixelationEffectEnabled={isPixelationEffectEnabled}
                setIsPixelationEffectEnabled={setIsPixelationEffectEnabled}
                isChromaticAberrationEnabled={isChromaticAberrationEnabled}
                setIsChromaticAberrationEnabled={setIsChromaticAberrationEnabled}
                isScanLinesEnabled={isScanLinesEnabled}
                setIsScanLinesEnabled={setIsScanLinesEnabled}
            />
            <main style={{ flexGrow: 1, position: 'relative', backgroundColor: theme.Color.Base.Surface[1] }}>
                {isLoading && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${theme.Color.Base.Surface[1]}aa`, backdropFilter: 'blur(4px)', zIndex: 20 }}>
                        <Loader />
                    </div>
                )}
                
                {svgData ? (
                    <Scene
                        key={key}
                        ref={sceneRef}
                        svgData={svgData}
                        extrusionDepth={extrusion}
                        bevelSegments={bevelSegments}
                        materialProps={materialProps}
                        lightingPreset={lightingPreset}
                        backgroundColor={backgroundColor}
                        isGridVisible={isGridVisible}
                        isGlitchEffectEnabled={isGlitchEffectEnabled}
                        isBloomEffectEnabled={isBloomEffectEnabled}
                        isPixelationEffectEnabled={isPixelationEffectEnabled}
                        isChromaticAberrationEnabled={isChromaticAberrationEnabled}
                        isScanLinesEnabled={isScanLinesEnabled}
                    />
                ) : (
                    <WelcomeStage onFileLoad={handleFileLoad} isLoading={isLoading} error={error} />
                )}
            </main>
        </div>
    );
};

export default Shift;
