import Config from "./modules/config";
import { updateLocale } from "./script/locale";
import { initUserMenu } from "./script/user-menu";
import { initWindowEvent } from "./script/window-event";
import { initUI } from "./ui/main";

let config = new Config('config');

document.addEventListener('DOMContentLoaded',async ()=>{
  initWindowEvent();

  await config.load();
  await updateLocale(config.store.locale);
  initUI();

  initUserMenu();

  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 200);
});
