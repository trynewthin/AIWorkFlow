import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";

/**
 * @description 教程文档导航页面
 * @returns {JSX.Element} 教程导航页面组件
 */
const DocsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold">教程文档中心</h1>
      <p className="text-muted-foreground mt-2 mb-6">选择下面的教程开始学习使用系统</p>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>节点使用教程</CardTitle>
            <CardDescription>
              学习如何创建、配置和连接节点，构建您的工作流
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              本教程将引导您了解节点的基本概念，以及如何在系统中有效地使用节点功能。
              通过学习本教程，您将能够创建复杂的工作流程。
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button asChild>
              <Link to="/docs/node" className="flex items-center gap-2">
                查看教程
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"></path>
                </svg>
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="opacity-50 hover:opacity-60 transition-opacity">
          <CardHeader>
            <CardTitle>知识库管理教程</CardTitle>
            <CardDescription>
              了解如何创建和管理知识库，提升信息检索效率
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              即将推出，敬请期待...
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button disabled variant="outline">即将推出</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DocsPage; 