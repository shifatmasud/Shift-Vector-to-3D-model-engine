/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface RippleLayerProps {
  color: string;
  ripples: Ripple[];
  onRippleComplete: (id: number) => void;
  width: number;
  height: number;
  opacity?: number;
}

/**
 * 💧 RIPPLE LAYER (Tap / Click Burst)
 * Handles transient burst animations (ripples) for click/tap interactions.
 */
const RippleLayer: React.FC<RippleLayerProps> = ({ 
  color, 
  ripples, 
  onRippleComplete,
  width,
  height,
  opacity = 0.25
}) => {
  const maxDiameter = Math.hypot(width, height) * 2;

  const styles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 'inherit',
    pointerEvents: 'none',
    zIndex: 0,
  };

  return (
    <div style={styles}>
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            // FIX: Cast motion props to `any` to bypass TypeScript errors. This seems to be caused by a type definition issue in the environment.
            {...{
              initial: {
                width: 0,
                height: 0,
                opacity: opacity * 0.5,
              },
              animate: {
                width: maxDiameter,
                height: maxDiameter,
                opacity: 0,
              },
              exit: { opacity: 0 },
              style: {
                position: 'absolute',
                top: ripple.y,
                left: ripple.x,
                backgroundColor: color,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
              },
              transition: {
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              },
              onAnimationComplete: () => onRippleComplete(ripple.id),
            } as any}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RippleLayer;