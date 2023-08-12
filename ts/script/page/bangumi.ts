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

function initFavoriteButton(element: HTMLElement, id: string, page: Page) {
  let icon = element.querySelector('.bangumi-favorite .icon') as HTMLDivElement;
  element.querySelector('.bangumi-favorite')?.addEventListener('click',async ()=>{
    let before = db.items[id].favorite;
    await db.items[id].edit({favorite: !before, updated: Date.now()});
    page.date = db.items[id].updated;
    if (before) {
      icon.classList.remove('icon-HeartFill');
      icon.classList.add('icon-Heart');
      return;
    }
    icon.classList.add('icon-HeartFill');
    icon.classList.remove('icon-Heart');
  });
}
function initRateButton(element: HTMLElement, id: string, page: Page) {
  let rate = element.querySelector('.bangumi-rate') as HTMLDivElement;
  rate.addEventListener('click',async (ev)=>{
    let level = Array.from(rate.children).indexOf(ev.target as Element) + 1 as 0 | 1 | 2 | 3 | 4 | 5;
    if (level === 0 || level > 5) return;
    if (db.items[id].stars === level) {
      level = 0;
    }
    await db.items[id].edit({stars: level, updated: Date.now()});
    page.date = db.items[id].updated;
    let html = '';
    for (let i = 1; i < 6; i++) {
      html += `<div class="icon icon-FavoriteStar${i <= level ? 'Fill' : ''}"></div>`;
    }
    rate.innerHTML = html;
  });
}

class page implements PageOptions {
  name = "bangumi";
  onCreate (element: HTMLElement, option: any, page: Page) {
    element.addEventListener('scroll',()=>{
      element.style.setProperty('--h', element.scrollTop + 'px');
    });
    initSwitchSeason(element);
    initFavoriteButton(element, option, page);
    initRateButton(element, option, page);
  };
  onBack (element: HTMLElement, option: any, page: Page) {
    if (db.items[option]?.updated === page.date) return;
    element.innerHTML = layout('page/bangumi', this.layoutHandler(option, page));
    initSwitchSeason(element);
    initFavoriteButton(element, option, page);
    initRateButton(element, option, page);
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
