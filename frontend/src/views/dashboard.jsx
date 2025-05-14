import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import TopNav from "@/components/ui/top-nav";
import pageTitles from '@/lib/pageTitles';
import homeConfig from '@/lib/homeConfig';

/**
 * @description 主页组件
 * @returns {JSX.Element}
 */
function Home() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  
  // 如果是 /knowledge/:kbId，则映射到 knowledgeDetail
  const pageKey = 
    segments.length === 2 && segments[0] === 'knowledge'
      ? 'knowledgeDetail'
      : segments.length === 2 && segments[0] === 'workflow'
        ? 'workflowDetail' // 工作流详情页
        : segments.length === 3 && segments[0] === 'workflow' && segments[2] === 'execute'
          ? 'workflowExecute' // 工作流执行页
          : segments[segments.length - 1] || '';
  
  // 根据路径来显示自定义标题
  const title = pageTitles[pageKey] || 'AI 工作流平台';

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <TeamSwitcher teams={homeConfig.teams} />
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={homeConfig.navMain} />
            <NavProjects projects={homeConfig.getProjects} />
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={homeConfig.user} />
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-auto">
          <TopNav />
          <main className="flex-1 p-6">
            {/* 渲染子路由页面 */}
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Home; 