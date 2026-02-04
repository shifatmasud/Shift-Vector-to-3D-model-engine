/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LightingPreset = 'studio' | 'dramatic' | 'soft';
export type MaterialPreset = 'matte' | 'plastic' | 'metal' | 'glass';
export type Tab = 'geometry' | 'material' | 'effects';

export interface MaterialProps {
    color: string;
    roughness: number;
    metalness: number;
    transmission: number;
    ior: number;
    thickness: number;
}
