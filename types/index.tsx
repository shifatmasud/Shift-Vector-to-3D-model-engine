/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ButtonVariant, ButtonSize } from '../components/Core/Button.tsx';

// --- Window Management ---
export type WindowId = 'control' | 'code' | 'console' | 'shift-io' | 'shift-config' | 'shift-effects';

export interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  zIndex: number;
  x: number;
  y: number;
}

// --- Console Logging ---
export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}

// --- Meta Prototype Props ---
export interface MetaButtonProps {
    label: string;
    variant: ButtonVariant;
    size: ButtonSize;
    icon: string;
    customFill: string;
    customColor: string;
    customRadius: string;
    // States
    disabled: boolean;
    forcedHover: boolean;
    forcedFocus: boolean;
    forcedActive: boolean;
}

// --- Shift Engine State ---
export interface ShiftState {
  // Model
  svgData: string | null;
  extrusion: number;
  bevelSegments: number;
  
  // Material
  color: string;
  roughness: number;
  metalness: number;
  transmission: number;
  ior: number;
  thickness: number;
  
  // Scene
  lightingPreset: 'studio' | 'dramatic' | 'soft';
  backgroundColor: string;
  isGridVisible: boolean;
  rotateX: number;
  rotateY: number;
  
  // Effects
  isGlitchEnabled: boolean;
  isBloomEnabled: boolean;
  isPixelationEnabled: boolean;
  isChromaticAberrationEnabled: boolean;
  isScanLinesEnabled: boolean;
}