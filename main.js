// Electronのメインプロセス
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// アプリケーションの起動時の処理
app.on('ready', () => {
  // IME関連の設定
  app.commandLine.appendSwitch('enable-experimental-web-platform-features');
  app.commandLine.appendSwitch('enable-ime-service');
  app.commandLine.appendSwitch('disable-renderer-backgrounding');
  app.commandLine.appendSwitch('lang', 'ja-JP');  // 日本語設定を追加
  
  createWindow();
});

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      spellcheck: false,
      sandbox: false,
      backgroundThrottling: false
    }
  });

  // macOS向けのメニュー設定
  if (process.platform === 'darwin') {
    const template = [
      {
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ]
      }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  // publicディレクトリのindex.htmlを読み込む
  win.loadFile(path.join(__dirname, 'public', 'index.html'));

  // 開発ツールを開く（開発時のデバッグ用）
  // win.webContents.openDevTools();
}

// macOS向けの設定
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // macOS向け: すべてのウィンドウが閉じた場合に再作成
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
}); 