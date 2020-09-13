import {
  app, protocol, BrowserWindow, Menu, shell, globalShortcut, Tray, net, crashReporter, ipcMain,
} from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';

const log = require('electron-log');

log.error('error');
log.warn('warn');
log.info('info');
log.verbose('verbose');
log.debug('debug');
log.silly('silly');

const path = require('path');

const staticPath = path.normalize(`${__dirname}/../public/`);

const isDevelopment = process.env.NODE_ENV !== 'production';
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: false,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    console.log('process.env.WEBPACK_DEV_SERVER_URL: ', process.env.WEBPACK_DEV_SERVER_URL);
    const isMac = process.platform === 'darwin';
    const template = [
      {
        label: '主页',
      },
      {
        label: '技术网站推荐',
        submenu: [
          {
            label: 'Vue.js',
            click() {
              // 在浏览器中打开链接
              shell.openExternal('https://cn.vuejs.org/');
            },
            enabled: true,
          },
          {
            type: 'separator',
          },
          {
            label: 'w3school',
            click() {
              // 打开新窗口,加载网址，若加载本项目的文件，需要使用win.loadFile('fielPath')
              win.loadURL('https://www.w3school.com.cn/');

              win.on('close', () => {
                win = null;
              });
            },
          },
          {
            label: '百度',
            click(menuItem, browserWindow, event) {
              // 在当前窗口重新加载新内容
              browserWindow.loadURL('http://www.baidu.com');
            },
          },
        ],
      },
      {
        label: '菜单4',
        submenu: [
          {
            label: 'Vue.js',
            click() {
              // 在浏览器中打开链接
              shell.openExternal('https://cn.vuejs.org/');
            },
            enabled: true,
          },
        ],
      },
      {
        label: '退出',
        accelerator: 'ctrl+q', // 快捷键设置
        role: isMac ? 'close' : 'quit', // 使用系统配置项--退出应用
      },
    ];
    if (process.platform === 'darwin') {
      template.unshift({ label: '' });
    }
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
    globalShortcut.register('CommandOrControl+K', () => {
      console.log('监听键盘');
    });
    /*     const appDataPath = app.getPath('appData');
    console.log(appDataPath); */

    /*     const tray = new Tray(path.join(`${__dirname}icon.icns`)); */

    const request = net.request('https://www.cnblogs.com/aggsite/AggStats');
    request.on('response', (response) => {
      let html = '';
      response.on('data', (data) => (html += data));
      response.on('end', () => console.log(html));
    });
    request.end();

    crashReporter.start({
      productName: 'vue-tem',
      companyName: 'junyue',
      submitURL: 'https://baidu.com',
      uploadToServer: true,
    });
    ipcMain.on('msg_render2main', (event, param1, param2) => {
      console.log('event,param1, param2: ', event.sender, param1, param2);
      console.log('event,param1, param2: ', param1);
      console.log('event,param1, param2: ', param2);
      win.webContents.sender('msg_render2main', param1, param2);
    });
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
  });
}
app.allowRendererProcessReuse = false;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      // await installExtension(VUEJS_DEVTOOLS);
      const toolPath = '/Users/sjh/Library/Application Support/Google/Chrome/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/5.3.3_0';
      BrowserWindow.addDevToolsExtension(toolPath);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
