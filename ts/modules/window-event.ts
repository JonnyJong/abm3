import { BrowserWindow, app, ipcMain, shell } from "electron";
import path from "path";

export class WindowEvent{
  constructor(win: BrowserWindow) {
    win.on('focus', ()=>{
      win.webContents.send('win:focused', true);
    });
    win.on('blur', ()=>{
      win.webContents.send('win:focused', false);
    });
    win.on('maximize', ()=>{
      win.webContents.send('win:resized',true);
    });
    win.on('resized', ()=>{
      win.webContents.send('win:resized',win.isMaximized());
    });
    win.on('restore',()=>{
      win.webContents.send('win:resized',false);
    });
    ipcMain.on('win:minimize',()=>{
      win.minimize();
    });
    ipcMain.on('win:resize',()=>{
      if (win.isMaximized()) {
        win.restore()
      } else {
        win.maximize()
      }
    });
    ipcMain.on('win:close',()=>{
      win.close();
    });
    ipcMain.on('win:maxmized',()=>{
      win.webContents.send('win:resized',win.isMaximized());
    });
    ipcMain.on('relaunch',()=>{
      app.relaunch();
    });
    ipcMain.on('url',(_, url)=>{
      shell.openExternal(url);
    });
    ipcMain.handle('getAppData', ()=>{
      return path.join(app.getPath('home'), '.jonny', app.getName());
    });
  }
}
