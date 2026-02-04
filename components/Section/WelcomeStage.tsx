/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';
import { FileUpload } from '../Package/FileUpload.tsx';

interface WelcomeStageProps {
  onFileLoad: (svgContent: string) => void;
  isLoading: boolean;
  error: string | null;
}

const WelcomeStage: React.FC<WelcomeStageProps> = ({ onFileLoad, isLoading, error }) => {
  const { theme } = useTheme();

  return (
    <motion.div
      // FIX: Cast motion props to `any` to bypass TypeScript errors. This seems to be caused by a type definition issue in the environment.
      {...{
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
      } as any}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: '480px', width: '100%', padding: theme.spacing['Space.L'] }}>
        <FileUpload onFileLoad={onFileLoad} disabled={isLoading} />
        {error && (
          <p style={{
            ...theme.Type.Readable.Body.S,
            color: theme.Color.Error.Content[1],
            marginTop: theme.spacing['Space.M'],
            textAlign: 'center'
          }}>
            {error}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default WelcomeStage;