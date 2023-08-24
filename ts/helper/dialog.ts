import { OpenDialogReturnValue, SaveDialogReturnValue, ipcRenderer } from "electron";
import { locale } from "../script/locale";

export function getImage(): Promise<OpenDialogReturnValue> {
  return ipcRenderer.invoke('dialog:open', {
    title: locale.markdown.img_choose,
    filters: [{
      name: locale.markdown.image,
      extensions: ['apng','avif','bmp','gif','jpg','jpeg','jfif','pjpeg','pjp','png','svg','tif','tiff','webp'],
    }],
    properties: ['openFile','dontAddToRecent'],
  });
}

export function saveInFolder(defaultPath?: string): Promise<OpenDialogReturnValue> {
  return ipcRenderer.invoke('dialog:open', {
    defaultPath,
    properties: ['openDirectory', 'createDirectory', 'dontAddToRecent'],
  });
}

export function saveFile(): Promise<SaveDialogReturnValue> {
  return ipcRenderer.invoke('dialog:save', {
    filters: [{
      name: 'zip',
      extensions: ['zip'],
    }],
    properties: ['createDirectory', 'dontAddToRecent', 'showOverwriteConfirmation'],
  });
}
