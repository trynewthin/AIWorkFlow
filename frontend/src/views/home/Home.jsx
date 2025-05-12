import React from 'react';
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

/**
 * @description 示例数据
 */
const data = {
  user: {
    name: "用户名称",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  teams: [
    {
      name: "我的团队",
      logo: GalleryVerticalEnd,
      plan: "高级版",
    },
    {
      name: "个人项目",
      logo: AudioWaveform,
      plan: "标准版",
    },
    {
      name: "协作项目",
      logo: Command,
      plan: "免费版",
    },
  ],
  navMain: [
    {
      title: "工作台",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "历史记录",
          url: "#",
        },
        {
          title: "收藏项目",
          url: "#",
        },
        {
          title: "设置选项",
          url: "#",
        },
      ],
    },
    {
      title: "模型管理",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "本地模型",
          url: "#",
        },
        {
          title: "在线模型",
          url: "#",
        },
        {
          title: "自定义模型",
          url: "#",
        },
      ],
    },
    {
      title: "文档中心",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "入门指南",
          url: "#",
        },
        {
          title: "快速开始",
          url: "#",
        },
        {
          title: "教程示例",
          url: "#",
        },
        {
          title: "更新日志",
          url: "#",
        },
      ],
    },
    {
      title: "系统设置",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "基础设置",
          url: "#",
        },
        {
          title: "团队管理",
          url: "#",
        },
        {
          title: "账单信息",
          url: "#",
        },
        {
          title: "使用限制",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "设计工程",
      url: "#",
      icon: Frame,
    },
    {
      name: "营销企划",
      url: "#",
      icon: PieChart,
    },
    {
      name: "出行计划",
      url: "#",
      icon: Map,
    },
  ],
};

/**
 * @description 主页组件
 * @returns {JSX.Element}
 */
function Home() {
  return (
    <SidebarProvider>
      <div className="flex h-full w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <TeamSwitcher teams={data.teams} />
          </SidebarHeader>
          <SidebarContent>
            <NavMain items={data.navMain} />
            <NavProjects projects={data.projects} />
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={data.user} />
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col overflow-auto">
          <div className="flex h-14 items-center border-b px-4">
            <SidebarTrigger />
            <div className="ml-4 font-semibold">AI 工作流平台</div>
          </div>
          <main className="flex-1 p-6">
            <div className="mx-auto max-w-4xl">
              <h1 className="text-2xl font-bold">欢迎使用 AI 工作流平台</h1>
              <p className="mt-2 text-muted-foreground">这是一个集成了 shadcn/ui 组件的现代化工作流管理平台</p>
              
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h2 className="text-lg font-medium">最近项目</h2>
                  <p className="mt-2 text-sm text-muted-foreground">查看您最近处理的工作流项目</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h2 className="text-lg font-medium">快速操作</h2>
                  <p className="mt-2 text-sm text-muted-foreground">常用功能和操作的快速入口</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Home; 