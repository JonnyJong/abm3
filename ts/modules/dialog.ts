import { BrowserWindow, dialog, ipcMain } from "electron";

export function initDialog(win: BrowserWindow){
  ipcMain.handle('dialog:open', (_, options)=>{
    return dialog.showOpenDialog(win, options);
  });
}
