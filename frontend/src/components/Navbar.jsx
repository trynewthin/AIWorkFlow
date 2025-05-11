import React from 'react';
import { Link } from 'react-router-dom';

/**
 * @description 导航栏组件
 * @returns {JSX.Element}
 */
function Navbar() {
  return (
    <header className="sticky top-0 left-0 w-screen p-4 bg-gray-100 dark:bg-gray-800 shadow z-50">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">
          <Link to="/" className="hover:text-blue-500">我的应用</Link>
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
              >
                主页
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
              >
                关于
              </Link>
            </li>
            {/* 在这里可以添加更多导航链接 */}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar; 