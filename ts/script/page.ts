import { statSync } from "fs";
import path from "path";
import pug from "pug";
import { locale } from "./locale";
import pageHome from "./page/home";

const PageTemplate: { [x: string]: PageOption } = {
  home: pageHome,
};

export type PageOption = {
  handler?: (page: Page, data?: any)=>void | Promise<void>,
  pugOption?: any,
  only?: boolean,
};
export class Page{
  element: HTMLDivElement;
  onShow: ((page: Page)=>void) | undefined;
  handler: ((page: Page, data?: any) => void | Promise<void>) | undefined;
  layout: string;
  constructor(layout: string, options: PageOption, data?: any){
    if ('current' === layout) {
      throw new Error(`Can not use 'home' layout.`);
    }
    this.layout = layout;
    let layoutPath = path.join(process.cwd(), 'layout/page', layout + '.pug');
    let stat = statSync(layoutPath);
    if (!stat.isFile()) throw new Error(`Can not find '${layout}' layout.`);
    this.element = document.createElement('div');
    this.element.classList.add(`page-${layout}`);
    this.element.innerHTML = pug.renderFile(layoutPath, Object.assign({ lang: locale }, options.pugOption));
    document.querySelector('.page')?.append(this.element);
    if (typeof options.handler === 'function') {
      this.handler = options.handler;
      options.handler(this, data);
    }
  }
  show(scroll?: number){
    let current = document.querySelector('.page-current');
    if (current) {
      current.classList.remove('page-current');
      return new Promise<void>((resolve)=>{
        setTimeout(() => {
          if (typeof scroll === 'number') {
            this.element.scrollTop = scroll;
          }
          this.element.classList.add('page-current');
          if (typeof this.onShow === 'function') this.onShow(this);
          resolve();
        }, 100);
      });
    }
    return new Promise<void>((resolve)=>{
      if (typeof scroll === 'number') {
        this.element.scrollTop = scroll;
      }
      this.element.classList.add('page-current');
      if (typeof this.onShow === 'function') this.onShow(this);
      resolve();
    });
  }
  remove(){
    return new Promise<void>((resolve)=>{
      this.element.classList.remove('page-current');
      setTimeout(() => {
        this.element.remove();
        resolve();
      }, 100);
    });
  }
}

export class History{
  stack: Array<{page: Page, data: any, scroll: number}> = [];
  now: { page: Page; data: any; scroll: number; };
  _onlys: {
    [x: string]: Page
  } = {};
  handler: (history: History) => void;
  constructor(handler: (history: History)=>void){
    this.handler = handler;
    this.now = {
      page: new Page('home', PageTemplate.home),
      data: undefined,
      scroll: 0,
    };
    this._onlys.home = this.now.page;
  }
  async open(layout: string, data?: any): Promise<void | Page> {
    if (!PageTemplate[layout]) return;
    this.now.scroll = this.now.page.element.scrollTop;
    this.stack.push(this.now);
    if (PageTemplate[layout].only && this._onlys[layout]) {
      this.now = {
        page: this._onlys[layout],
        data,
        scroll: 0,
      };
    }else{
      this.now = {
        page: new Page(layout, PageTemplate[layout], data),
        data: data,
        scroll: 0,
      };
      if (PageTemplate[layout].only) {
        this._onlys[layout] = this.now.page;
      }
    }
    if (typeof PageTemplate[layout].handler === 'function') {
      // @ts-ignore
      await PageTemplate[layout].handler(this.now.page, data);
    }
    this.now.page.show(0);
    this.handler(this);
    return this.now.page;
  }
  async back(){
    let prev = this.stack.pop();
    if (!prev) return;
    if (this._onlys[prev.page.layout] && typeof prev.page.handler === 'function') {
      await prev.page.handler(prev.page, prev.page);
    }
    await prev.page.show(prev.scroll);
    if (!this._onlys[this.now.page.layout]) {
      this.now.page.remove();
    }
    this.now = prev;
    this.handler(this);
  }
  async home(){
    if (this.stack.length === 0) return;
    this.stack.push(this.now);
    this.now = this.stack[0];
    this.now.scroll = 0;
    this.now.page.show(0);
    this.stack.forEach(({page})=>{
      if (this._onlys[page.layout]) return;
      page.remove();
    });
    this.stack = [];
    this.handler(this);
  }
}

export let history: History;

export function initPage() {
  history = new History((history)=>{
    document.body.classList.remove('backable', 'homeable');
    if (history.stack.length > 0) {
      document.body.classList.add('backable');
    }
    if (history.stack.length > 1) {
      document.body.classList.add('homeable');
    }
  });
  document.querySelector('.history-back')?.addEventListener('click',()=>history.back());
  document.querySelector('.history-home')?.addEventListener('click',()=>history.home());
  window.addEventListener('mousedown', ({button})=>{
    if (button === 3) history.back();
  });
}
