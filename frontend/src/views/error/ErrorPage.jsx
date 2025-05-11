import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * @description 错误边界页面组件，用于展示404等路由错误
 * @returns {JSX.Element}
 */
function ErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-black">
      <h1 className="text-9xl font-bold text-gray-800 dark:text-gray-100">404</h1>
      <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">页面未找到</p>
      <Button className="mt-6" onClick={() => navigate('/')}>返回首页</Button>
    </div>
  );
}

export default ErrorPage; 