/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';

interface TabButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick, disabled = false }) => {
  const { theme } = useTheme();

  const styles: { [key: string]: React.CSSProperties } = {
    button: {
      position: 'relative',
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'transparent',
      border: 'none',
      borderRadius: theme.radius['Radius.M'],
      cursor: disabled ? 'not-allowed' : 'pointer',
      color: isActive ? theme.Color.Accent.Surface[1] : theme.Color.Base.Content[2],
      fontSize: '24px',
      outline: 'none',
      opacity: disabled ? 0.4 : 1,
      transition: `color 200ms ease, background-color 200ms ease`,
    },
    indicator: {
      position: 'absolute',
      left: '0',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '4px',
      height: '24px',
      backgroundColor: theme.Color.Accent.Surface[1],
      borderRadius: `0 ${theme.radius['Radius.S']} ${theme.radius['Radius.S']} 0`,
    }
  };

  return (
    <motion.button
      style={styles.button}
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      // FIX: Cast motion props to `any` to bypass TypeScript errors. This seems to be caused by a type definition issue in the environment.
      {...{
        whileHover: !disabled ? { color: theme.Color.Base.Content[1], backgroundColor: theme.Color.Base.Surface[3] } : {},
        whileTap: !disabled ? { scale: 0.95 } : {},
      } as any}
    >
      {isActive && (
        <motion.div
          // FIX: Cast motion props to `any` to bypass TypeScript errors. This seems to be caused by a type definition issue in the environment.
          {...{
            layoutId: "sidebar-indicator",
            style: styles.indicator,
            initial: false,
            transition: { type: 'spring', stiffness: 500, damping: 30 },
          } as any}
        />
      )}
      <i className={`ph-bold ${icon}`} />
    </motion.button>
  );
};

export default TabButton;