import { BrowserWindow, Menu, app, nativeTheme } from "electron";
import path from "path";
import style from "./modules/style";
import WindowState from "./modules/window-state";
import { WindowEvent } from "./modules/window-event";
import { initDialog } from "./modules/dialog";
import { initConfig } from "./modules/config";

Menu.setApplicationMenu(null);

app.on('ready',()=>{

  initConfig();

  const win = new BrowserWindow({
    show: false,
    frame: false,
    resizable: true,
    enableLargerThanScreen: false,
    title: app.getName(),
    icon: path.join(process.cwd(), './assets/icons/icon.ico'),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#202020' : '#f3f3f3',
    minWidth: 1160,
    minHeight: 600,
    webPreferences: {
      spellcheck: false,
      preload: path.join(__dirname, 'preload.js'),
      defaultEncoding: 'utf-8',
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  let windowState = new WindowState(win);

  win.loadFile(path.join(__dirname, '../layout/index.html'));

  style.insert(path.join(process.cwd(), 'style/main.styl'), win.webContents);

  win.on('ready-to-show', ()=>{
    windowState.show();
  });
  win.webContents.openDevTools();

  new WindowEvent(win);

  initDialog(win);
});
