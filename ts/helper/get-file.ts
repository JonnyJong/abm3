import { ipcRenderer } from "electron";
import { locale } from "../script/locale";

export function getImage() {
  return ipcRenderer.invoke('dialog:open', {
    title: locale.markdown.img_choose,
    filters: [{
      name: locale.markdown.image,
      extensions: ['apng','avif','bmp','gif','jpg','jpeg','jfif','pjpeg','pjp','png','svg','tif','tiff','webp'],
    }],
    properties: ['openFile','dontAddToRecent'],
  });
}
