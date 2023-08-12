import { locale } from "./locale";
import pageHome from "./page/home";
import pageEdit from "./page/edit";
import pageSettings from "./page/settings";
import pageBangumi from "./page/bangumi";
import { layout } from "../helper/layout";
import { timer } from "../helper/timer";

type PageHandler = (element: HTMLElement, option: any, page: Page)=>any;
export type PageOptions = {
  name: string,
  single?: false,
  onCreate: PageHandler,
  onBack: PageHandler,
  onClose: (page: Page)=>any,
  layoutHandler?: (option: any, page: Page)=>any,
};
export type SinglePageOptions = {
  name: string,
  single: true,
  onCreate: PageHandler,
  onOpen: PageHandler,
  onBack: PageHandler,
  layoutHandler?: (option: any, page: Page)=>any,
};
const VListElementTag = ['ui-rack'];
let pageTemplate: {
  [name: string]: PageOptions | SinglePageOptions,
} = {
  home: pageHome,
  edit: pageEdit,
  settings: pageSettings,
  bangumi: pageBangumi,
};
export class Page{
  _options: PageOptions | SinglePageOptions;
  _element: HTMLDivElement;
  constructor(options: PageOptions | SinglePageOptions, option?: any) {
    this._options = options;
    this._element = document.createElement('div');
    this._element.classList.add('page-' + options.name);
    this._element.innerHTML = layout('page/' + options.name, Object.assign({ lang: locale }, (typeof this._options.layoutHandler === 'function' ? this._options.layoutHandler(option, this) : {})));
    this._element.addEventListener('scroll', ()=>{
      this._element.querySelectorAll(VListElementTag.join(',')).forEach((el)=>(el as any).vListHandler(this._element.scrollTop));
    });
  };
  async show(container: HTMLDivElement){
    container.querySelectorAll('.page-current').forEach((e)=>e.classList.remove('page-current'));
    await timer(100);
    this._element.classList.add('page-current');
  };
  async remove(){
    this._element.classList.remove('page-current');
    await timer(100);
    this._element.remove();
  };
  [x: string]: any;
};
export class History{
  cache: {[name: string]: Page} = {};
  stack: {page: Page, option: any}[] = [];
  private _container!: HTMLDivElement;
  get now() {
    return this.stack[this.stack.length - 1];
  }
  init(){
    this._container = document.querySelector('.page') as HTMLDivElement;
    this.open('home');
  };
  handler!: (self: History, event: string)=>void;
  open(name: string, option?: any){
    if (!(name in pageTemplate)) throw new Error(`Page '${name}' does not registered.`);
    let page = this.cache[name];
    if (!page) {
      page = new Page(pageTemplate[name], option);
    }
    this.stack.push({page, option});
    if (!page._options.single) {
      this._container.append(page._element);
    }
    if (!(name in this.cache)) {
      page._options.onCreate(page._element, option, page);
    }
    if (page._options.single) {
      page._options.onOpen(page._element, option, page);
      this.cache[name] = page;
    }
    this._container.append(page._element);
    this.handler(this, 'open');
    page.show(this._container);
  };
  home(){
    for (let i = this.stack.length - 1; i > 0; i--) {
      if (!this.stack[i].page._options.single) {
        (this.stack[i].page._options as PageOptions).onClose(this.stack[i].page);
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
      (last?.page._options as PageOptions).onClose((last as any).page);
      last?.page.remove();
    }
    let now = this.stack[this.stack.length - 1];
    now.page._options.onBack(now.page._element, now.option, now.page);
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
  document.body.addEventListener('keydown', (ev)=>{
    if (ev.code !== 'Space') return;
    if (['TEXTAREA', 'INPUT'].includes((ev.target as Element)?.nodeName)) return;
    ev.preventDefault();
  });
}
