import Config from "./modules/config";
import { updateLocale, locale } from "./script/locale";
import { initWindowEvent } from "./script/window-event";
import { initUI } from "./ui/main";


let config = new Config('config');

document.addEventListener('DOMContentLoaded',async ()=>{
  initWindowEvent();

  await config.load();
  await updateLocale(config.store.locale);
  initUI();

  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 200);
});
