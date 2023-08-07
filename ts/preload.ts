import Config, { initConfig } from "./modules/config";
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
  await updateLocale(config.store.locale);
  initUI();

  initPage();

  initUserMenu();

  initSearchbar();
  
  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 200);
});
