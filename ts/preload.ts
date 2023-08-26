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

// DEV: Remove this when build release version
window.addEventListener('keypress',({key})=> key === "\u0012" ? location.reload() : '');
