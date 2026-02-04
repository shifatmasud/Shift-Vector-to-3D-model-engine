/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';
import Button from '../Core/Button.tsx';
import TabButton from '../Core/TabButton.tsx';
import ControlGroup from '../Package/ControlGroup.tsx';
import EffectToggle from '../Package/EffectToggle.tsx';
import Slider from '../Core/Slider.tsx';
import ColorInput from '../Core/ColorInput.tsx';
import IconButton from '../Core/IconButton.tsx';
import { FileUpload } from '../Package/FileUpload.tsx';
import type { LightingPreset, MaterialPreset, MaterialProps, Tab } from '../../types/three.tsx';

// Prop drilling is acceptable here as this is the main control orchestrator
interface SidebarProps {
    onFileLoad: (svgContent: string) => void;
    onClear: () => void;
    onExport: () => void;
    isLoading: boolean;
    hasModel: boolean;
    error: string | null;
    extrusion: number;
    setExtrusion: (value: number) => void;
    bevelSegments: number;
    setBevelSegments: (value: number) => void;
    materialProps: MaterialProps;
    setMaterialProps: (value: MaterialProps) => void;
    lightingPreset: LightingPreset;
    setLightingPreset: (value: LightingPreset) => void;
    backgroundColor: string;
    setBackgroundColor: (value: string) => void;
    isGridVisible: boolean;
    setIsGridVisible: (value: boolean) => void;
    isGlitchEffectEnabled: boolean;
    setIsGlitchEffectEnabled: (value: boolean) => void;
    isBloomEffectEnabled: boolean;
    setIsBloomEffectEnabled: (value: boolean) => void;
    isPixelationEffectEnabled: boolean;
    setIsPixelationEffectEnabled: (value: boolean) => void;
    isChromaticAberrationEnabled: boolean;
    setIsChromaticAberrationEnabled: (value: boolean) => void;
    isScanLinesEnabled: boolean;
    setIsScanLinesEnabled: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('geometry');

    React.useEffect(() => {
        if (!props.hasModel) {
            setActiveTab('geometry'); // Reset to a default tab
        }
    }, [props.hasModel]);

    const handleMaterialPreset = (preset: MaterialPreset) => {
        switch (preset) {
            case 'matte': props.setMaterialProps({ ...props.materialProps, color: '#cccccc', roughness: 1.0, metalness: 0.0, transmission: 0.0 }); break;
            case 'plastic': props.setMaterialProps({ ...props.materialProps, color: '#ffffff', roughness: 0.1, metalness: 0.1, transmission: 0.0 }); break;
            case 'metal': props.setMaterialProps({ ...props.materialProps, color: '#FFD700', roughness: 0.2, metalness: 1.0, transmission: 0.0 }); break;
            case 'glass': props.setMaterialProps({ ...props.materialProps, color: '#ffffff', roughness: 0.05, metalness: 0.0, transmission: 1.0, ior: 1.5, thickness: 1.5 }); break;
        }
    };

