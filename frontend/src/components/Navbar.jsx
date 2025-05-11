import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from './theme-provider';
import { Button } from './ui/button';
import { Sun, Moon } from 'lucide-react';

/**
 * @description 导航栏组件
 * @returns {JSX.Element}
 */
function Navbar() {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  return (
    <header className="sticky top-0 left-0 w-full bg-white/70 dark:bg-transparent backdrop-blur-sm py-3 px-4 z-50 text-black dark:text-white">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-6">
          <nav>
            <ul className="flex items-center space-x-4 text-base">
              <li>
                <Link to="/" className="!text-black dark:!text-white visited:!text-black dark:visited:!text-white">主页</Link>
              </li>
              <li>
                <Link to="/about" className="!text-black dark:!text-white visited:!text-black dark:visited:!text-white">关于</Link>
              </li>
              {/* 在这里可以添加更多导航链接 */}
            </ul>
          </nav>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="!bg-transparent hover:!bg-transparent dark:hover:!bg-transparent !outline-none !focus:outline-none !focus:ring-0 !focus-visible:outline-none !focus-visible:ring-0 !focus-visible:ring-offset-0" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">切换主题</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar; 