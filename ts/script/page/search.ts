import { UISettingItem } from "../../ui/settings";
import { UIRack } from "../../ui/rack";
import { Page, SinglePageOptions } from "../page";
import { db } from "../db";
import { VButton, VDOM, VDOMEvent, VDOMTemplate, VDiv, VLang, VSpan } from "../../ui/vdom";
import template from "./search.json"

let rack: UIRack;
let filter: UISettingItem;

async function setFilter() {
  let total = Object.keys(db.items).length;
  let rate = [0,0,0,0,0,0];
  for (const id of Object.keys(db.items)) {
    rate[db.items[id].stars]++;
  }
  filter.body.querySelectorAll('.search-filter-block[type="rate"] .search-filter-item').forEach((vdom)=>{
    let value = vdom.getAttribute('value');
    let count: number = NaN;
    switch (value) {
      case 'true':
        count = db.favorites.size;
        break;
      case 'false':
        count = Object.keys(db.items).length - db.favorites.size;
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        count = rate[value as unknown as number];
        break;
    }
    if (isNaN(count)) return;
    vdom.querySelectorAll('.search-filter-item-count').forEach((e)=>(e as VSpan).text = String(count));
  });

  let categoriesContainer = filter.body.querySelectorAll('.search-filter-block[type="categories"]')[0] as VDiv;
  let categoriesVDOM = new Set(categoriesContainer.children);
  let excludeCategoriesContainer = filter.body.querySelectorAll('.search-filter-block[type="exclude_categories"]')[0] as VDiv;
  let excludeCategoriesVDOM = new Set(excludeCategoriesContainer.children);
  for (const id of Object.keys(db.categories)) {
    let target = categoriesContainer.querySelectorAll(`.search-filter-item[value="${id}"]`)[0] as VDiv;
    let excludeTarget = excludeCategoriesContainer.querySelectorAll(`.search-filter-item[value="${id}"]`)[0] as VDiv;
    if (!target) {
      target = new VDiv();
      target.className = 'search-filter-item';
      target.setAttribute('value', id);
      categoriesContainer.append(target);
    }
    if (!excludeTarget) {
      excludeTarget = new VDiv();
      excludeTarget.className = 'search-filter-item';
      excludeTarget.setAttribute('value', id);
      excludeCategoriesContainer.append(excludeTarget);
    }
    target.text = id + ' - ' + db.categories[id].size;
    excludeTarget.text = id + ' - ' + (total - db.categories[id].size);
    categoriesVDOM.delete(target);
    excludeCategoriesVDOM.delete(excludeTarget);
  }
  for (const item of categoriesVDOM) {
    item.remove();
  }
  for (const item of excludeCategoriesVDOM) {
    item.remove();
  }

  let tagsContainer = filter.body.querySelectorAll('.search-filter-block[type="tags"]')[0] as VDiv;
  let tagsVDOM = new Set(tagsContainer.children);
  for (const id of Object.keys(db.tags)) {
    let target = tagsContainer.querySelectorAll(`.search-filter-item[value="${id}"]`)[0] as VDiv;
    if (!target) {
      target = new VDiv();
      target.className = 'search-filter-item';
      target.setAttribute('value', id);
      tagsContainer.append(target);
    }
    target.text = id + ' - ' + db.tags[id].size;
    tagsVDOM.delete(target);
  }
  for (const item of tagsVDOM) {
    item.remove();
  }

  try {
    let filterCount = filter.querySelectorAll('.search-filter-item-active').length;
    (filter.querySelector('.search-filter-count') as HTMLSpanElement).textContent = filterCount === 0 ? '' : ' - ' + filterCount;
  } catch {}
}

function filterClickHandler(ev: VDOMEvent) {
  let path = ev.composedPath();
  let target: VDOM | undefined = undefined;
  for (const item of path) {
    if (!item || !(item?.classList.contains('search-filter-item'))) continue;
    target = item;
    break;
  }
  if (!target) return;
  target.classList.toggle('search-filter-item-active');

  let filterCount = filter.querySelectorAll('.search-filter-item-active').length;
  (filter.querySelector('.search-filter-count') as HTMLSpanElement).textContent = filterCount === 0 ? '' : ' - ' + filterCount;

  fullSearch();
}

