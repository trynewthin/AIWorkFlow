// Renderer 对象来自 preload 脚本，通过 contextBridge 暴露在 window.electron
interface ElectronAPI {
  ipcRenderer?: {
    invoke: (channel: string, param?: any) => Promise<any>;
    sendSync: (channel: string, param?: any) => any;
    on: (channel: string, listener: (...args: any[]) => void) => void;
    once: (channel: string, listener: (...args: any[]) => void) => void;
    removeListener: (channel: string, listener: (...args: any[]) => void) => void;
    removeAllListeners: (channel: string) => void;
    send: (channel: string, ...args: any[]) => void;
    postMessage: (channel: string, message: any, transfer?: MessagePort[]) => void;
    sendTo: (webContentsId: number, channel: string, ...args: any[]) => void;
    sendToHost: (channel: string, ...args: any[]) => void;
  };
}

declare global {
  interface Window {
    electron?: ElectronAPI;
    require?: (module: string) => any;
  }
}

/**
 * Renderer 对象获取，支持多种获取方式
 */
const Renderer = (window.require && window.require('electron')) || window.electron || {};

/**
 * ipc
 * 官方 API 说明：https://www.electronjs.org/zh/docs/latest/api/ipc-renderer
 *
 * 属性/方法
 * ipc.invoke(channel, param) - 发送异步消息（invoke/handle 模型）
 * ipc.sendSync(channel, param) - 发送同步消息（send/on 模型）
 * ipc.on(channel, listener) - 监听 channel，当新消息到达时调用 listener
 * ipc.once(channel, listener) - 添加一次性 listener 函数
 * ipc.removeListener(channel, listener) - 从监听队列中删除特定的 listener 监听者
 * ipc.removeAllListeners(channel) - 移除所有监听器，当指定 channel 时只移除与其相关的所有监听器
 * ipc.send(channel, ...args) - 通过 channel 向主进程发送异步消息
 * ipc.postMessage(channel, message, [transfer]) - 发送消息到主进程
 * ipc.sendTo(webContentsId, channel, ...args) - 通过 channel 发送消息到带有 webContentsId 的窗口
 * ipc.sendToHost(channel, ...args) - 消息会被发送到 host 页面上的 <webview> 元素
 */

/**
 * ipc 渲染进程通信实例
 */
const ipc = Renderer.ipcRenderer || undefined;

/**
 * 是否为 Electron 环境
 */
const isEE = ipc ? true : false;

export {
  Renderer,
  ipc,
  isEE
}; 