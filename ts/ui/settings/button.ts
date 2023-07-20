import { SettingItem } from "../settings";

type ButtonOption = {
  key: string
  content: string,
  handler: (key: string, buttonKey: string, event: MouseEvent)=>void,
  disabled?: boolean,
};
export type Options = {
  key: string,
  icon?: string,
  name: string,
  description?: string,
  classList?: string[],
  items: ButtonOption[],
};
export class ButtonSettings{
  private _options: Options;
  item: SettingItem;
  constructor(options: Options) {
    this._options = Object.assign(options);
    this.item = new SettingItem(this._options);
    this.items = this._options.items;
  }
  get buttons() {
    return Array.from(this.item.head.children);
  }
  set items(items: ButtonOption[]) {
    this.item.head.innerHTML = '';
    for (const item of items) {
      let btn = document.createElement('button');
      btn.innerHTML = item.content;
      btn.disabled = !!item.disabled;
      btn.addEventListener('click',(ev)=>item.handler(this._options.key, item.key, ev));
      this.item.head.append(btn);
    }
  }
};
