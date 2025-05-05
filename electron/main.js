const { ElectronEgg } = require('ee-core');
const { Lifecycle } = require('./preload/lifecycle');
const { preload } = require('./preload');
const { SqlitedbService } = require('./service/sqlitedb');
const { app: electronApp } = require('electron');

// new app
const eggApp = new ElectronEgg();

// register lifecycle
const life = new Lifecycle();
eggApp.register("ready", life.ready);
eggApp.register("electron-app-ready", life.electronAppReady);
eggApp.register("window-ready", life.windowReady);
eggApp.register("before-close", life.beforeClose);

// register preload
eggApp.register("preload", preload);

// run
eggApp.run();

// 在应用启动并完成初始化后再创建服务实例
const sqlitedbService = new SqlitedbService();

// 在应用关闭前关闭数据库连接
electronApp.on('before-quit', () => {
  sqlitedbService.close();
});