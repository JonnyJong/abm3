import { UIText } from "./text";

export class UITags extends HTMLElement{
  private _inited: boolean = false;
  private _container: HTMLDivElement;
  private _input: UIText;
  private _values: Map<string, HTMLDivElement> = new Map();
  constructor() {
    super();
    this._container = document.createElement('div');
    this._container.classList.add('ui-tags-container');
    this._input = (document.createElement('ui-text') as UIText);
    this._input.classList.add('ui-tags-input');
  }
  autoComplete?: (value: string)=>string[];
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    this.append(this._container, this._input);
    this._input.buttonsLeft = [{
      icon: 'Add',
      tooltipLocaleKey: 'tags.add',
      action: ()=>{
        this.add(this._input.value);
        this._input.value = '';
      },
    }];
    this._input.buttonsRight = [{
      icon: 'Clear',
      tooltipLocaleKey: 'text.clear',
      clear: true,
    }];
    this._input.addEventListener('keydown', ({key})=>{
      if (key !== 'Enter' || this._input.value === '') return;
      this.add(this._input.value);
      this._input.value = '';
    });
    this._input.addEventListener('input',()=>{
      if (this._input.value === '') {
        this._input.list = [];
        return;
      }
      if (typeof this.autoComplete !== 'function') return;
      let originList = this.autoComplete(this._input.value);
      let list: {autoComplete: string}[] = [];
      originList.forEach((v)=>{
        if (this._values.has(v)) return;
        list.push({
          autoComplete: v,
        });
      });
      this._input.list = list;
    });
  }
  add(value: string) {
    if (this._values.has(value)) return;
    let div = document.createElement('div');
    div.innerHTML = value;
    div.addEventListener('click',()=>this.delete(value));
    this._values.set(value, div);
    this._container.append(div);
  }
  delete(value: string) {
    if (!this._values.has(value)) return;
    this._values.get(value)?.remove();
    this._values.delete(value);
  }
  get value(): string[] {
    return Array.from(this._values.keys());
  }
  set value(values: string[]) {
    if (!Array.isArray(values)) return;
    this._container.innerHTML = '';
    this._values.clear();
    values.forEach((v)=>this.add(v));
  }
}
