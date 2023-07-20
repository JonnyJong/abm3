import { SettingItem } from "../settings";
import { UIText } from "../text";

export type Options = {
  key: string,
  default: string,
  icon?: string,
  name: string,
  description?: string,
  multiLine?: boolean,
  autoComplete?: (input: string, key: string)=>string[],
  handler?: (input: string, key: string)=>void,
  reset?: boolean,
  confirm?: boolean,
  classList?: string[],
  disabled?: boolean,
};
export class TextSetting{
  private _options: Options;
  item: SettingItem;
  input: UIText | HTMLTextAreaElement;
  constructor(options: Options) {
    this._options = Object.assign(options);
    this.item = new SettingItem(options);
    this.item.element.classList.add('setting-text');
    if (this._options.multiLine) {
      this.input = document.createElement('textarea');
    } else {
      this.input = (document.createElement('ui-text') as UIText);
      if (typeof this._options.autoComplete === 'function') {
        this.input.addEventListener('input',()=>{
          let items = (this._options.autoComplete as Function)(this.input.value, this._options.key);
          let list: { autoComplete: string }[] = [];
          for (const item of items) {
            list.push({ autoComplete: item });
          }
          (this.input as UIText).list = list;
        });
      }
    }
    this.item.head.append(this.input);
    this.input.classList.add('setting-text-input');
    this.input.disabled = this._options.disabled;
    this.input.value = this._options.default;
    if (this._options.reset) {
      this.item.onReset = ()=>this.reset();
    }
    if (typeof this._options.handler !== 'function') return;
    if (this._options.confirm) {
      this.item.onConfirm = ()=>(this._options.handler as Function)(this.input.value, this._options.key);
    } else {
      this.input.addEventListener('input',()=>(this._options.handler as Function)(this.input.value, this._options.key));
    }
  }
  get value(): string{
    return this.input.value;
  }
  get default(): string{
    return this._options.default;
  }
  set default(value: string) {
    if (typeof value === 'string') {
      this._options.default = value;
    }
  }
  get disabled(): boolean{
    return this.input.disabled;
  }
  set disabled(value: boolean) {
    this.input.disabled = value;
  }
  reset(){
    this.input.value = this._options.default;
  }
}
