import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * @description 主题上下文状态类型定义
 * @typedef {{ theme: 'light'|'dark'|'system', setTheme: (theme: 'light'|'dark'|'system') => void }} ThemeContextType
 */

/** @type {ThemeContextType} */
const initialState = {
  theme: 'system',
  setTheme: () => {},
};

/**
 * @description 主题上下文，用于在应用中提供深浅色模式数据
 */
const ThemeContext = createContext(initialState);

/**
 * @description 主题提供器组件，管理深浅色模式切换并注入全局样式类
 * @param {{ children: React.ReactNode, defaultTheme?: 'light'|'dark'|'system', storageKey?: string }} props
 * @returns {JSX.Element}
 */
export function ThemeProvider({ children, defaultTheme = 'system', storageKey = 'vite-ui-theme' }) {
  const [theme, setTheme] = useState(() => /** @type {'light'|'dark'|'system'} */ (localStorage.getItem(storageKey) || defaultTheme));

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * @description 自定义 Hook，获取主题上下文信息与切换方法
 * @returns {ThemeContextType}
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme 必须在 ThemeProvider 内使用');
  }
  return context;
} 