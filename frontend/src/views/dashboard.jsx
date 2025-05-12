import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const segments = location.pathname.split('/');
  const current = segments[segments.length - 1] || '';
  const title = pageTitles[current] || 'AI 工作流平台';

  return (
    <SidebarProvider>
      <div className="flex h-full w-full">
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
          <div className="flex h-14 items-center border-b px-4">
            <SidebarTrigger />
            <div className="ml-4 font-semibold">{title}</div>
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