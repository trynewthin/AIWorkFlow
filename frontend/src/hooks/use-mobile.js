import { useState, useEffect } from 'react';

/**
 * @description 用于检测当前设备是否是移动设备的钩子函数
 * @returns {boolean} 是否为移动设备
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 初始检查
    checkIfMobile();

    // 监听窗口大小变化
    window.addEventListener('resize', checkIfMobile);

    // 清理监听器
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
} 