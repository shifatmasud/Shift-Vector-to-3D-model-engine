/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';

const Loader: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: theme.spacing['Space.L'] }}>
      <motion.div
        // FIX: Cast motion props to `any` to bypass TypeScript errors. This seems to be caused by a type definition issue in the environment.
        {...{
          animate: {
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          },
          transition: {
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: 0.5
          }
        } as any}
      >
        <i className="ph-bold ph-cube" style={{ fontSize: '64px', color: theme.Color.Accent.Surface[1] }} />
      </motion.div>
      <p style={{ ...theme.Type.Readable.Title.M, color: theme.Color.Base.Content[1] }}>
        Processing Model...
      </p>
    </div>
  );
};

export default Loader;