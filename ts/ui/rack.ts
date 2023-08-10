import { db } from "../script/db";
import { layout } from "../helper/layout";
import { UISelect } from "./select";
import { Dialog } from "./dialog";
import { UIBangumi } from "./bangumi";

type RackType = {type: 'none' | 'all' | 'category' | 'tag' | 'custom', value: string};

const ItemWidth = 276;
const ItemHeight = 428;

function getRackTypeList(current: RackType): {name: string, value: RackType}[] {
  let list: {name: string, value: RackType}[] = [
    {name: '<ui-lang>rack.all_bangumi</ui-lang>', value: {type: 'all', value: ''}},
  ];
  for (const name in db.categories) {
    if (!Object.prototype.hasOwnProperty.call(db.categories, name)) continue;
    list.push({name: '<ui-lang>rack.category</ui-lang>' + name, value: {type: 'category', value: name}});
  }
  for (const name in db.tags) {
    if (!Object.prototype.hasOwnProperty.call(db.tags, name)) continue;
    list.push({name: '<ui-lang>rack.tag</ui-lang>' + name, value: {type: 'tag', value: name}});
  }
  switch (current.type) {
    case 'all':
      list[0].value = current;
      break;
    case 'category':
    case 'tag':
      let target = list.find((item)=>item.value.type === current.type && item.value.value === current.value);
      if (!target) break;
      target.value = current;
  }
  return list;
}

export class UIRack extends HTMLElement{
  private _inited: boolean = false;
  private _type: RackType = {type: 'none', value: ''};
  private _title!: HTMLDivElement;
  private _body!: HTMLDivElement;
  private _btnEdit!: HTMLButtonElement;
  private _btnExpand!: HTMLButtonElement;
  private _list: string[] = [];
  connectedCallback() {
    window.addEventListener('resize', this._resizeHandler);
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/rack');
    this._title = (this.querySelector('.rack-title') as HTMLDivElement);
    this._body = (this.querySelector('.rack-body') as HTMLDivElement);
    this._btnEdit = (this.querySelector('.rack-edit') as HTMLButtonElement);
    this._btnExpand = (this.querySelector('.rack-expand') as HTMLButtonElement);
    this._btnEdit.addEventListener('click',()=>{
      let selecter = (document.createElement('ui-select') as UISelect);
      selecter.classList.add('rack-edit-select');
      selecter.values = getRackTypeList(this._type);
      selecter.placeholder = '<ui-lang>rack.select_type</ui-lang>';
      selecter.value = this._type;
      
      let dialog = new Dialog({
        title: '<ui-lang>rack.edit_rack</ui-lang>',
        content: selecter,
        buttons: [
          {
            text: '<ui-lang>dialog.confirm</ui-lang>',
            action: ()=>{
              this.type = selecter.value;
              dialog.close();
            },
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
    });
    this._btnExpand.addEventListener('click',()=>{
      let folded = this.classList.toggle('rack-fold');
      this.classList.toggle('rack-folded', folded && this._list.length > 0);
    });
    this._resizeHandler();
  }
  disconnectedCallback() {
    window.removeEventListener('resize', this._resizeHandler);
  }
  private _resizeHandler = ()=>{
    let width = this.getBoundingClientRect().width;
    let countInLine = Math.floor(width / ItemWidth);
    let offsetLeft = (width - countInLine * ItemWidth) / (countInLine + 1);
    let count = 0;
    let line = 0;
    for (const item of (this._body.children as unknown as HTMLElement[])) {
      item.style.left = count * ItemWidth + (count + 1) * offsetLeft + 'px';
      item.style.top = line * ItemHeight + 'px';
      (item as any).line = line * ItemHeight;
      count++;
      if (count >= countInLine) {
        count = 0;
        line++;
      }
    }
    this._body.style.setProperty('--height', Math.ceil(this._list.length / countInLine) * ItemHeight + 'px');
    this.vListHandler();
  }
  get title() {
    return (this._title.textContent as string);
  }
  set title(title: string) {
    if (this._type.type !== 'custom') return;
    this._title.textContent = String(title);
  }
  get type() {
    return {type: this._type.type, value: this._type.value};
  }
  set type(value: RackType) {
    this._type = value;
    this.update();
  }
  get list() {
    return this._list;
  }
  set list(value: string[]){
    if (this._type.type !== 'custom') return;
    this._list = value;
    this._renderList();
  }
  vListHandler() {
    let rect = this.getBoundingClientRect();
    let startH = Math.max(-rect.top, 0) - ItemHeight;
    let endH = window.innerHeight - rect.top;
    for (const item of (this._body.children as unknown as HTMLElement[])) {
      if ((item as any).line >= startH && (item as any).line <= endH) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    }
  }
  update() {
    switch (this._type.type) {
      case "none":
      case "custom":
        this._title.innerHTML = '';
        this._list = [];
        break;
      case "all":
        this._title.innerHTML = '<ui-lang>rack.all_bangumi</ui-lang>';
        this._list = Object.keys(db.items);
        break;
      case "category":
        this._title.innerHTML = '<ui-lang>rack.category</ui-lang>' + this._type.value;
        this._list = Array.from(db.categories[this._type.value]);
        break;
      case "tag":
        this._title.innerHTML = '<ui-lang>rack.tag</ui-lang>' + this._type.value;
        this._list = Array.from(db.tags[this._type.value]);
        break;
    }
    this._renderList();
  }
  private _renderList() {
    this._body.innerHTML = '';
    for (const item of this._list) {
      let element = (document.createElement('ui-bangumi') as UIBangumi);
      element.id = item;
      this._body.append(element);
    }
    this._resizeHandler();
  }
}
