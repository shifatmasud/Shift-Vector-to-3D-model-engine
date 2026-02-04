/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, useTheme } from './Theme.tsx';
import { BreakpointProvider } from './hooks/useBreakpoint.tsx';
import Shift from './components/App/Shift.tsx';

function App() {
  const { theme } = useTheme();

  React.useEffect(() => {
    document.body.style.backgroundColor = theme.Color.Base.Surface[1];
    document.body.style.color = theme.Color.Base.Content[1];
    
    // Inject global styles for custom scrollbars used in the new app
    const styleId = 'global-app-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background-color: ${theme.Color.Base.Surface[3]}; border-radius: 9999px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: ${theme.Color.Base.Content[3]}; }
        `;
        document.head.appendChild(style);
    }

  }, [theme]);

  return (
      <Shift />
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BreakpointProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BreakpointProvider>
  </React.StrictMode>
);
