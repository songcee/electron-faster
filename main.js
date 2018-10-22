const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const globalShortcut = electron.globalShortcut
const Menu = electron.Menu
const Tray = electron.Tray
const shell = electron.shell
const ipc = electron.ipcMain
const regedit = require('regedit'); //引入regedit
let mainWindow, settingWindow

function createMainWindow () {
  // 新建主窗口
  mainWindow = new BrowserWindow({
    width: 416,
    height: 72,
    maximizable: false, // 可否最大化
    resizable: false, // 是否可调节大小
    alwaysOnTop: true, // 是否总是在所有窗口最顶部
    transparent: true, // 窗口背景是否透明
    skipTaskbar: true, // 在任务栏是否显示
    frame: false, // 是否有边框
    show: false, // 是否启动时就显示
    center: true // 是否居中显示弹窗
  })

  // 加载内部页面
  mainWindow.loadFile('index.html')

  // 打开开发者工具
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })

  // 监听新窗口
  let webContents = mainWindow.webContents
  webContents.on('new-window', function (e, url, name) {
    shell.openExternal(url)
    mainWindow.hide()
    e.preventDefault()
  })
}

function createSettingWindow () {
  // 创建设置窗口
  settingWindow = new BrowserWindow({
    width: 800,
    height: 600,
    // maximizable: false, // 可否最大化
    // resizable: false, // 是否可调节大小
    // alwaysOnTop: true, // 是否总是在所有窗口最顶部
    // transparent: true, // 窗口背景是否透明
    frame: false, // 是否有边框
    center: true // 是否居中显示弹窗
  })
  settingWindow.loadFile('setting.html')
  // settingWindow.on('closed', function () {
  //   settingWindow = null
  // })
  // 监听新窗口
  let webContents = settingWindow.webContents
  webContents.on('new-window', function (e, url, name) {
    shell.openExternal(url)
    settingWindow.hide()
    e.preventDefault()
  })
  browserAPI(settingWindow)
}

// 防止重复开启应用
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.on('ready', () => {
    // 右下角图标及右键菜单栏
    appIcon = new Tray(__dirname + '/images/icon.jpg')
    var contextMenu = Menu.buildFromTemplate([
      { label: '打开', click: function () {
        mainWindow.show()
        mainWindow.focus()
      } },
      { label: '设置', click: function () {
        createSettingWindow()
      } },
      { label: '退出', click: function () {
        app.quit()
      } }
    ])
    appIcon.setToolTip('faster')
    appIcon.setContextMenu(contextMenu)
    
    // 开启搜索框快捷键
    var ret = globalShortcut.register('ctrl+x', function() {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus()
      }
    })
    if (!ret) {
      console.log('registration failed')
    }

    createMainWindow()
  })
}

app.on('open-url', function() {
  shell.openExternal(url)
  mainWindow.hide()
  event.preventDefault()
})

app.on('will-quit', function() {
  // Unregister all shortcuts.
  globalShortcut.unregisterAll()
})

// app.on('window-all-closed', function () {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })

app.on('activate', function () {
  if (mainWindow === null) {
    createMainWindow()
  }
})

// 注册开机启动
regedit.list('HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',function(err,result){
  console.log(result);
})



// 注册对外接口
function browserAPI (browser) {
  // 窗口最小化
  ipc.on('window-min',function(){
    browser.minimize()
  })
  // 窗口最小化
  ipc.on('window-restore',function(){
    browser.restore()
  })
  // 窗口最大化
  ipc.on('window-max',function(){
    browser.maximize() 
  })
  // 关闭窗口
  ipc.on('window-close',function(){
    browser.close()
  })
  // 修改窗口大小
  ipc.on('window-setSize',function(e, data){
    browser.setSize(data.width, data.height)
  })
}