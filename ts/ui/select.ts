import { layout } from "../helper/layout";

export class UISelect extends HTMLElement{
  private _inited: boolean = false;
  private _value: any;
  private _values: Map<any, string> = new Map();
  private _placeholder: string = '';
  private _current!: HTMLDivElement;
  // private _container!: HTMLDivElement;
  private _list!: HTMLDivElement;
  constructor() {
    super();
  }
  connectedCallback() {
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/select');
    this._current = (document.querySelector('.ui-select-name') as HTMLDivElement);
    // this._container = (document.querySelector('.ui-select-container') as HTMLDivElement);
    this._list = (document.querySelector('.ui-select-list') as HTMLDivElement);
    (document.querySelector('.ui-select') as HTMLDivElement).addEventListener('click',()=>{
      if (this._values.size === 0) return;
      // 确定简单位置
      // Determine the simple location
      let rect = this.getBoundingClientRect();
      let x = rect.left;
      let y = rect.top;
      let h = 12 + 32 * this._values.size + 4 * (this._values.size - 1); // 高度 height
      let index = Array.from(this._list.children).findIndex((el)=>(el as any).key === this._value);
      if (index === -1) {
        index = Math.floor(this._values.size / 2);
      }
      let o = 6 + 36 * index; // 偏移 offset
      let realH = Math.min(h, window.innerHeight - 100);
      // let realY = y - o;
      // 高度过高时滚动到目标
      // Scroll to target when too height
      if (h > window.innerHeight - 100) {
        if (o <= y - 50) {
          this._list.scroll(0,0);
        } else {
          this._list.scroll(0, o - y + 50);
        }
        o = y - 50;
      }
      // 接触上下边缘时平移
      // Panning when touching top and bottom edges
      if ((y - o) + realH > window.innerHeight) {
        o = realH - window.innerHeight + y;
        y = window.innerHeight - realH + o;
      }
      if (y - o < 50) {
        o = realH - (realH - y + 50);
        y = 50 + o;
      }
      // 设置位置
      // Setting position
      this.style.setProperty('--x', x + 'px');
      this.style.setProperty('--y', y + 'px');
      this.style.setProperty('--h', h + 'px');
      this.style.setProperty('--o', o + 'px');
      this.classList.add('ui-select-show');
    });
    (document.querySelector('.ui-select-hider') as HTMLDivElement).addEventListener('click',()=>{
      this.classList.remove('ui-select-show');
    });
  }
  disconnectedCallback() {}
  get value(): any {
    return this._value;
  }
  set value(value: any) {
    if (!this._values.has(value)) {
      this._current.innerHTML = this._placeholder;
      this._value = undefined;
      return;
    };
    this._value = value;
    if (!this._inited) return;
    this._current.innerHTML = (this._values.get(this._value) as string);
    this._list.querySelectorAll('.ui-select-current').forEach((el)=>el.classList.remove('ui-select-current'));
    for (const item of Array.from(this._list.children)) {
      if ((item as any).key !== this._value) continue;
      setTimeout(()=>item.classList.add('ui-select-current'), 100);
      break;
    }
  }
  get values(): Map<any, string> {
    return this._values;
  }
  set values(value: Map<any, string>) {
    if (typeof value !== 'object' || !(value instanceof Map)) return;
    this._values = value;
    if (!this._inited) return;
    this._list.innerHTML = '';
    this._values.forEach((value, key)=>{
      let item = document.createElement('div');
      item.classList.add('ui-select-item');
      (item as any).key = key;
      item.innerHTML = value;
      item.addEventListener('click',()=>{
        this.value = key;
        this.classList.remove('ui-select-show');
      });
      this._list.append(item);
    });
    this.value = this._value;
  }
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(value: string) {
    if (typeof value !== 'string') return;
    this._placeholder = value;
    this.value = this._value;
  }
}
