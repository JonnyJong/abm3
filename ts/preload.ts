import { ipcRenderer } from "electron";
import { timer } from "./helper/timer";
import { initConfig } from "./modules/config";
import { initDB } from "./script/db";
import { updateLocale } from "./script/locale";
import { initPage } from "./script/page";
import { initSearchbar } from "./script/search";
import { settings } from "./script/settings";
import { checkUpdate } from "./script/update";
import { initUserMenu } from "./script/user-menu";
import { initWindowEvent } from "./script/window-event";
import { initUI } from "./ui/main";
import { ErrorDialog } from "./ui/dialog";

window.onerror = (ev)=>{
  new ErrorDialog(JSON.stringify(ev));
};

document.addEventListener('DOMContentLoaded',async ()=>{
  initWindowEvent();
  
  initUI();

  await initConfig();

  await settings.init();

  await updateLocale(settings.getLocale());

  initPage();

  initUserMenu();

  initSearchbar();
  
  document.body.classList.remove('loading');
  
  await timer(1);
  initDB();

  if (settings.getAutoUpdate()) {
    checkUpdate();
  }
});

ipcRenderer.invoke('dev:check').then((isDev)=>{
  if (!isDev) return;
  window.addEventListener('keypress',({key})=> key === "\u0012" ? location.reload() : '');
})
