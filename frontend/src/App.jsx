import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ThemeProvider } from './components/theme-provider';

/**
 * @description 应用主布局组件
 * @returns {JSX.Element}
 */
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="app-container flex flex-col min-h-screen w-screen">
        <Navbar />
        <main className="p-4 flex-grow w-full max-w-screen-2xl mx-auto">
          <Outlet /> {/* 子路由将在这里渲染 */}
        </main>
        <footer className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          © 2024 我的应用版权所有
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;
