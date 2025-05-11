import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * @description 按钮样式变体配置
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md !border-none text-sm font-medium transition-colors !outline-none !focus:outline-none !focus:ring-0 focus-visible:outline-none !focus-visible:ring-0 !focus-visible:ring-offset-0 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: '!bg-black !text-white !shadow-md hover:!bg-gray-800 dark:!bg-white dark:!text-black dark:shadow-gray-400',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-gray-300 hover:bg-gray-100',
        ghost: 'bg-transparent hover:bg-gray-100',
        link: 'underline text-blue-500 hover:text-blue-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

/**
 * @description 按钮组件
 * @param {object} props 组件属性
 * @param {"default"|"destructive"|"outline"|"ghost"|"link"} [props.variant] 按钮变体
 * @param {"default"|"sm"|"lg"} [props.size] 按钮尺寸
 * @returns {JSX.Element}
 */
const Button = React.forwardRef(({ variant, size, className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(buttonVariants({ variant, size, className }))}
    {...props}
  />
));

Button.displayName = 'Button';

export { Button };