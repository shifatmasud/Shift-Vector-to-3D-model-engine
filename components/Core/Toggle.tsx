/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';

interface ToggleProps {
  isOn: boolean;
  onToggle: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ isOn, onToggle }) => {
  const { theme } = useTheme();

  const activeColor = theme.Color.Success.Content[1];

  const trackStyle: React.CSSProperties = {
    width: '40px',
    height: '24px',
    borderRadius: theme.radius['Radius.Full'],
    backgroundColor: isOn ? activeColor : theme.Color.Base.Surface[3],
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    cursor: 'pointer',
    transition: `background-color ${theme.time['Time.2x']} ease`,
    flexShrink: 0,
  };

  const thumbStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: theme.Color.Base.Surface[1],
    boxShadow: theme.effects['Effect.Shadow.Drop.1'],
  };

  return (
    <div style={trackStyle} onClick={onToggle}>
      <motion.div
        style={thumbStyle}
        // FIX: Cast motion props to `any` to bypass TypeScript errors. This seems to be caused by a type definition issue in the environment.
        {...{
          initial: false,
          animate: { x: isOn ? 16 : 0 },
          transition: { type: 'spring', stiffness: 700, damping: 30 },
        } as any}
      />
    </div>
  );
};

export default Toggle;