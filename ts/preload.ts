import { timer } from "./helper/timer";
import { initConfig } from "./modules/config";
import { initDB } from "./script/db";
import { updateLocale } from "./script/locale";
import { initPage } from "./script/page";
import { initSearchbar } from "./script/searchbar";
import { settings } from "./script/settings";
import { initUserMenu } from "./script/user-menu";
import { initWindowEvent } from "./script/window-event";
import { initUI } from "./ui/main";

console.time('ready');
document.addEventListener('DOMContentLoaded',async ()=>{
  initWindowEvent();

  await initConfig();

  console.time('settings');
  await settings.init();
  console.timeEnd('settings');

  console.time('locale');
  await updateLocale(settings.getLocale());
  console.timeEnd('locale');
  initUI();

  console.time('page');
  initPage();
  console.timeEnd('page');

  initUserMenu();

  initSearchbar();
  
  console.timeEnd('ready');
  document.body.classList.remove('loading');
  
  await timer(1);
  initDB();
});

// DEV
window.addEventListener('keypress',({key})=> key === "\u0012" ? location.reload() : '');
