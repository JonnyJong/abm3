import { timer } from "./helper/timer";
import { initConfig } from "./modules/config";
import { initDB } from "./script/db";
import { updateLocale } from "./script/locale";
import { initPage } from "./script/page";
import { initSearchbar } from "./script/search";
import { settings } from "./script/settings";
import { initUserMenu } from "./script/user-menu";
import { initWindowEvent } from "./script/window-event";
import { initUI } from "./ui/main";

document.addEventListener('DOMContentLoaded',async ()=>{
  initWindowEvent();

  await initConfig();

  await settings.init();

  await updateLocale(settings.getLocale());
  initUI();

  initPage();

  initUserMenu();

  initSearchbar();
  
  document.body.classList.remove('loading');
  
  await timer(1);
  initDB();
});

// DEV
window.addEventListener('keypress',({key})=> key === "\u0012" ? location.reload() : '');
