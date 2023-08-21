import { equal } from "../helper/equal";
import { layout } from "../helper/layout";

let groups: {[key: string]: Set<UISelect>} = {};

export class UISelect extends HTMLElement{
  private _inited: boolean = false;
  private _value: any;
  private _values: {name: string, value: any}[] = [];
  private _placeholder: string = '';
  private _current!: HTMLDivElement;
  private _list: HTMLDivElement = document.createElement('div');
  private _container: HTMLDivElement = document.createElement('div');
  private _hider: HTMLDivElement = document.createElement('div');
  private _group: string = '';
  constructor() {
    super();
    this._container.classList.add('ui-select-container');
    this._list.classList.add('ui-select-list');
    this._container.append(this._list);
    this._hider.classList.add('ui-select-hider');
  }
  connectedCallback() {
    document.body.append(this._hider, this._container);
    if (this._group !== '') {
      if (!groups[this._group]) {
        groups[this._group] = new Set();
      }
      groups[this._group].add(this);
    }
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/select');
    this._current = this.querySelector('.ui-select-name') as HTMLDivElement;
    (this.querySelector('.ui-select') as HTMLDivElement).addEventListener('click',()=>{
      if (this._values.length === 0) return;
      // 确定简单位置
      // Determine the simple location
      let rect = this.getBoundingClientRect();
      let x = rect.left;
      let y = rect.top;
      let h = 12 + 32 * this._values.length + 4 * (this._values.length - 1); // 高度 height
      let w = rect.width;
      let index = Array.from(this._list.children).findIndex((el)=>(el as any).key === this._value);
      if (index === -1) {
        index = Math.floor(Math.min(this._values.length / 2, (window.innerHeight - 62) / 72 - 2));
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
      this._container.style.setProperty('--x', x + 'px');
      this._container.style.setProperty('--y', y + 'px');
      this._container.style.setProperty('--h', h + 'px');
      this._container.style.setProperty('--w', w + 'px');
      this._container.style.setProperty('--o', o + 'px');
      this._show(true);
    });
    this._hider.addEventListener('click',()=>{
      this._show(false);
    });
    this.values = this._values;
  }
  disconnectedCallback() {
    this._container.remove();
    this._hider.remove();
    if (this._group !== '') {
      groups[this._group].delete(this);
    }
  }
  private _setList() {
    this._list.innerHTML = '';
    this._values.forEach(({name, value})=>{
      if (this._group !== '' && !equal(value, this._value) && groups[this._group] && Array.from(groups[this._group]).find((item)=>equal(item._value, value))) return;
      let item = document.createElement('div');
      item.classList.add('ui-select-item');
      item.innerHTML = name;
      (item as any).key = value;
      item.addEventListener('click', ()=>{
        this.value = value;
        this._show(false);
      });
      this._list.append(item);
    });
  }
  private _show(show: boolean) {
    this._setList();
    this._container.classList.toggle('ui-select-show', show);
    this._hider.classList.toggle('ui-select-show', show);
  }
  get value(): any {
    return this._value;
  }
  set value(value: any) {
    let index = this._values.findIndex((item)=>equal(item.value, value));
    if (index === -1) {
      this._value = undefined;
      if (!this._inited) return;
      this._current.innerHTML = this._placeholder;
      this._current.classList.add('ui-select-placeholder');
      return;
    };
    this._value = value;
    if (!this._inited) return;
    this._current.innerHTML = this._values[index].name;
    this._current.classList.remove('ui-select-placeholder');
    this._list.querySelectorAll('.ui-select-current').forEach((el)=>el.classList.remove('ui-select-current'));
    for (const item of Array.from(this._list.children)) {
      if ((item as any).key !== this._value) continue;
      setTimeout(()=>item.classList.add('ui-select-current'), 100);
      break;
    }
  }
  get values(): {name: string, value: any}[] {
    return this._values;
  }
  set values(value: {name: string, value: any}[]) {
    if (!Array.isArray(value)) return;
    this._values = value;
    if (!this._inited) return;
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
  get group(): string {
    return this._group;
  }
  set group(value: string) {
    if (typeof value !== 'string') return;
    if (this._group !== '') {
      groups[this._group].delete(this);
    }
    this._group = value;
    if (this._group === '') return;
    if (!groups[this._group]) {
      groups[this._group] = new Set();
    }
    groups[this._group].add(this);
  }
}
