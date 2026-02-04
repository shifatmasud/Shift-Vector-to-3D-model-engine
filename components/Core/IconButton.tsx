/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, ...props }) => {
  const { theme } = useTheme();

  const styles: React.CSSProperties = {
    width: '44px',
    height: '44px',
    borderRadius: theme.radius['Radius.Full'],
    backgroundColor: theme.Color.Base.Surface['2'],
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.Color.Base.Content['2'],
    boxShadow: theme.effects['Effect.Shadow.Drop.1'],
    fontSize: '24px',
    outline: 'none',
  };

  return (
    <motion.button
      style={styles}
      aria-label={label}
      // FIX: Cast motion props to `any` to bypass TypeScript errors. This seems to be caused by a type definition issue in the environment.
      {...{
        whileHover: { scale: 1.1, color: theme.Color.Base.Content[1] },
        whileTap: { scale: 0.95 },
        transition: { type: 'spring', stiffness: 400, damping: 15 },
      } as any}
      {...props}
    >
      <i className={`ph-bold ${icon}`} />
    </motion.button>
  );
};

export default IconButton;