type Filter = {
  favorite?: boolean,
  star?: (0 | 1 | 2 | 3 | 4 | 5)[],
  categories: string[],
  excludeCategories: string[],
  tags: string[],
  filter: boolean,
};
function getRateFilter(block: VDiv, result: Filter) {
  block.querySelectorAll('.search-filter-item-active').forEach((item)=>{
    let value = item.getAttribute('value');
    switch (value) {
      case 'true':
      case 'false':
        if (typeof result.favorite === 'boolean') {
          result.favorite = undefined;
          break;
        }
        result.favorite = eval(value);
        break;
      case '0':
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        if (!Array.isArray(result.star)) {
          result.star = [];
        }
        result.star.push(Number(value) as any);
        break;
    }
  });
}
function getLabelFilter(block: VDiv, result: Filter, type: 'categories' | 'excludeCategories' | 'tags') {
  block.querySelectorAll('.search-filter-item-active').forEach((item)=>{
    let value = item.getAttribute('value');
    if (!value) return;
    result[type]?.push(value);
  });
}
function getFilter() {
  let result: Filter = {
    categories: [],
    excludeCategories: [],
    tags: [],
    filter: true,
  };
  let blocks = filter.body.querySelectorAll('.search-filter-block:has(.search-filter-item-active)') as VDiv[];
  if (blocks.length === 0) {
    result.filter = false;
    return result;
  }
  blocks.forEach((block)=>{
    switch (block.getAttribute('type')) {
      case 'rate':
        getRateFilter(block, result);
        break;
      case 'categories':
        getLabelFilter(block, result, 'categories');
        break;
      case 'exclude_categories':
        getLabelFilter(block, result, 'excludeCategories');
        break;
      case 'tags':
        getLabelFilter(block, result, 'tags');
        break;
    }
  });
  return result;
}

let currentKeywords: string[] = [];

async function search() {
  // get filter
  let filter = getFilter();
  if (!filter.filter && currentKeywords.length === 0) {
    return {list: [], searched: false};
  }
  // set result pool
  let pool = new Set(Object.keys(db.items));
  // filter: favorite
  if (typeof filter.favorite === 'boolean') {
    for (const id of pool) {
      if (db.items[id].favorite === filter.favorite) continue;
      pool.delete(id);
    }
  }
  // filter: star
  if (Array.isArray(filter.star)) {
    for (const id of pool) {
      if (filter.star.includes(db.items[id].stars)) continue;
      pool.delete(id);
    }
  }
  // filter: categories
  for (const name of filter.categories) {
    for (const id of pool) {
      if (db.items[id].categories.has(name)) continue;
      pool.delete(id);
    }
  }
  // filter: exclude categories
  for (const name of filter.excludeCategories) {
    for (const id of pool) {
      if (!db.items[id].categories.has(name)) continue;
      pool.delete(id);
    }
  }
  // filter: tags
  for (const name of filter.tags) {
    for (const id of pool) {
      if (db.items[id].tags.has(name)) continue;
      pool.delete(id);
    }
  }
  // filter: keywords
  for (const key of currentKeywords) {
    for (const id of pool) {
      if (db.items[id].title.toLowerCase().includes(key) || db.items[id].content.toLowerCase().includes(key)) continue;
      pool.delete(id);
    }
  }
  return {list: [...pool], searched: true};
}

function displaySearchResult({list, searched}: {list: string[], searched: boolean}) {
  if (!searched) {
    rack.title = '';
    rack.list = [];
    return;
  }
  rack.title = `<ui-lang>search.found_before</ui-lang>${list.length}<ui-lang>search.found_after</ui-lang>`;
  rack.list = list;
}

const page: SinglePageOptions = {
  name: 'search',
  single: true,
  onCreate: function (element: HTMLElement, option: any, page: Page) {
    rack = element.querySelector('.search-rack') as UIRack;
    filter = element.querySelector('.search-filter') as UISettingItem;
    rack.type = {type: 'custom', value: 'searched'};
    filter.icon.key = 'Filter';
    filter.name.append(VDOM.create<VLang>({type: 'lang', key: 'search.filter'}));
    filter.name.append(VDOM.create<VSpan>({type: 'span', classList: ['search-filter-count']}));
    let clear = VDOM.create<VButton>({
      type: 'button',
      children: [
        {
          type: 'icon',
          key: 'Clear',
        },
        {
          type: 'lang',
          key: 'search.clear',
        },
      ],
      events: {
        click: ()=>{
          filter.querySelectorAll('.search-filter-item-active').forEach((e)=>{
            e.classList.remove('search-filter-item-active');
            (filter.querySelector('.search-filter-count') as HTMLSpanElement).textContent = '';
          });
          fullSearch();
        },
      },
    });
    filter.head.append(clear);
    let bodyTemplate: VDOMTemplate[] = template as VDOMTemplate[];
    for (const template of bodyTemplate) {
      filter.body.append(VDOM.create(template));
    }
    filter.body.event.on('click', filterClickHandler);
    setFilter();
    window.addEventListener('db', async ()=>{
      await setFilter();
      fullSearch();
    });
    element.addEventListener('animationstart', (ev)=>{
      if (ev.animationName !== 'page-in') return;
      rack.updateVList();
    });
  },
  onOpen: function (element: HTMLElement, option: any, page: Page) {
    fullSearch(option);
  },
  onBack: function (element: HTMLElement, option: any, page: Page) {
  }
};

export async function fullSearch(keywords?: string[]) {
  if (Array.isArray(keywords)) {
    currentKeywords = keywords;
  }
  let result = await search();
  displaySearchResult(result);
}

export default page;
