// Electronのメインプロセス
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // publicディレクトリのindex.htmlを読み込む
  win.loadFile(path.join(__dirname, 'public', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // macOS以外ではすべてのウィンドウが閉じた時にアプリを終了
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  // macOS向け: すべてのウィンドウが閉じた場合に再作成
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
}); 