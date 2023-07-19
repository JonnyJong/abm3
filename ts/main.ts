import { BrowserWindow, app, nativeTheme } from "electron";
import path from "path";
import { registeProtocol } from "./modules/protocol";
import pug from "./modules/pug";
import style from "./modules/style";
// @ts-ignore
import packageInfo from "../package.json";
import WindowState from "./modules/window-state";
import { WindowEvent } from "./modules/window-event";
import { initDialog } from "./modules/dialog";

app.on('ready',()=>{
  registeProtocol('pug', pug.portocolHandler);
  // registeProtocol('styl', style.portocolHandler);

  const win = new BrowserWindow({
    show: false,
    frame: false,
    resizable: true,
    enableLargerThanScreen: false,
    title: packageInfo.name,
    icon: path.join(process.cwd(), './assets/icons/icon.ico'),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#202020' : '#f3f3f3',
    webPreferences: {
      spellcheck: false,
      preload: path.join(__dirname, 'preload.js'),
      defaultEncoding: 'utf-8',
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  let windowState = new WindowState(win);

  win.loadFile(path.join(__dirname, '../layout/index.pug'));

  style.insert(path.join(process.cwd(), 'style/main.styl'), win.webContents);

  win.on('ready-to-show', ()=>{
    windowState.show();
  });
  win.webContents.openDevTools();

  new WindowEvent(win);

  initDialog(win);
});
