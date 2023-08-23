import { Dialog } from "../ui/dialog";
import { Menu, MenuItem } from "../ui/menu";
import { db } from "./db";
import { history } from "./page";
import { settings } from "./settings";

const separator: MenuItem = { type: 'separator' };
const tryLuck: MenuItem = {
  type: 'item',
  name: '<ui-lang>user_menu.try_luck</ui-lang>',
  icon: 'EmojiTabSmilesAnimals',
  action: ()=>{
    let bangumis = Object.keys(db.items);
    history.open('bangumi', bangumis[~~(Math.random() * bangumis.length)]);
  },
};
const editBangumi: MenuItem = {
  type: 'item',
  name: '<ui-lang>user_menu.edit_bangumi</ui-lang>',
  icon: 'Add',
  action: ()=>{
    history.open('edit');
  },
};
const editThisBangumi: MenuItem = {
  type: 'item',
  name: '<ui-lang>user_menu.edit_this_bangumi</ui-lang>',
  icon: 'Edit',
  action: ()=>{
    history.open('edit', history.now.option);
  },
};
const removeThisBangumi: MenuItem = {
  type: 'item',
  name: '<ui-lang>user_menu.del_this_bangumi</ui-lang>',
  icon: 'Delete',
  action: ()=>{
    if (!db.items[history.now.option]) return;
    let content = document.createElement('ui-lang');
    content.innerHTML = 'user_menu.confirm_delete_detail';
    let dialog = new Dialog({
      title: `<ui-lang>user_menu.confirm_delete_before</ui-lang>${db.items[history.now.option].title}<ui-lang>user_menu.confirm_delete_after</ui-lang>`,
      content,
      buttons: [
        {
          text: '<ui-lang>dialog.confirm</ui-lang>',
          action: ()=>{
            db.items[history.now.option].remove();
            history.back();
            dialog.close();
          },
          level: 'danger',
        },
        {
          text: '<ui-lang>dialog.cancel</ui-lang>',
          action: ()=>{
            dialog.close();
          },
        },
      ],
    });
    dialog.show();
  },
};
const openSettings: MenuItem = {
  type: 'item',
  name: '<ui-lang>user_menu.settings</ui-lang>',
  icon: 'Settings',
  action: ()=>{
    history.open('settings');
  },
};

export async function initUserMenu() {
  document.querySelector('.user')?.addEventListener('click',()=>{
    let menu = new Menu([tryLuck, separator, editBangumi, ...(history.now.page._options.name === 'bangumi' ? [separator, editThisBangumi, removeThisBangumi] : []), separator, openSettings]);
    menu.show((document.querySelector('.user')?.getBoundingClientRect() as DOMRect));
  });
  (document.querySelector('.user-avatar') as HTMLImageElement).src = settings.getAvatar();
}
