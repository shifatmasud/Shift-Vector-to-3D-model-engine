/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { useTheme } from '../../Theme.tsx';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange }) => {
  const { theme } = useTheme();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing['Space.S'],
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing['Space.S'],
    height: '40px',
    backgroundColor: theme.Color.Base.Surface[2],
    borderRadius: theme.radius['Radius.M'],
    paddingLeft: theme.spacing['Space.S'],
    border: `1px solid ${theme.Color.Base.Surface[3]}`,
  };

  const textInputStyle: React.CSSProperties = {
    flexGrow: 1,
    height: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: theme.Color.Base.Content[1],
    ...theme.Type.Expressive.Data,
    fontSize: '14px',
  };

  const colorSwatchStyle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: theme.radius['Radius.S'],
    backgroundColor: value,
    border: `1px solid ${theme.Color.Base.Surface[3]}`,
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  };

  const colorInputStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    padding: 0, border: 'none',
    opacity: 0, cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <label style={{...theme.Type.Readable.Label.S, color: theme.Color.Base.Content[2]}}>{label}</label>
      <div style={inputContainerStyle}>
        <div style={colorSwatchStyle}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} style={colorInputStyle} />
        </div>
        <input type="text" value={value.toUpperCase()} onChange={(e) => onChange(e.target.value)} style={textInputStyle} />
      </div>
    </div>
  );
};

export default ColorInput;
