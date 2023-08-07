import { locale } from "./locale";
import pageHome from "./page/home";
import pageEdit from "./page/edit";
import pageSettings from "./page/settings";
import pageItem from "./page/item";
import { layout } from "../helper/layout";

type PageHandler = (element: HTMLElement, option: any)=>any;
export type PageOptions = {
  name: string,
  single?: false,
  onCreate: PageHandler,
  onBack: PageHandler,
  onClose: Function,
  pugOption?: any,
};
export type SinglePageOptions = {
  name: string,
  single: true,
  onCreate: PageHandler,
  onOpen: PageHandler,
  onBack: PageHandler,
  pugOption?: any,
};
let pageTemplate: {
  [name: string]: PageOptions | SinglePageOptions,
} = {
  home: pageHome,
  edit: pageEdit,
  settings: pageSettings,
  item: pageItem,
};
export class Page{
  _options: PageOptions | SinglePageOptions;
  _element: HTMLDivElement;
  constructor(options: PageOptions | SinglePageOptions, pugOption?: any) {
    this._options = options;
    this._element = document.createElement('div');
    this._element.classList.add('page-' + options.name);
    this._element.innerHTML = layout('page/' + options.name, Object.assign({ lang: locale }, Object.assign(options.pugOption, { option: pugOption })));
  }
  show(container: HTMLDivElement){
    container.querySelectorAll('.page-current').forEach((e)=>e.classList.remove('page-current'));
    setTimeout(() => {
      this._element.classList.add('page-current');
    }, 100);
  }
  remove(){
    this._element.classList.remove('page-current');
    setTimeout(()=>this._element.remove(), 100);
  }
};
export class History{
  cache: {[name: string]: Page} = {};
  stack: {page: Page, option: any}[] = [];
  private _container!: HTMLDivElement;
  init(){
    this._container = (document.querySelector('.page') as HTMLDivElement);
    this.open('home');
  };
  handler!: (self: History, event: string)=>void;
  open(name: string, option?: any){
    if (!(name in pageTemplate)) throw new Error(`Page '${name}' does not registered.`);
    let page = this.cache[name];
    if (!page) {
      page = new Page(pageTemplate[name]);
    }
    this.stack.push({page, option});
    if (!page._options.single) {
      this._container.append(page._element);
    }
    if (!(name in this.cache)) {
      page._options.onCreate(page._element, option);
    }
    if (page._options.single) {
      page._options.onOpen(page._element, option);
      this.cache[name] = page;
    }
    this._container.append(page._element);
    this.handler(this, 'open');
    page.show(this._container);
  };
  home(){
    for (let i = this.stack.length - 1; i > 0; i--) {
      if (!this.stack[i].page._options.single) {
        (this.stack[i].page._options as PageOptions).onClose();
        this.stack[i].page.remove();
      }
      this.stack.pop();
    }
    this.handler(this, 'home');
    this.stack[0].page.show(this._container);
  };
  back(){
    if (this.stack.length === 1) return;
    let last = this.stack.pop();
    if (!last?.page._options.single) {
      (last?.page._options as PageOptions).onClose();
      last?.page.remove();
    }
    let now = this.stack[this.stack.length - 1];
    now.page._options.onBack(now.page._element, now.option);
    now.page.show(this._container);
    this.handler(this, 'back');
  };
};

export let history = new History();

export function initPage() {
  history.handler = function(self, event) {
    document.body.classList.toggle('backable', self.stack.length > 1);
    document.body.classList.toggle('homeable', self.stack.length > 2);
  }
  document.querySelector('.history-back')?.addEventListener('click',()=>history.back());
  document.querySelector('.history-home')?.addEventListener('click',()=>history.home());
  window.addEventListener('mousedown', ({button})=>{
    if (button === 3) history.back();
  });
  history.init();
}
