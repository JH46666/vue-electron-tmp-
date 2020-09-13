<template>
  <div id="app">
    <div class="titleBar">
      <div class="title">
        <div class="logo">
          <img src="@/assets/logo.png" alt="" />
        </div>
        <div class="txt">窗口标题</div>
      </div>
      <div class="windowTool">
        <div @click="minisize">
          <i class="iconfont iconminisize"></i>
        </div>
        <div v-if="isMaxSize" @click="restore">
          <i class="iconfont iconrestore"></i>
        </div>
        <div v-else @click="maxsize">
          <i class="iconfont iconmaxsize"></i>
        </div>
        <div @click="close" class="close">
          <i class="iconfont iconclose"></i>
        </div>
      </div>
    </div>
    <div class="content">
      <div id="nav">
        <router-link to="/">Home</router-link> |
        <router-link to="/about">About</router-link>
      </div>
      <div @click="openModel" style="font-caption">点击modal</div>
      <div @click="openNotification" style="font-caption">点击notification</div>
      <div @click="openIpcMain" style="font-caption">点击传递消息</div>
      <router-view />
    </div>
  </div>
</template>

<script>
const { remote, ipcRenderer } = require('electron');
const clipboard = require('clipboard-files');

export default {
  name: 'HelloWorld',
  data() {
    return {
      isMaxSize: false,
    };
  },
  mounted() {
    const win = remote.getCurrentWindow();
    win.on('maximize', () => {
      this.isMaxSize = true;
      this.setState();
    });
    win.on('unmaximize', () => {
      this.isMaxSize = false;
      this.setState();
    });
    win.on('move', this.debounce(() => {
      this.setState();
    }));
    win.on('resize', this.debounce(() => {
      this.setState();
    }));
    this.isMaxSize = win.isMaximized;
    this.getState();
    // shell.openExternal('https://www.baidu.com');
    ipcRenderer.on('msg_render2main', (event, param1, param2) => {
      console.log('event,param1, param2: ', event.sender, param1, param2);
      console.log('event,param1, param2: ', param1);
      console.log('event,param1, param2: ', param2);
    });
  },
  methods: {
    close() {
      remote.getCurrentWindow().close();
    },
    debounce(fn) {
      let timeout = null;
      return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          // eslint-disable-next-line prefer-rest-params
          fn.apply(this, arguments);
        }, 300);
      };
    },
    minisize() {
      remote.getCurrentWindow().minimize();
    },
    restore() {
      remote.getCurrentWindow().restore();
    },
    maxsize() {
      remote.getCurrentWindow().maxmize();
    },
    getState() {
      const win = remote.getCurrentWindow();
      let winState = localStorage.getItem('winstate');

      if (winState) {
        winState = JSON.parse(winState);
        if (winState.isMaxSize) win.maximize();
        else win.setBounds(winState.rect);
      }
    },
    setState() {
      const win = remote.getCurrentWindow();
      const rect = win.getBounds();
      const isMaxSize = win.isMaximized();
      const obj = { rect, isMaxSize };
      localStorage.setItem('winState', JSON.stringify(obj));
    },
    async openModel() {
      /*    this.win = new remote.BrowserWindow({
        parent: remote.getCurrentWindow(),
        modal: false,
        webPreferences: {
          nodeIntegration: true,
        },
      }); */

      const fileNames = clipboard.readFiles();
      console.log('fileNames: ', clipboard, fileNames);

      const { dialog, app, session } = remote;
      console.log('dialog, app: ', dialog, app, session);
      const filePath = await dialog.showOpenDialog({
        title: '我需要打开一个文件',
        buttonLabel: '按此打开文件',
        defaultPath: app.getPath('pictures'),
        properties: ['multiSelections'],
        filters: [
          { name: '图片', extensions: ['jpg', 'png', 'gif'] },
          { name: '视频', extensions: ['mkv', 'avi', 'mp4'] },
        ],
      });
      console.log('file', filePath);

      /*     const getCookie = async function (name) {
        const cookie = session.defaultSession.cookies.get({ name });
        if (cookie.length > 0) {
          return cookie[0].value;
        }
        return 0;
      };

      const setCookie = async function (cookie) {
        await session.defaultSession.cookies.set(cookie);
        await session.defaultSession.clearStorageData({storages: 'cookie,localstorage'})
      }; */

      // app.clearRecentDocuments('xxx');
      // app.clearRecentDocuments();
    },
    openNotification() {
      const { Notification } = remote;
      const notification = new Notification({
        title: '您收到新消息',
        body: '此为消息正文',
      });
      notification.show();
      notification.on('click', () => {
        alert('用户点击了系统消息');
      });
    },
    openIpcMain() {
      console.log(1);
      ipcRenderer.send('msg_render2main', { name: 'param1' }, { name: 'param2' });
    },
  },
};
</script>

<style lang="scss">
body,
html {
  margin: 0px;
  padding: 0px;
  overflow: hidden;
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
  overflow: hidden;
  margin: 0px;
  padding: 0px;
  box-sizing: border-box;
  border: 1px solid #f5222d;
  display: flex;
  flex-direction: column;
  text-align: center;
}
</style>

<style lang="scss" >
@import url(https://at.alicdn.com/t/font_1378132_s4e44adve5.css);
.titleBar {
  height: 38px;
  line-height: 36px;
  background: #fff1f0;
  display: flex;
  border-bottom: 1px solid #f5222d;
  .title {
    flex: 1;
    display: flex;
    -webkit-app-region: drag;
    .logo {
      padding-left: 8px;
      padding-right: 6px;
      img {
        width: 20px;
        height: 20px;
        margin-top: 7px;
      }
    }
    .txt {
      text-align: left;
      flex: 1;
    }
  }
  .windowTool {
    div {
      color: #888;
      height: 100%;
      width: 38px;
      display: inline-block;
      cursor: pointer;
      i {
        font-size: 12px;
      }
      &:hover {
        background: #ff4d4f;
      }
    }
    .close:hover {
      color: #fff;
      background: #ff4d4f;
    }
  }
}
.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
}
</style>
