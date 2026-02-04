/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { useTheme } from '../../Theme.tsx';

interface ControlGroupProps {
  title: string;
  children: React.ReactNode;
}

const ControlGroup: React.FC<ControlGroupProps> = ({ title, children }) => {
  const { theme } = useTheme();

  return (
    <div style={{ padding: `0 ${theme.spacing['Space.L']}` }}>
      <h3 style={{
        ...theme.Type.Readable.Label.M,
        color: theme.Color.Base.Content[2],
        marginBottom: theme.spacing['Space.M'],
        paddingBottom: theme.spacing['Space.S'],
        borderBottom: `1px solid ${theme.Color.Base.Surface[3]}`,
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing['Space.L'] }}>
        {children}
      </div>
    </div>
  );
};

export default ControlGroup;
