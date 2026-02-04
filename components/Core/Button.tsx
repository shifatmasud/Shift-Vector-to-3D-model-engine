/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { useTheme } from '../../Theme.tsx';
import { motion } from 'framer-motion';
import RippleLayer, { Ripple } from './RippleLayer.tsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'S' | 'M' | 'L';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  icon?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'M',
  label,
  icon,
  onClick,
  disabled = false,
}, ref) => {
  const { theme } = useTheme();
  
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const getCoords = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: rect.width,
      height: rect.height,
    };
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const { width, height, x, y } = getCoords(e);
    setDimensions({ width, height });
    setRipples(prev => [...prev, { id: Date.now() + Math.random(), x, y }]);
    if (onClick) onClick(e);
  };

  const handleRippleComplete = (id: number) => {
    setRipples(prev => prev.filter(r => r.id !== id));
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: theme.Color.Accent.Surface[1],
          color: theme.Color.Accent.Content[1],
          border: 'none',
        };
      case 'secondary':
        return {
          background: theme.Color.Base.Surface[3],
          color: theme.Color.Base.Content[1],
          border: 'none',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: theme.Color.Base.Content[1],
          border: 'none',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'S': return { height: '32px', padding: `0 ${theme.spacing['Space.M']}`, ...theme.Type.Readable.Label.S };
      case 'L': return { height: '48px', padding: `0 ${theme.spacing['Space.XL']}`, ...theme.Type.Readable.Label.L };
      case 'M': 
      default: return { height: '40px', padding: `0 ${theme.spacing['Space.L']}`, ...theme.Type.Readable.Label.M };
    }
  };

  const baseStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing['Space.S'],
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    overflow: 'hidden',
    fontWeight: 600,
    borderRadius: theme.radius['Radius.M'],
    outline: 'none',
    width: '100%',
    ...getVariantStyles(),
    ...getSizeStyles(),
  };

  return (
    <motion.button
      ref={ref}
      style={baseStyles}
      onClick={handleClick}
      // FIX: Cast motion props to `any` to bypass TypeScript errors. This seems to be caused by a type definition issue in the environment.
      {...{
        whileHover: !disabled ? { filter: 'brightness(1.1)' } : {},
        whileTap: !disabled ? { scale: 0.97, filter: 'brightness(0.9)' } : {},
        transition: { duration: 0.15 },
      } as any}
    >
      <RippleLayer
        color={variant === 'primary' ? theme.Color.Accent.Content[1] : theme.Color.Base.Content[1]}
        ripples={ripples}
        onRippleComplete={handleRippleComplete}
        width={dimensions.width} 
        height={dimensions.height}
      />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: theme.spacing['Space.S'], pointerEvents: 'none' }}>
        {icon && <i className={`ph-bold ${icon}`} style={{ fontSize: '1.25em' }} />}
        <span>{label}</span>
      </div>
    </motion.button>
  );
});

export default Button;