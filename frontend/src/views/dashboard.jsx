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
  SidebarTrigger,
} from "@/components/ui/sidebar";
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
      : segments[segments.length - 1] || '';
  
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
            <NavProjects projects={homeConfig.getProjects()} />
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={homeConfig.user} />
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="sticky top-0 h-14 flex items-center border-b bg-white/30 backdrop-blur px-4 flex-shrink-0 z-10">
            <SidebarTrigger />
            <div className="ml-4 flex items-center space-x-2 text-sm text-gray-600">
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
            </div>
          </div>
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