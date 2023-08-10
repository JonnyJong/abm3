import { db } from "../script/db";
import { layout } from "../helper/layout";
import path from "path";

export class UIBangumi extends HTMLElement{
  private _inited: boolean = false;
  private _id: string = '';
  private _img!: HTMLDivElement;
  private _title!: HTMLDivElement;
  private _eval!: HTMLDivElement;
  private _mark!: HTMLDivElement;
  constructor(){
    super();
    this.addEventListener('click', ()=>{
      if (this.id === '') return;
    });
  }
  connectedCallback(){
    if (this._inited) return;
    this._inited = true;
    this.innerHTML = layout('ui/bangumi');
    this.classList.add('ui-bangumi-loading');
    this._img = (document.querySelector('.ui-bangumi-cover') as HTMLDivElement);
    this._title = (document.querySelector('.ui-bangumi-title') as HTMLDivElement);
    this._eval = (document.querySelector('.ui-bangumi-evaluation') as HTMLDivElement);
    this._mark = (document.querySelector('.ui-bangumi-mark') as HTMLDivElement);
    this.update();
  }
  get id() {
    return this._id;
  }
  set id(id: string) {
    if (typeof id !== 'string') return;
    this._id = id;
    this.update();
  }
  update(){
    if (!this._inited) return;
    if (this._id === '') {
      this._img.innerHTML = '';
      this._title.innerHTML = '';
      this._eval.innerHTML = '';
      this._mark.innerHTML = '';
      this.classList.add('ui-bangumi-loading');
      this.inert = false;
      return;
    }
    let item = db.items[this._id];
    if (!item) {
      this._img.innerHTML = '<img src="../assets/defaultCover.png" draggable="false">';
      this._title.innerHTML = '<i>番剧不存在</i>';
      this._eval.innerHTML = '';
      this._mark.innerHTML = '';
      this.classList.remove('ui-bangumi-loading');
      this.inert = true;
      return;
    }
    let img = "../assets/defaultCover.png";
    for (const season of item.seasons) {
      if (!season.cover) continue;
      // TODO: get db path from setting
      img = path.join((process.env.HOME || process.env.USERPROFILE ) as string, '.jonny/abm', season.cover);
      break;
    }
    this._img.innerHTML = `<img src="${img}" draggable="false">`;
    this._title.textContent = item.title;
    let evaluation = `<div class="icon icon-Heart${item.favorite ? 'Fill' : ''}"></div>`;
    for (let i = 1; i < 6; i--) {
      evaluation += `<div class="icon icon-FavoriteStar${i <= item.stars ? 'Fill' : ''}></div>`;
    }
    this._eval.innerHTML = evaluation;
    // TODO: bangumi mark
    this._mark.innerHTML = '';
    this.inert = false;
    this.classList.remove('ui-bangumi-loading');
  }
}
