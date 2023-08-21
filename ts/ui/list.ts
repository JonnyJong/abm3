import { VDOM } from "./vdom";

export class UIList extends HTMLElement{
  private _inited: boolean = false;
  private _inline: boolean = true;
  private _template!: VDOM;
  private _container: HTMLDivElement;
  private _adder: HTMLButtonElement;
  constructor(){
    super();
    this._container = document.createElement('div');
    this._container.classList.add('ui-list-container');
    this._adder = document.createElement('button');
    this._adder.classList.add('ui-list-add');
    this._adder.innerHTML = '<div class="icon icon-Add"></div>';
    this._adder.addEventListener('click',()=>this._add());
  }
  connectedCallback(){
    if (this._inited) return;
    this._inited = true;
    this.append(this._container, this._adder);
    this.classList.toggle('ui-list-inline', this._inline);
  }
  get inline(): boolean{
    return this._inline;
  }
  set inline(value: boolean) {
    this._inline = !!value;
    this.classList.toggle('ui-list-inline', this._inline);
  }
  get value() {
    let value: any[] = [];
    for (const item of this._container.children) {
      value.push(((item as any).vdom as VDOM).data);
    }
    return value;
  }
  set value(value: any[]) {
    this._container.innerHTML = '';
    if (!this._template) return;
    value.forEach((v)=>this._add(v));
  }
  get template(): VDOM {
    return this._template;
  }
  set template(value: VDOM) {
    if (!(value instanceof VDOM)) throw new Error(`List's template require a vdom`);
    this._template = value;
    this.value = this.value;
  }
  private _add(v?: any){
    if (!this._template) return;
    let vdom = this._template.clone(true);
    if (v !== undefined) {
      vdom.data = v;
    }
    let item = document.createElement('div');
    item.classList.add('ui-list-item')
    let sorter = document.createElement('div');
    sorter.classList.add('ui-list-item-sort');
    let up = document.createElement('button');
    up.classList.add('ui-list-item-sort-up');
    up.innerHTML = '<div class="icon icon-ChevronUp"></div>';
    let down = document.createElement('button');
    down.classList.add('ui-list-item-sort-down');
    down.innerHTML = '<div class="icon icon-ChevronDown"></div>';
    sorter.append(up, down);
    vdom.classList.add('ui-list-item-content');
    let remover = document.createElement('button');
    remover.classList.add('ui-list-item-remove');
    remover.innerHTML = '<div class="icon icon-Remove"></div>';
    item.append(sorter, vdom._element, remover);
    this._container.append(item);
    up.addEventListener('click',()=>{
      (item.previousSibling as HTMLDivElement).before(item);
    });
    down.addEventListener('click',()=>{
      (item.nextSibling as HTMLDivElement).after(item);
    });
    remover.addEventListener('click',()=>{
      item.remove();
    });
  }
}
