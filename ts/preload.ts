import Config, { getDefaultConfigDir, initConfig } from "./modules/config";
import { initDB } from "./script/db";
import { updateLocale } from "./script/locale";
import { initPage } from "./script/page";
import { initSearchbar } from "./script/searchbar";
import { initUserMenu } from "./script/user-menu";
import { initWindowEvent } from "./script/window-event";
import { initUI } from "./ui/main";

let config = new Config('config');

document.addEventListener('DOMContentLoaded',async ()=>{
  initWindowEvent();

  await initConfig();

  await config.load();
  await initDB(config.store.db ? config.store.db : getDefaultConfigDir());

  await updateLocale(config.store.locale);
  initUI();

  initPage();

  initUserMenu();

  initSearchbar();
  
  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 200);
});

// DEV
window.addEventListener('keypress',({key})=> key === "\u0012" ? location.reload() : '');
