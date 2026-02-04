/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { useTheme } from '../../Theme.tsx';
import { ShiftState } from '../../types/index.tsx';
import FileUpload from '../Core/FileUpload.tsx';
import Button from '../Core/Button.tsx';
import RangeSlider from '../Core/RangeSlider.tsx';
import ColorPicker from '../Core/ColorPicker.tsx';
import Toggle from '../Core/Toggle.tsx';
import Select from '../Core/Select.tsx';
import { MotionValue } from 'framer-motion';

// --- PROPS ---
interface PanelProps {
  state: ShiftState;
  onPropChange: (key: string, value: any) => void;
  sliderValues: Record<string, MotionValue<number>>;
}

interface IOPanelProps extends PanelProps {
  onExport: () => void;
  onClear: () => void;
  isLoading: boolean;
}

interface ConfigPanelProps extends PanelProps {
    onPresetChange: (preset: 'matte' | 'plastic' | 'metal' | 'glass') => void;
}


// --- IO PANEL ---
export const IOPanel: React.FC<IOPanelProps> = ({ state, onPropChange, onExport, onClear, isLoading }) => {
    const { theme } = useTheme();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing['Space.L'] }}>
            <FileUpload 
                onFileLoad={(data) => onPropChange('svgData', data)}
                disabled={isLoading}
            />
            {state.svgData && (
                 <div style={{ display: 'flex', gap: theme.spacing['Space.S'] }}>
                     <div style={{ flex: 1 }}>
                        <Button label="Export GLB" variant="primary" onClick={onExport} icon="ph-download-simple" />
                     </div>
                     <div style={{ flex: 1 }}>
                        <Button label="Clear" variant="secondary" onClick={onClear} icon="ph-trash" />
                     </div>
                 </div>
            )}
            <div style={{ borderTop: `1px solid ${theme.Color.Base.Surface[3]}` }} />
             <Select
                label="Environment"
                value={state.lightingPreset}
                onChange={(e) => onPropChange('lightingPreset', e.target.value)}
                options={[
                    { value: 'studio', label: 'Studio Lighting' },
                    { value: 'dramatic', label: 'Dramatic Spotlight' },
                    { value: 'soft', label: 'Soft Ambient' },
                ]}
            />
             <Toggle label="Show Floor Grid" isOn={state.isGridVisible} onToggle={() => onPropChange('isGridVisible', !state.isGridVisible)} />
             <ColorPicker label="Background" value={state.backgroundColor} onChange={(e) => onPropChange('backgroundColor', e.target.value)} />
        </div>
    );
};

// --- CONFIG PANEL ---
export const ConfigPanel: React.FC<ConfigPanelProps> = ({ state, onPropChange, sliderValues, onPresetChange }) => {
    const { theme } = useTheme();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing['Space.L'] }}>
            <label style={theme.Type.Readable.Label.S}>GEOMETRY</label>
            <RangeSlider label="Extrusion Depth" motionValue={sliderValues.extrusion} onCommit={() => {}} onChange={(v) => onPropChange('extrusion', v)} min={1} max={50} />
            <RangeSlider label="Bevel Segments" motionValue={sliderValues.bevelSegments} onCommit={() => {}} onChange={(v) => onPropChange('bevelSegments', v)} min={0} max={10} step={1} />
            <RangeSlider label="Subdivisions" motionValue={sliderValues.subdivisions} onCommit={() => {}} onChange={(v) => onPropChange('subdivisions', v)} min={0} max={3} step={1} />
            
            <div style={{ borderTop: `1px solid ${theme.Color.Base.Surface[3]}` }} />
            <label style={theme.Type.Readable.Label.S}>TRANSFORM</label>
            <RangeSlider label="Rotate X" motionValue={sliderValues.rotateX} onCommit={() => {}} onChange={(v) => onPropChange('rotateX', v)} min={-180} max={180} step={1} />
            <RangeSlider label="Rotate Y" motionValue={sliderValues.rotateY} onCommit={() => {}} onChange={(v) => onPropChange('rotateY', v)} min={-180} max={180} step={1} />
            <RangeSlider label="Scale" motionValue={sliderValues.scale} onCommit={() => {}} onChange={(v) => onPropChange('scale', v)} min={0.1} max={5} step={0.01} />
            
            <div style={{ borderTop: `1px solid ${theme.Color.Base.Surface[3]}` }} />
            <label style={theme.Type.Readable.Label.S}>MATERIAL PRESETS</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing['Space.S'] }}>
                <Button label="Matte" variant="secondary" onClick={() => onPresetChange('matte')} size="S" />
                <Button label="Glossy" variant="secondary" onClick={() => onPresetChange('plastic')} size="S" />
                <Button label="Metal" variant="secondary" onClick={() => onPresetChange('metal')} size="S" />
                <Button label="Glass" variant="secondary" onClick={() => onPresetChange('glass')} size="S" />
            </div>

            <div style={{ borderTop: `1px solid ${theme.Color.Base.Surface[3]}` }} />
            <label style={theme.Type.Readable.Label.S}>MATERIAL PROPERTIES</label>
            <ColorPicker label="Base Color" value={state.color} onChange={(e) => onPropChange('color', e.target.value)} />
            <RangeSlider label="Roughness" motionValue={sliderValues.roughness} onCommit={() => {}} onChange={(v) => onPropChange('roughness', v)} min={0} max={1} step={0.01} />
            <RangeSlider label="Metalness" motionValue={sliderValues.metalness} onCommit={() => {}} onChange={(v) => onPropChange('metalness', v)} min={0} max={1} step={0.01} />
            
            <div style={{ borderTop: `1px solid ${theme.Color.Base.Surface[3]}` }} />
            <label style={theme.Type.Readable.Label.S}>GLASS PROPERTIES</label>
            <RangeSlider label="Transmission" motionValue={sliderValues.transmission} onCommit={() => {}} onChange={(v) => onPropChange('transmission', v)} min={0} max={1} step={0.01} />
            <RangeSlider label="IOR (Refraction)" motionValue={sliderValues.ior} onCommit={() => {}} onChange={(v) => onPropChange('ior', v)} min={1} max={2.33} step={0.01} />
            <RangeSlider label="Thickness" motionValue={sliderValues.thickness} onCommit={() => {}} onChange={(v) => onPropChange('thickness', v)} min={0} max={5} step={0.1} />
        </div>
    );
};

// --- EFFECTS PANEL ---
export const EffectsPanel: React.FC<PanelProps> = ({ state, onPropChange }) => {
    const { theme } = useTheme();
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing['Space.M'] }}>
             <Toggle label="Bloom (Glow)" isOn={state.isBloomEnabled} onToggle={() => onPropChange('isBloomEnabled', !state.isBloomEnabled)} />
             <Toggle label="Glitch Distortion" isOn={state.isGlitchEnabled} onToggle={() => onPropChange('isGlitchEnabled', !state.isGlitchEnabled)} />
             <Toggle label="Chromatic Aberration" isOn={state.isChromaticAberrationEnabled} onToggle={() => onPropChange('isChromaticAberrationEnabled', !state.isChromaticAberrationEnabled)} />
             <Toggle label="Retro Pixelation" isOn={state.isPixelationEnabled} onToggle={() => onPropChange('isPixelationEnabled', !state.isPixelationEnabled)} />
             <Toggle label="CRT Scanlines" isOn={state.isScanLinesEnabled} onToggle={() => onPropChange('isScanLinesEnabled', !state.isScanLinesEnabled)} />
        </div>
    );
};