    const renderPanelContent = () => {
        if (!props.hasModel) {
             return (
                <div style={{ padding: `0 ${theme.spacing['Space.L']}` }}>
                    <FileUpload onFileLoad={props.onFileLoad} disabled={props.isLoading} />
                    {props.error && <p style={{ ...theme.Type.Readable.Body.S, color: theme.Color.Error.Content[1], marginTop: theme.spacing['Space.M'], textAlign: 'center' }}>{props.error}</p>}
                </div>
            )
        }
        
        const content = {
            'geometry': (
                <>
                    <ControlGroup title="Model">
                        <Slider label="Extrusion Depth" min={1} max={100} step={1} value={props.extrusion} onChange={props.setExtrusion} />
                        <Slider label="Bevel Smoothness" min={0} max={10} step={1} value={props.bevelSegments} onChange={props.setBevelSegments} />
                    </ControlGroup>
                    <ControlGroup title="Scene">
                        <ColorInput label="Background Color" value={props.backgroundColor} onChange={props.setBackgroundColor} />
                        <EffectToggle icon="ph-grid-four" title="Show Grid" isEnabled={props.isGridVisible} onToggle={() => props.setIsGridVisible(!props.isGridVisible)} />
                    </ControlGroup>
                    <ControlGroup title="Lighting">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: theme.spacing['Space.S'] }}>
                            <Button label="Studio" variant={props.lightingPreset === 'studio' ? 'primary' : 'secondary'} size="S" onClick={() => props.setLightingPreset('studio')} />
                            <Button label="Drama" variant={props.lightingPreset === 'dramatic' ? 'primary' : 'secondary'} size="S" onClick={() => props.setLightingPreset('dramatic')} />
                            <Button label="Soft" variant={props.lightingPreset === 'soft' ? 'primary' : 'secondary'} size="S" onClick={() => props.setLightingPreset('soft')} />
                        </div>
                    </ControlGroup>
                </>
            ),
            'material': (
                <>
                    <ControlGroup title="Presets">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: theme.spacing['Space.S'] }}>
                            <Button label="Matte" variant="secondary" size="S" onClick={() => handleMaterialPreset('matte')} />
                            <Button label="Gloss" variant="secondary" size="S" onClick={() => handleMaterialPreset('plastic')} />
                            <Button label="Metal" variant="secondary" size="S" onClick={() => handleMaterialPreset('metal')} />
                            <Button label="Glass" variant="secondary" size="S" onClick={() => handleMaterialPreset('glass')} />
                        </div>
                    </ControlGroup>
                    <ControlGroup title="Properties">
                        <ColorInput label="Base Color" value={props.materialProps.color} onChange={val => props.setMaterialProps({ ...props.materialProps, color: val })} />
                        <Slider label="Roughness" min={0} max={1} step={0.01} value={props.materialProps.roughness} onChange={val => props.setMaterialProps({ ...props.materialProps, roughness: val })} />
                        <Slider label="Metalness" min={0} max={1} step={0.01} value={props.materialProps.metalness} onChange={val => props.setMaterialProps({ ...props.materialProps, metalness: val })} />
                    </ControlGroup>
                     <ControlGroup title="Transparency">
                        <Slider label="Transmission" min={0} max={1} step={0.01} value={props.materialProps.transmission} onChange={val => props.setMaterialProps({ ...props.materialProps, transmission: val })} />
                        <Slider label="Refraction (IOR)" min={1} max={2.3} step={0.01} value={props.materialProps.ior} onChange={val => props.setMaterialProps({ ...props.materialProps, ior: val })} />
                        <Slider label="Thickness" min={0} max={5} step={0.01} value={props.materialProps.thickness} onChange={val => props.setMaterialProps({ ...props.materialProps, thickness: val })} />
                    </ControlGroup>
                </>
            ),
            'effects': (
                <ControlGroup title="Post-Processing">
                    <EffectToggle icon="ph-sparkle" title="Glitch" isEnabled={props.isGlitchEffectEnabled} onToggle={() => props.setIsGlitchEffectEnabled(!props.isGlitchEffectEnabled)} />
                    <EffectToggle icon="ph-sun" title="Bloom" isEnabled={props.isBloomEffectEnabled} onToggle={() => props.setIsBloomEffectEnabled(!props.isBloomEffectEnabled)} />
                    <EffectToggle icon="ph-circles-four" title="Chromatic Aberration" isEnabled={props.isChromaticAberrationEnabled} onToggle={() => props.setIsChromaticAberrationEnabled(!props.isChromaticAberrationEnabled)} />
                    <EffectToggle icon="ph-squares-four" title="Pixelation" isEnabled={props.isPixelationEffectEnabled} onToggle={() => props.setIsPixelationEffectEnabled(!props.isPixelationEffectEnabled)} />
                    <EffectToggle icon="ph-rows" title="Scan Lines" isEnabled={props.isScanLinesEnabled} onToggle={() => props.setIsScanLinesEnabled(!props.isScanLinesEnabled)} />
                </ControlGroup>
            )
        };
        return content[activeTab];
    };

    return (
        <aside style={{
            width: '380px',
            flexShrink: 0,
            height: '100vh',
            display: 'flex',
            backgroundColor: `${theme.Color.Base.Surface[2]}cc`,
            borderRight: `1px solid ${theme.Color.Base.Surface[3]}`,
            backdropFilter: 'blur(20px)',
            zIndex: 10,
        }}>
            <div style={{ width: '64px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${theme.spacing['Space.M']} 0`, borderRight: `1px solid ${theme.Color.Base.Surface[3]}`, background: 'rgba(0,0,0,0.1)' }}>
                <i className="ph-bold ph-cube" style={{ fontSize: '32px', color: theme.Color.Accent.Surface[1], marginBottom: theme.spacing['Space.L'] }} />
                <nav style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing['Space.S'] }}>
                    <TabButton icon="ph-gear-six" label="Geometry & Scene" isActive={activeTab === 'geometry'} onClick={() => setActiveTab('geometry')} />
                    <TabButton icon="ph-paint-brush" label="Material" isActive={activeTab === 'material'} onClick={() => setActiveTab('material')} disabled={!props.hasModel} />
                    {/* FIX: Corrected typo from `active.tab` to `activeTab` */}
                    <TabButton icon="ph-magic-wand" label="Effects" isActive={activeTab === 'effects'} onClick={() => setActiveTab('effects')} disabled={!props.hasModel} />
                </nav>
            </div>
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: theme.spacing['Space.L'] }}>
                    <h1 style={{...theme.Type.Expressive.Headline.M, margin: 0}}>Shift Engine</h1>
                </div>
                <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: theme.spacing['Space.XL'], paddingBottom: theme.spacing['Space.L'] }}>
                    {renderPanelContent()}
                </div>
                {props.hasModel && (
                    <div style={{ padding: theme.spacing['Space.L'], borderTop: `1px solid ${theme.Color.Base.Surface[3]}`, background: `${theme.Color.Base.Surface[1]}4d`, display: 'flex', flexDirection: 'column', gap: theme.spacing['Space.S'] }}>
                        <Button label="Export to GLB" onClick={props.onExport} disabled={props.isLoading} variant="primary" />
                        <Button label="Clear Model" onClick={props.onClear} disabled={props.isLoading} variant="secondary" />
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;