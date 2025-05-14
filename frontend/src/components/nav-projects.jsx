import { useState, useEffect } from "react";
import { Folder, Forward, MoreHorizontal, Trash2, Plus, Loader2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom";

export function NavProjects({
  projects: projectsGetter // 这里改为接收项目获取器函数
}) {
  const { isMobile } = useSidebar();
  const [projects, setProjects] = useState([]); // 项目列表状态
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误状态

  // 加载项目列表
  useEffect(() => {
    const loadProjects = async () => {
      console.log('[NavProjects] 开始加载项目列表');
      console.log('[NavProjects] projectsGetter类型:', typeof projectsGetter);
      
      setLoading(true);
      try {
        // 调用项目获取器函数
        let loadedProjects;
        if (typeof projectsGetter === 'function') {
          console.log('[NavProjects] 调用projectsGetter函数');
          loadedProjects = await projectsGetter();
          console.log('[NavProjects] projectsGetter返回:', loadedProjects);
        } else {
          console.log('[NavProjects] projectsGetter不是函数，直接使用:', projectsGetter);
          loadedProjects = projectsGetter || [];
        }
        
        const finalProjects = Array.isArray(loadedProjects) ? loadedProjects : [];
        console.log('[NavProjects] 最终项目列表:', finalProjects);
        
        setProjects(finalProjects);
        setError(null);
      } catch (err) {
        console.error('[NavProjects] 加载项目列表失败:', err);
        setError('加载项目失败');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [projectsGetter]);

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between pr-2">
        <SidebarGroupLabel>我的项目</SidebarGroupLabel>
        <Link to="/workflow" className="hover:text-primary p-1 rounded-md hover:bg-sidebar-highlight size-6 flex items-center justify-center">
          <Plus size={16} />
        </Link>
      </div>
      <SidebarMenu>
        {loading ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <Loader2 className="animate-spin" />
              <span>加载中...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : error ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled className="text-red-500">
              <span>{error}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : projects.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <span className="text-sm">暂无项目</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          projects.map((item) => (
            <SidebarMenuItem key={item.id || item.name}>
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span title={item.description || item.name}>{item.name}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">更多</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}>
                  <DropdownMenuItem asChild>
                    <Link to={item.url}>
                      <Folder className="text-muted-foreground mr-2" />
                      <span>查看工作流</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`${item.url}/execute`}>
                      <Forward className="text-muted-foreground mr-2" />
                      <span>执行工作流</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
