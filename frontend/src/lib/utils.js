import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * @description 合并 Tailwind CSS 类名的工具函数
 * @param {...string} inputs 输入的类名
 * @returns {string} 合并后的类名
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
