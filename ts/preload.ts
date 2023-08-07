import Config, { initConfig } from "./modules/config";
import { updateLocale } from "./script/locale";
import { initPage } from "./script/page";
import { initSearchbar } from "./script/searchbar";
import { initUserMenu } from "./script/user-menu";
import { initWindowEvent } from "./script/window-event";
import { initUI } from "./ui/main";

let config = new Config('config');

let db: Config;

document.addEventListener('DOMContentLoaded',async ()=>{
  initWindowEvent();

  await initConfig();

  await config.load();
  await updateLocale(config.store.locale);
  db = new Config('db');
  await db.load();
  initUI();

  initPage();

  initUserMenu();

  initSearchbar();
  
  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 200);
});

window.addEventListener('keypress',({key})=> key === "\u0012" ? location.reload() : '');
