import { Menu } from "../ui/menu";
import { locale } from "./locale";

export function initUserMenu() {
  document.querySelector('.user')?.addEventListener('click',()=>{
    let menu = new Menu([
      {
        name: locale.user_menu.try_luck,
        icon: 'EmojiTabSmilesAnimals',
      },
      {
        separator: true,
      },
      {
        name: locale.user_menu.add_bangumi,
        icon: 'Add',
      },
      {
        separator: true,
      },
      {
        name: locale.user_menu.settings,
        icon: 'Settings',
        action: ()=>{
          menu.hide();
        },
      },
    ]);
    menu.onhided = ()=>{
      menu.remove();
    };
    let rect = document.querySelector('.user')?.getBoundingClientRect();
    menu.show(rect?.bottom, window.innerWidth, rect?.right);
  });
}
