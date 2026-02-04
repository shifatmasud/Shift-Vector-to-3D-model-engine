/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { useTheme } from '../../Theme.tsx';
import Toggle from '../Core/Toggle.tsx'; // Assuming you have a Core/Toggle component

interface EffectToggleProps {
  icon: string;
  title: string;
  isEnabled: boolean;
  onToggle: () => void;
}

const EffectToggle: React.FC<EffectToggleProps> = ({ icon, title, isEnabled, onToggle }) => {
  const { theme } = useTheme();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing['Space.M'] }}>
      <i className={`ph-bold ${icon}`} style={{ fontSize: '20px', color: theme.Color.Base.Content[2], flexShrink: 0 }} />
      <span style={{ ...theme.Type.Readable.Body.M, flexGrow: 1, color: theme.Color.Base.Content[1] }}>{title}</span>
      <Toggle isOn={isEnabled} onToggle={onToggle} />
    </div>
  );
};

export default EffectToggle;
