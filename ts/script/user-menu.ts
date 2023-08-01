import { Menu } from "../ui/menu";
import { locale } from "./locale";
import { history } from "./page";

export function initUserMenu() {
  document.querySelector('.user')?.addEventListener('click',()=>{
    let menu = new Menu([
      {
        name: locale.user_menu.try_luck,
        icon: 'EmojiTabSmilesAnimals',
        action: ()=>{
          menu.hide();
        },
      },
      {
        separator: true,
      },
      {
        name: locale.user_menu.edit_bangumi,
        icon: 'Edit',
        shortcut: 'Ctrl+N', // TODO
        action: ()=>{
          history.open('edit');
          menu.hide();
        },
      },
      {
        separator: true,
      },
      {
        name: locale.user_menu.settings,
        icon: 'Settings',
        action: ()=>{
          history.open('settings');
          menu.hide();
        },
      },
    ]);
    menu.show((document.querySelector('.user')?.getBoundingClientRect() as DOMRect));
  });
}
