import { timer } from "../../helper/timer";
import { layout } from "../../helper/layout";
import { Bangumi, db } from "../db";
import { Page, PageOptions } from "../page";
import path from "path";
import { settings } from "../settings";

function autoHeaderCover(item: Bangumi) {
  let base = path.join(settings.getDB(), 'images');
  let headers = new Array(item.seasons.length);
  let covers = new Array(item.seasons.length);
  let defaultHeader = '../assets/defaultCover.png';
  let defaultCover = defaultHeader;
  if (headers.length === 0) {
    return{headers: [defaultHeader], covers: [defaultCover]};
  }
  let currentHeader = '';
  let currentCover = '';
  item.seasons.forEach((season, i)=>{
    if (season.header) {
      if (!currentHeader) {
        defaultHeader = path.join(base, season.header);
      }
      currentHeader = path.join(base, season.header);
    }
    if (currentHeader) {
      headers[i] = currentHeader;
    }
    if (season.cover) {
      if (!currentCover) {
        defaultCover = path.join(base, season.cover);
      }
      currentCover = path.join(base, season.cover);
    }
    if (currentCover) {
      covers[i] = currentCover;
    }
  });
  headers.reverse();
  covers.reverse();
  for (let i = 0; i < headers.length; i++) {
    if (!headers[i]) {
      headers[i] = defaultHeader;
    }
    if (!covers[i]) {
      covers[i] = defaultCover;
    }
  }
  headers.reverse();
  covers.reverse();
  return{headers, covers};
}

const CURRENT_CLASSES = ['bangumi-links-current','bangumi-progress-current','bangumi-cover-current','bangumi-header-current'];

async function switchSeason(element: HTMLElement, btn: Element, i: number) {
  if (btn.classList.contains('bangumi-season-current')) return;
  element.classList.add('bangumi-switching');
  element.querySelector('.bangumi-season-current')?.classList.remove('bangumi-season-current');
  btn.classList.add('bangumi-season-current');
  await timer(200);
  element.querySelectorAll('.' + CURRENT_CLASSES.join(',.')).forEach((el)=>el.classList.remove(...CURRENT_CLASSES));
  element.querySelectorAll('.bangumi-links')[i].classList.add(CURRENT_CLASSES[0]);
  element.querySelectorAll('.bangumi-progress')[i].classList.add(CURRENT_CLASSES[1]);
  element.querySelectorAll('.bangumi-cover')[i].classList.add(CURRENT_CLASSES[2]);
  element.querySelectorAll('.bangumi-header')[i].classList.add(CURRENT_CLASSES[3]);
  await timer(10);
  element.classList.remove('bangumi-switching');
}

function initSwitchSeason(element: HTMLElement) {
  element.querySelectorAll('.bangumi-season').forEach((btn, i)=>btn.addEventListener('click', ()=>switchSeason(element, btn, i)));
}

class page implements PageOptions {
  name = "bangumi";
  onCreate (element: HTMLElement, option: any) {
    element.addEventListener('scroll',()=>{
      element.style.setProperty('--h', element.scrollTop + 'px');
    });
    initSwitchSeason(element);
  };
  onBack (element: HTMLElement, option: any, page: Page) {
    if (db.items[option]?.updated === page.date) return;
    element.innerHTML = layout('page/bangumi', this.layoutHandler(option, page));
    initSwitchSeason(element);
  };
  onClose(){};
  layoutHandler(option: any, page: Page) {
    page.date = db.items[option]?.updated;
    if (typeof option === 'string' && db.items[option]) {
      let { headers, covers } = autoHeaderCover(db.items[option]);
      return {item: db.items[option], headers, covers};
    }
    return {};
  };
};

export default new page();
