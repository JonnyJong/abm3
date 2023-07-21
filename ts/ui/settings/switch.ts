import { SettingItem } from "../settings";
import { UISwitch } from "../switch";

export type Options = {
  key: string,
  default: boolean,
  icon?: string,
  name: string,
  description?: string,
  handler?: (input: boolean, key: string)=>void,
  classList?: string[],
  disabled?: boolean,
};
export class SwitchSetting{
  private _options: Options;
  item: SettingItem;
  switcher: UISwitch;
  constructor(options: Options) {
    this._options = Object.assign(options);
    this.item = new SettingItem(options);
    this.switcher = (document.createElement('ui-switch') as UISwitch);
    this.item.head.append(this.switcher);
    this.switcher.value = this._options.default;
    if (typeof this._options.handler !== 'function') return;
    this.switcher.addEventListener('change',()=>(this._options.handler as Function)(this.switcher.value, this._options.key));
  }
  get value(): boolean{
    return this.switcher.value;
  }
  set value(value: boolean){
    this.switcher.value = value;
  }
  get key(): string {
    return this._options.key;
  }
  set key(value: string) {
    if (typeof value !== 'string') return;
    this._options.key = value;
  }
  get disabled(): boolean{
    return this.switcher.disabled;
  }
  set disabled(value: boolean) {
    this.switcher.disabled = value;
  }
}
