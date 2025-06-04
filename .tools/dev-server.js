/**
 * 开发服务器启动脚本
 * 支持热重载和开发环境优化
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 设置环境变量
process.env.NODE_ENV = 'development';

// 设置编码环境变量，解决中文乱码问题
process.env.LANG = 'zh_CN.UTF-8';
process.env.LC_ALL = 'zh_CN.UTF-8';
if (process.platform === 'win32') {
  // Windows 特殊处理
  process.env.CHCP = '65001'; // UTF-8
}

console.log('🚀 启动 AIWorkFlow 开发环境...');
console.log('📁 工作目录:', process.cwd());
console.log('🔥 热重载已启用');
console.log('🔤 编码设置: UTF-8');

// 全局变量管理应用进程和重启状态
let appProcess = null;
let isRestarting = false;
let restartTimeout = null;

// 启动主应用
const startApp = () => {
  // 如果已有进程在运行，先终止它
  if (appProcess && !appProcess.killed) {
    appProcess.kill('SIGTERM');
  }

  // Windows 下先设置代码页为 UTF-8
  const commands = [];
  if (process.platform === 'win32') {
    commands.push('chcp 65001 >nul 2>&1');
  }
  commands.push('npm run dev');
  
  appProcess = spawn('cmd', ['/c', commands.join(' && ')], {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '..'), // 回到项目根目录
    env: {
      ...process.env,
      // 强制设置编码相关环境变量
      NODE_OPTIONS: '--max_old_space_size=4096',
      FORCE_COLOR: '1'
    }
  });

  appProcess.on('error', (err) => {
    console.error('❌ 应用启动失败:', err);
  });

  appProcess.on('exit', (code) => {
    if (code !== 0 && !isRestarting) {
      console.log(`⚠️  应用异常退出，代码: ${code}`);
      console.log('🔄 尝试重新启动...');
      setTimeout(startApp, 2000);
    }
  });

  console.log(`🎯 应用已启动，进程ID: ${appProcess.pid}`);
  return appProcess;
};

// 重启应用
const restartApp = () => {
  if (isRestarting) return;
  
  isRestarting = true;
  console.log('🔄 正在重启应用...');
  
  // 清除之前的重启计时器
  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }
  
  // 延迟重启，避免频繁重启
  restartTimeout = setTimeout(() => {
    if (appProcess && !appProcess.killed) {
      appProcess.kill('SIGTERM');
      // 等待进程结束后重启
      appProcess.on('exit', () => {
        console.log('✅ 旧进程已终止，启动新进程...');
        startApp();
        isRestarting = false;
      });
    } else {
      startApp();
      isRestarting = false;
    }
  }, 1000);
};

// 监听文件变化
const setupFileWatcher = () => {
  const projectRoot = path.resolve(__dirname, '..');
  const watchPaths = [
    'electron'
  ];

  // 监听主文件
  const mainJSPath = path.join(projectRoot, 'electron/main.js');
  if (fs.existsSync(mainJSPath)) {
    fs.watchFile(mainJSPath, { interval: 1000 }, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log('🔄 检测到主文件变化: electron/main.js');
        restartApp();
      }
    });
  }

  // 监听其他目录
  watchPaths.forEach(watchPath => {
    const fullPath = path.join(projectRoot, watchPath);
    if (fs.existsSync(fullPath)) {
      fs.watch(fullPath, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('.js') || filename.endsWith('.json'))) {
          console.log(`🔄 检测到文件变化: ${path.join(watchPath, filename)}`);
          restartApp();
        }
      });
    }
  });
};

// 处理进程退出
const gracefulShutdown = () => {
  console.log('\n👋 正在关闭开发服务器...');
  isRestarting = false;
  
  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }
  
  if (appProcess && !appProcess.killed) {
    appProcess.kill('SIGTERM');
    appProcess.on('exit', () => {
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// 启动开发环境
console.log('⚡ 正在设置文件监听...');
setupFileWatcher();

console.log('🎯 启动应用...');
startApp();

console.log('\n✅ 开发环境已启动!');
console.log('💡 提示: 修改后端代码将自动重载');
console.log('🔧 按 Ctrl+C 停止服务器');
console.log('🌐 编码问题已优化，中文显示应该正常\n'); 