/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../Theme.tsx';
import IconButton from './IconButton.tsx';

const ThemeToggleButton = () => {
  const { themeName, setThemeName } = useTheme();

  const toggleTheme = () => {
    setThemeName(themeName === 'light' ? 'dark' : 'light');
  };

  const icon = themeName === 'dark' ? 'ph-moon' : 'ph-sun';

  return (
    <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000 }}>
        <IconButton
            icon={icon}
            label={`Switch to ${themeName === 'light' ? 'dark' : 'light'} mode`}
            onClick={toggleTheme}
        />
    </div>
  );
};

export default ThemeToggleButton;
