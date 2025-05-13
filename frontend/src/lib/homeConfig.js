/**
 * @description Home 页面静态数据配置
 * @type {object}
 */
import { AudioWaveform, GalleryVerticalEnd, Command, SquareTerminal, Bot, BookOpen, Settings2, Frame, PieChart, Map, Workflow } from "lucide-react";

const homeConfig = {
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
    //    { title: "历史记录", url: "#" },
    //    { title: "收藏项目", url: "#" },
    //    { title: "设置选项", url: "#" },
      ],
    },

    // 暂时屏蔽
    //{
    //  title: "模型管理",
    //  url: "#",
    //  icon: Bot,
    //  items: [
    //    { title: "本地模型", url: "#" },
    //    { title: "在线模型", url: "#" },
    //    { title: "自定义模型", url: "#" },
    //  ],
    //},

    {
      title: "知识库",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "知识库管理", url: "/knowledge" },
      ],
    },

    {
      title: "工作流",
      url: "#",
      icon: Workflow,
      items: [
        { title: "工作流列表", url: "/workflow" },
      ],
    },

    {
      title: "系统设置",
      url: "#",
      icon: Settings2,
      items: [
        { title: "教程文档", url: "/docs" },
      ],
    },
  ],
  // 获取项目列表的方法，便于动态渲染
  getProjects: () => [
    { name: "设计工程", url: "#", icon: Frame },
    { name: "营销企划", url: "#", icon: PieChart },
    { name: "出行计划", url: "#", icon: Map },
  ],
};

export default homeConfig; 