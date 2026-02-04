/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useRef } from 'react';
import { useMotionValue, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';
import ThemeToggleButton from '../Core/ThemeToggleButton.tsx';
import FloatingWindow from '../Package/FloatingWindow.tsx';
import Dock from '../Section/Dock.tsx';
import ShiftStage, { ShiftStageRef } from '../Section/ShiftStage.tsx';
import { IOPanel, ConfigPanel, EffectsPanel } from '../Package/ShiftPanels.tsx';
import { WindowId, WindowState, ShiftState } from '../../types/index.tsx';
import DockIcon from '../Core/DockIcon.tsx';

const ShiftEngine = () => {
  const { theme, themeName } = useTheme();
  const stageRef = useRef<ShiftStageRef>(null);

  // --- STATE ---
  const [state, setState] = useState<ShiftState>({
    svgData: null,
    extrusion: 10,
    bevelSegments: 2,
    color: '#3366FF',
    roughness: 0.2,
    metalness: 0.8,
    transmission: 0,
    ior: 1.5,
    thickness: 1,
    lightingPreset: 'studio',
    backgroundColor: '#0A0A0A',
    isGridVisible: true,
    isGlitchEnabled: false,
    isBloomEnabled: false,
    isPixelationEnabled: false,
    isChromaticAberrationEnabled: false,
    isScanLinesEnabled: false,
  });

  // Motion Values for Sliders (to maintain reactive UI principles)
  const sliderValues = {
      extrusion: useMotionValue(state.extrusion),
      bevelSegments: useMotionValue(state.bevelSegments),
      roughness: useMotionValue(state.roughness),
      metalness: useMotionValue(state.metalness),
      transmission: useMotionValue(state.transmission),
      ior: useMotionValue(state.ior),
      thickness: useMotionValue(state.thickness),
  };

  const handlePropChange = (key: string, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  // --- WINDOWS ---
  const [windows, setWindows] = useState<Record<WindowId, WindowState>>({
    'shift-io': { id: 'shift-io', title: 'I/O', isOpen: true, zIndex: 3, x: -200, y: -250 },
    'shift-config': { id: 'shift-config', title: 'Configuration', isOpen: false, zIndex: 2, x: 220, y: -250 },
    'shift-effects': { id: 'shift-effects', title: 'Effects', isOpen: false, zIndex: 1, x: 220, y: 100 },
    // Keep unused ones for type safety
    control: { id: 'control', title: '', isOpen: false, zIndex: 0, x: 0, y: 0 },
    code: { id: 'code', title: '', isOpen: false, zIndex: 0, x: 0, y: 0 },
    console: { id: 'console', title: '', isOpen: false, zIndex: 0, x: 0, y: 0 },
  });

  const toggleWindow = (id: WindowId) => {
    setWindows(prev => {
      const isOpen = !prev[id].isOpen;
      const next = { ...prev, [id]: { ...prev[id], isOpen } };
      if (isOpen) {
        const maxZ = Math.max(...Object.values(prev).map(w => w.zIndex));
        next[id].zIndex = maxZ + 1;
      }
      return next;
    });
  };

  const bringToFront = (id: WindowId) => {
    setWindows(prev => {
      const maxZ = Math.max(...Object.values(prev).map(w => w.zIndex));
      if (prev[id].zIndex === maxZ) return prev;
      return { ...prev, [id]: { ...prev[id], zIndex: maxZ + 1 } };
    });
  };

  // --- DOCK ITEMS ---
  const DOCK_ITEMS = [
      { id: 'shift-io' as WindowId, icon: 'ph-folder-open', label: 'File' },
      { id: 'shift-config' as WindowId, icon: 'ph-sliders', label: 'Config' },
      { id: 'shift-effects' as WindowId, icon: 'ph-magic-wand', label: 'Effects' },
  ];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: state.backgroundColor,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <ThemeToggleButton />
      
      {/* 3D STAGE */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <ShiftStage ref={stageRef} state={state} />
      </div>

      {/* WINDOWS */}
      <AnimatePresence>
        {windows['shift-io'].isOpen && (
            <FloatingWindow
                key="io"
                {...windows['shift-io']}
                onClose={() => toggleWindow('shift-io')}
                onFocus={() => bringToFront('shift-io')}
            >
                <IOPanel 
                    state={state} 
                    onPropChange={handlePropChange}
                    onExport={() => stageRef.current?.exportGLB()}
                    onClear={() => handlePropChange('svgData', null)}
                    isLoading={false}
                    sliderValues={sliderValues}
                />
            </FloatingWindow>
        )}
        {windows['shift-config'].isOpen && (
            <FloatingWindow
                key="config"
                {...windows['shift-config']}
                onClose={() => toggleWindow('shift-config')}
                onFocus={() => bringToFront('shift-config')}
            >
                <ConfigPanel 
                    state={state} 
                    onPropChange={handlePropChange} 
                    sliderValues={sliderValues}
                />
            </FloatingWindow>
        )}
        {windows['shift-effects'].isOpen && (
            <FloatingWindow
                key="effects"
                {...windows['shift-effects']}
                onClose={() => toggleWindow('shift-effects')}
                onFocus={() => bringToFront('shift-effects')}
            >
                <EffectsPanel 
                    state={state} 
                    onPropChange={handlePropChange} 
                    sliderValues={sliderValues}
                />
            </FloatingWindow>
        )}
      </AnimatePresence>

      {/* CUSTOM DOCK */}
      {/* We reuse the Dock component structure but manual implementation to support custom items for this app context */}
      <div style={{
          position: 'absolute',
          bottom: theme.spacing['Space.L'],
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: theme.spacing['Space.S'],
          padding: theme.spacing['Space.S'],
          backgroundColor: `${theme.Color.Base.Surface[1]}aa`,
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          boxShadow: theme.effects['Effect.Shadow.Drop.3'],
          border: `1px solid ${theme.Color.Base.Surface[3]}`,
          zIndex: 1000,
      }}>
        {DOCK_ITEMS.map((item) => (
          <DockIcon
            key={item.id}
            icon={item.icon}
            isActive={windows[item.id].isOpen}
            onClick={() => toggleWindow(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ShiftEngine;