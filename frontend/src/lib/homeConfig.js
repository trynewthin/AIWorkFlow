/**
 * @description Home 页面静态数据配置
 * @type {object}
 */
import { AudioWaveform, GalleryVerticalEnd, Command, SquareTerminal, Bot, BookOpen, Settings2, Frame, PieChart, Map, Workflow } from "lucide-react";
import { workflowService } from '../services';

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
  //  {
  //    title: "工作台",
  //    url: "#",
  //    icon: SquareTerminal,
  //    isActive: true,
  //    items: [
    //    { title: "历史记录", url: "#" },
    //    { title: "收藏项目", url: "#" },
    //    { title: "设置选项", url: "#" },
    //    ],
    //  },


    {
      title: "工作流",
      url: "#",
      icon: Workflow,
      items: [
        { title: "工作流列表", url: "/workflow" },
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
      title: "系统设置",
      url: "#",
      icon: Settings2,
      items: [
        { title: "教程文档", url: "/docs" },
      ],
    },
  ],
  // 获取项目列表的方法，便于动态渲染
  getProjects: async () => {
    try {
      // 默认的项目列表，如果API调用失败会显示这些
      const defaultProjects = [
        { name: "设计工程", url: "#", icon: Frame },
        { name: "营销企划", url: "#", icon: PieChart },
        { name: "出行计划", url: "#", icon: Map },
      ];
      
      // 尝试从后端获取工作流列表 (使用新的服务)
      const workflows = await workflowService.listWorkflows();
      
      // 检查响应是否成功且包含数据 (服务的返回已经是处理过的 data 或抛出错误)
      // 因此，如果执行到这里，说明 workflows 已经是数据了
      if (workflows && Array.isArray(workflows)) {
        // 将工作流转换为项目格式
        const workflowProjects = workflows.map(workflow => ({
          id: workflow.id, // 保存原始ID以便导航
          name: workflow.name || '未命名工作流',
          url: `/workflow/${workflow.id}`, // 设置为直接导航到工作流详情页的URL
          icon: Workflow, // 使用工作流图标
          description: workflow.description // 存储描述以便可能的显示
        }));
        
        // 返回工作流项目列表
        return workflowProjects;
      }
      
      // 如果API调用失败或无数据 (这种情况理论上会被catch捕获，或者服务返回空数组)
      // 但为了保险，保留一个回退
      console.warn('workflowService.listWorkflows 返回的不是预期的数组，或为空，将使用默认项目列表');
      return defaultProjects;
    } catch (error) {
      console.error('通过 workflowService.listWorkflows 获取工作流列表失败:', error);
      // 如果出错，返回默认项目列表
      return [
        { name: "设计工程", url: "#", icon: Frame },
        { name: "营销企划", url: "#", icon: PieChart },
        { name: "出行计划", url: "#", icon: Map },
      ];
    }
  },
};

export default homeConfig; 