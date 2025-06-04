/**
 * 开发服务器启动脚本
 * 支持热重载和开发环境优化
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const kill = require('tree-kill');

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
let isShuttingDown = false;

/**
 * 检查端口是否被占用
 * @param {number} port 端口号
 * @returns {Promise<boolean>} 端口是否被占用
 */
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    const command = process.platform === 'win32' 
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port}`;
    
    exec(command, (error, stdout) => {
      resolve(!!stdout.trim());
    });
  });
};

/**
 * 杀死占用端口的进程
 * @param {number} port 端口号
 */
const killPortProcess = async (port) => {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    let command;
    
    if (process.platform === 'win32') {
      // Windows: 先查找占用端口的进程，然后杀死
      command = `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /F /PID %a`;
    } else {
      // Unix/Linux/macOS
      command = `lsof -ti :${port} | xargs kill -9`;
    }
    
    exec(command, (error) => {
      if (error) {
        console.log(`⚠️  清理端口 ${port} 时出现错误:`, error.message);
      } else {
        console.log(`✅ 已清理端口 ${port}`);
      }
      resolve();
    });
  });
};

/**
 * 安全终止进程
 * @param {ChildProcess} process 要终止的进程
 * @returns {Promise<void>}
 */
const safeKillProcess = (process) => {
  return new Promise((resolve) => {
    if (!process || process.killed) {
      resolve();
      return;
    }

    // 使用tree-kill终止整个进程树
    kill(process.pid, 'SIGTERM', (err) => {
      if (err) {
        console.log('⚠️  温和终止失败，尝试强制终止...');
        // 如果温和终止失败，使用SIGKILL强制终止
        kill(process.pid, 'SIGKILL', (killErr) => {
          if (killErr) {
            console.error('❌ 强制终止失败:', killErr);
          } else {
            console.log('✅ 进程已强制终止');
          }
          resolve();
        });
      } else {
        console.log('✅ 进程已温和终止');
        resolve();
      }
    });
  });
};

// 启动主应用
const startApp = async () => {
  // 如果正在关闭，不启动新进程
  if (isShuttingDown) {
    return;
  }

  // 先检查常用端口是否被占用并清理
  const commonPorts = [8080, 3000, 5173, 4173]; // Vite默认端口等
  for (const port of commonPorts) {
    if (await isPortInUse(port)) {
      console.log(`🔧 检测到端口 ${port} 被占用，正在清理...`);
      await killPortProcess(port);
      // 等待一下确保端口释放
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 如果已有进程在运行，先安全终止它
  if (appProcess && !appProcess.killed) {
    console.log('🔄 终止旧进程...');
    await safeKillProcess(appProcess);
    // 等待进程完全终止
    await new Promise(resolve => setTimeout(resolve, 2000));
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
    if (!isShuttingDown && !isRestarting) {
      console.log('🔄 尝试重新启动...');
      setTimeout(startApp, 3000);
    }
  });

  appProcess.on('exit', (code, signal) => {
    if (!isShuttingDown && !isRestarting) {
      if (code !== 0) {
        console.log(`⚠️  应用异常退出，代码: ${code}, 信号: ${signal}`);
        console.log('🔄 尝试重新启动...');
        setTimeout(startApp, 3000);
      }
    }
  });

  console.log(`🎯 应用已启动，进程ID: ${appProcess.pid}`);
  return appProcess;
};

// 重启应用
const restartApp = async () => {
  if (isRestarting || isShuttingDown) return;
  
  isRestarting = true;
  console.log('🔄 正在重启应用...');
  
  // 清除之前的重启计时器
  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }
  
  // 延迟重启，避免频繁重启
  restartTimeout = setTimeout(async () => {
    try {
      await startApp();
    } catch (error) {
      console.error('❌ 重启失败:', error);
    } finally {
      isRestarting = false;
    }
  }, 1500);
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
const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  
  console.log(`\n👋 收到信号 ${signal}，正在关闭开发服务器...`);
  isShuttingDown = true;
  
  if (restartTimeout) {
    clearTimeout(restartTimeout);
  }
  
  if (appProcess && !appProcess.killed) {
    console.log('🔄 正在安全终止应用进程...');
    try {
      await safeKillProcess(appProcess);
      console.log('✅ 应用进程已安全终止');
    } catch (error) {
      console.error('❌ 终止应用进程时出错:', error);
    }
  }
  
  console.log('👋 开发服务器已关闭');
  process.exit(0);
};

// 注册信号处理器
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Windows特殊处理
if (process.platform === 'win32') {
  process.on('SIGBREAK', () => gracefulShutdown('SIGBREAK'));
}

// 未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  gracefulShutdown('unhandledRejection');
});

// 启动开发环境
console.log('⚡ 正在设置文件监听...');
setupFileWatcher();

console.log('🎯 启动应用...');
startApp();

console.log('\n✅ 开发环境已启动!');
console.log('💡 提示: 修改后端代码将自动重载');
console.log('🔧 按 Ctrl+C 停止服务器');
console.log('🌐 编码问题已优化，中文显示应该正常');
console.log('🔧 端口冲突问题已修复，支持自动清理占用端口\n'); 