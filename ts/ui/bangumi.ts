import { db } from "../script/db";
import { layout } from "../helper/layout";
import path from "path";
import { history } from "../script/page";
import { timer } from "../helper/timer";
import { settings } from "../script/settings";

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
    this._img = this.querySelector('.ui-bangumi-cover') as HTMLDivElement;
    this._title = this.querySelector('.ui-bangumi-title') as HTMLDivElement;
    this._eval = this.querySelector('.ui-bangumi-evaluation') as HTMLDivElement;
    this._mark = this.querySelector('.ui-bangumi-mark') as HTMLDivElement;
    this.update();
    this.addEventListener('click',async ()=>{
      if (this._id === '') return;
      let img = (this._img.children[0].cloneNode() as HTMLImageElement);
      img.classList.add('ui-bangumi-animation');
      let rect = this._img.getBoundingClientRect();
      img.style.left = rect.left + 'px';
      img.style.top = rect.top + 'px';
      img.style.height = rect.height + 'px';
      img.style.width = rect.width + 'px';
      document.body.append(img);
      document.querySelector('.page-current')?.classList.remove('page-current');
      await timer(100);
      img.style.top = window.innerHeight * 0.9 - 128 + 'px';
      img.style.left = (window.innerWidth - Math.min(window.innerWidth - 32, 1104)) / 2 + 'px';
      // img.style.left = (window.innerWidth - Math.min(window.innerWidth - 32, 1080)) / 2 + 'px';
      img.style.height = '400px';
      img.style.width = '300px';
      await timer(100);
      history.open('bangumi', this._id);
      await timer(300);
      img.remove();
    });
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
      img = path.join(settings.getDB(), 'images', season.cover);
      break;
    }
    this._img.innerHTML = `<img src="${img}" draggable="false">`;
    this._title.textContent = item.title;
    let evaluation = `<div class="icon icon-Heart${item.favorite ? 'Fill' : ''}"></div>`;
    for (let i = 1; i < 6; i++) {
      evaluation += `<div class="icon icon-FavoriteStar${i <= item.stars ? 'Fill' : ''}"></div>`;
    }
    this._eval.innerHTML = evaluation;
    this._mark.innerHTML = '';
    item.categories.forEach((name)=>{
      if (db.mark.categories[name]) {
        this._mark.innerHTML += `<div style="background:${db.mark.categories[name]};"></div>`
      }
    });
    item.tags.forEach((name)=>{
      if (db.mark.tags[name]) {
        this._mark.innerHTML += `<div style="background:${db.mark.tags[name]};"></div>`
      }
    });
    this.inert = false;
    this.classList.remove('ui-bangumi-loading');
  }
}
