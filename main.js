const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const globalShortcut = electron.globalShortcut
const Menu = electron.Menu
const Tray = electron.Tray
const shell = electron.shell
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 416,
    height: 72,
    // minWidth: 300,
    resizable: false, // 是否可调节大小
    transparent: true, // 窗口背景是否透明
    skipTaskbar: true, // 在任务栏是否显示
    frame: false, // 是否有边框
    show: false, // 是否启动时就显示
    center: true // 是否居中显示弹窗
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  let webContents = mainWindow.webContents;
  webContents.on('new-window', function (e, url, name) {
    shell.openExternal(url);
    mainWindow.hide()
    e.preventDefault()
  })
}

// 防止重复开启应用
let shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.focus()
  }
})
if (shouldQuit) {
  app.quit()
}



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
  // icon
  console.log(__dirname)
  appIcon = new Tray(__dirname + '/images/icon.jpg');
  var contextMenu = Menu.buildFromTemplate([
    { label: '打开', click: function () {console.log('打开')} },
    { label: '设置', click: function () {console.log('设置')} },
    { label: '退出', click: function () {app.quit()} }
  ]);
  appIcon.setToolTip('This is my application.');
  appIcon.setContextMenu(contextMenu);
  
  var ret = globalShortcut.register('ctrl+x', function() {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
  if (!ret) {
    console.log('registration failed');
  }
  createWindow()
})

app.on('will-quit', function() {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
});

// app.on('window-all-closed', function () {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
