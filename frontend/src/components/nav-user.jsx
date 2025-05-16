"use client"

import { useState, useEffect } from "react"
import {
  ChevronsUpDown,
  LogOut,
  UserCircle
} from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { userService } from "@/services"
import { toast } from "sonner"

export function NavUser() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    id: 0,
    username: '加载中...',
    created_at: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // 获取当前用户信息
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const res = await userService.getCurrentUser()
        
        if (res.success && res.user) {
          setUserData(res.user)
        } else {
          console.error('获取用户信息失败:', res.message)
        }
      } catch (error) {
        console.error('获取用户数据错误:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
  }, [])
  
  // 处理退出登录
  const handleLogout = async () => {
    try {
      const res = await userService.logout()
      
      if (res.success) {
        toast.success('退出登录成功')
        navigate('/login') // 导航到登录页面
      } else {
        toast.error('退出登录失败: ' + (res.message || '未知错误'))
      }
    } catch (error) {
      console.error('退出登录错误:', error)
      toast.error('退出登录失败: ' + (error.message || '未知错误'))
    }
  }
  
  // 获取用户名首字母作为头像备用显示
  const getUserInitial = (username) => {
    return username && typeof username === 'string' ? username.charAt(0).toUpperCase() : '?'
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{getUserInitial(userData.username)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userData.username}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">{getUserInitial(userData.username)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userData.username}</span>
                  <span className="truncate text-xs">创建于: {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : '未知'}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/user">
                  <UserCircle className="mr-2" />
                  用户中心
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
