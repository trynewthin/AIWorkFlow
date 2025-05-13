import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * @component PageHeader
 * @description 页面头部组件，包含返回按钮、标题及操作按钮插槽
 * @param {object} props
 * @param {string} props.title - 页面标题
 * @param {function} [props.onBack] - 返回按钮点击回调
 * @param {React.ReactNode} [props.children] - 操作按钮插槽
 */
const PageHeader = ({ title, onBack, children }) => {
  return (
    <Card className="mb-6 p-0 gap-0 rounded-md shadow-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 py-3">
        <div className="flex items-center w-full sm:w-auto min-w-0">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <h2 className="text-base font-semibold ml-2 truncate">{title}</h2>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">{children}</div>
      </div>
    </Card>
  );
};

export default PageHeader; 