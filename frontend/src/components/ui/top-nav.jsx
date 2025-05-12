import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import pageTitles from '@/lib/pageTitles';
import pageMenus from '@/lib/pageMenus';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

/**
 * @description 顶部导航栏组件，包含侧边栏触发按钮和面包屑导航
 * @returns {JSX.Element}
 */
function TopNav({ menuItems }) {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  const pageKey =
    segments.length === 2 && segments[0] === 'knowledge'
      ? 'knowledgeDetail'
      : segments[segments.length - 1] || '';
  const items = menuItems || pageMenus[pageKey] || [];

  return (
    <div className="sticky top-0 h-14 flex items-center border-b bg-white/30 backdrop-blur px-4 flex-shrink-0 z-10">
      <SidebarTrigger />
      <div className="ml-4 flex-1 flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/" className="hover:underline">首页</Link>
        {segments.map((seg, idx) => {
          const pathTo = `/${segments.slice(0, idx + 1).join('/')}`;
          let key = seg;
          // 针对知识库详情页映射到固定 key
          if (segments.length === 2 && segments[0] === 'knowledge' && idx === 1) {
            key = 'knowledgeDetail';
          }
          const name = pageTitles[key] || seg;
          return (
            <React.Fragment key={pathTo}>
              <span>›</span>
              <Link to={pathTo} className="hover:underline">{name}</Link>
            </React.Fragment>
          );
        })}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-auto p-2 rounded hover:bg-gray-100/80">
              <MoreHorizontal className="size-5 text-gray-600" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4} className="w-40">
            {items.map(item => (
              <DropdownMenuItem key={item.key} onSelect={() => item.onClick()}>
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default TopNav; 