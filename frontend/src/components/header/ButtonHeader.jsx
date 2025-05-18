import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * @component ButtonHeader
 * @description 编辑器页面顶部导航组件，包含返回按钮和右侧按钮槽
 * @param {string} title - 页面标题
 * @param {function} onBackClick - 返回按钮点击事件处理函数
 * @param {React.ReactNode} children - 右侧按钮内容
 */
const ButtonHeader = ({ title, onBackClick, children }) => {
  return (
    <div className="flex-shrink-0 mb-4 flex justify-between items-center w-full h-16">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          className="bg-black text-white hover:bg-gray-800 hover:text-white border-black hover:shadow-md transition-all w-10 h-10 p-0"
          onClick={onBackClick}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <span className="text-lg font-medium">{title}</span>
      </div>
      
      <div className="flex gap-2">
        {children}
      </div>
    </div>
  );
};

export default ButtonHeader; 