import { BrowserWindow, app, ipcMain, nativeImage, nativeTheme, shell, systemPreferences } from "electron";
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
    ipcMain.on('open:url',(_, url)=>{
      shell.openExternal(url);
    });
    ipcMain.handle('path:data', ()=>{
      return path.join(app.getPath('home'), '.jonny', app.getName());
    });
    ipcMain.handle('path:root', ()=>app.getAppPath());
    ipcMain.on('drag',async (ev, file)=>{
      let icon;
      try {
        icon = await nativeImage.createThumbnailFromPath(file, {width: 128, height: 128});
      } catch (error) {
        icon = nativeImage.createEmpty();
      }
      ev.sender.startDrag({
        file,
        icon,
      });
    });
    ipcMain.on('theme', (_, theme: 'system' | 'light' | 'dark')=>{
      let bg = '';
      switch (theme) {
        case "system":
          bg = nativeTheme.shouldUseDarkColors ? '#202020' : '#f3f3f3';
          break;
        case "light":
          bg = '#f3f3f3';
          break;
        case "dark":
          bg = '#202020';
          break;
      }
      win.setBackgroundColor(bg);
      nativeTheme.themeSource = theme;
    });
    ipcMain.handle('theme:color', ()=>{
      return ('#' + systemPreferences.getAccentColor()).slice(0, 7);
    });
    ipcMain.handle('app:version', ()=>{
      return app.getVersion();
    });
    ipcMain.on('open:path', (_, link)=>{
      shell.openPath(path.join(link));
    });
    ipcMain.on('update:install',()=>{
      switch (process.platform) {
        case "win32":
          shell.openPath(path.join(app.getAppPath(), 'update.bat'));
          break;
        case "linux":
          shell.openPath(path.join(app.getAppPath(), 'update.sh'));
          break;
      }
    });
  }
}
