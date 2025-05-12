import React from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';

/**
 * @description 应用主布局组件
 * @returns {JSX.Element}
 */
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="app-container flex flex-col min-h-screen">
        <Outlet /> {/* 子路由将在这里渲染 */}
      </div>
    </ThemeProvider>
  );
}

export default App;
