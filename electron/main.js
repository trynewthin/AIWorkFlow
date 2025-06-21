const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const { ElectronEgg } = require('ee-core');
const { Lifecycle } = require('./preload/lifecycle');
const { preload } = require('./preload');

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



