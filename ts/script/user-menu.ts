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
    let rect: DOMRect = (document.querySelector('.user')?.getBoundingClientRect() as DOMRect);
    menu.show(rect.bottom + 4, window.innerWidth, rect.right);
  });
}
