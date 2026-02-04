/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { useTheme } from '../../Theme.tsx';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  decimals?: number;
}

const Slider: React.FC<SliderProps> = ({ label, min, max, step, value, onChange, unit = '', decimals = 2 }) => {
  const { theme } = useTheme();
  const progress = ((value - min) / (max - min)) * 100;
  
  const styles: { [key: string]: React.CSSProperties } = {
    container: { display: 'flex', flexDirection: 'column', gap: theme.spacing['Space.M'] },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
    label: { ...theme.Type.Readable.Label.S, color: theme.Color.Base.Content[2] },
    value: { ...theme.Type.Expressive.Data, color: theme.Color.Base.Content[1], fontSize: '13px' },
    track: {
        position: 'relative',
        width: '100%',
        height: '8px',
        backgroundColor: theme.Color.Base.Surface[3],
        borderRadius: theme.radius['Radius.Full'],
    },
    fill: {
        position: 'absolute',
        height: '100%',
        backgroundColor: theme.Color.Accent.Surface[1],
        borderRadius: theme.radius['Radius.Full'],
        width: `${progress}%`,
    },
    input: {
        WebkitAppearance: 'none',
        appearance: 'none',
        background: 'transparent',
        cursor: 'pointer',
        width: '100%',
        position: 'absolute',
        margin: 0,
        height: '8px',
    },
  };
  
  // Dynamic styles for range input thumb (requires CSS variables)
  const sliderInputCSS = `
    input[type=range].custom-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      margin-top: -6px;
      background-color: ${theme.Color.Base.Surface[1]};
      height: 20px;
      width: 20px;
      border-radius: ${theme.radius['Radius.Full']};
      border: 1px solid ${theme.Color.Base.Surface[3]};
      box-shadow: ${theme.effects['Effect.Shadow.Drop.1']};
      transition: transform 150ms ease;
    }
     input[type=range].custom-slider:hover::-webkit-slider-thumb {
      transform: scale(1.1);
    }
    input[type=range].custom-slider:active::-webkit-slider-thumb {
      transform: scale(0.95);
      background-color: ${theme.Color.Base.Surface[2]};
    }
  `;

  return (
    <div style={styles.container}>
       <style>{sliderInputCSS}</style>
      <div style={styles.header}>
        <label style={styles.label}>{label}</label>
        <span style={styles.value}>
          {value.toFixed(decimals)}{unit}
        </span>
      </div>
      <div style={styles.track}>
        <div style={styles.fill}></div>
        <input
          className="custom-slider"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={styles.input}
        />
      </div>
    </div>
  );
};

export default Slider;
