import Config from "./modules/config";
import { updateLocale } from "./script/locale";
import { History } from "./script/page";
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

  let history = new History((history)=>{
    document.body.classList.remove('backable', 'homeable');
    if (history.stack.length > 0) {
      document.body.classList.add('backable');
    }
    if (history.stack.length > 1) {
      document.body.classList.add('homeable');
    }
  });
  document.querySelector('.history-back')?.addEventListener('click',()=>history.back());
  document.querySelector('.history-home')?.addEventListener('click',()=>history.home());
  window.addEventListener('mousedown', ({button})=>{
    if (button === 3) history.back();
  });
  // @ts-ignore
  window.H = history;

  setTimeout(() => {
    document.body.classList.remove('loading');
  }, 200);
});
