import { UISettingItem } from "../../ui/settings";
import { UIRack } from "../../ui/rack";
import { Page, SinglePageOptions } from "../page";
import { db } from "../db";
import { VButton, VDOM, VDOMEvent, VDOMTemplate, VDiv, VLang } from "../../ui/vdom";

let rack: UIRack;
let filter: UISettingItem;

async function setFilter(value?: Filter) {
  // let rate = [0,0,0,0,0,0];
  // for (const id of Object.keys(db.items)) {
  //   rate[db.items[id].stars]++;
  // }
  // filter.body.innerHTML = layout('page/search/filter', {db, count: {
  //   total: Object.keys(db.items).length,
  //   favorite: db.favorites.size,
  //   rate,
  // }});
  // if (!value) return;
  // if (typeof value.favorite === 'boolean') {
  // }
}

function filterClickHandler(ev: VDOMEvent) {
  let path = ev.composedPath();
  let target: HTMLDivElement | undefined = undefined;
  for (const item of path) {
    if (!(item instanceof HTMLDivElement) || !(item as HTMLDivElement)?.classList.contains('search-filter-item')) continue;
    target = item as HTMLDivElement;
    break;
  }
  if (!target) return;
  target.classList.toggle('search-filter-item-active');
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
function getRateFilter(block: Element, result: Filter) {
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
function getLabelFilter(block: Element, result: Filter, type: 'categories' | 'excludeCategories' | 'tags') {
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
  // let filterCount = filter.querySelectorAll('.search-filter-item-active').length;
  // filter.name = '<ui-lang>筛选</ui-lang>' + (filterCount === 0 ? '' : ' - ' + filterCount);
  // let blocks = filter.body.querySelectorAll('.search-filter-block:has(.search-filter-item-active)');
  // if (blocks.length === 0) {
  //   result.filter = false;
  //   return result;
  // }
  // blocks.forEach((block)=>{
  //   switch (block.getAttribute('type')) {
  //     case 'rate':
  //       getRateFilter(block, result);
  //       break;
  //     case 'categories':
  //       getLabelFilter(block, result, 'categories');
  //       break;
  //     case 'exclude_categories':
  //       getLabelFilter(block, result, 'excludeCategories');
  //       break;
  //     case 'tags':
  //       getLabelFilter(block, result, 'tags');
  //       break;
  //   }
  // });
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
          });
          fullSearch();
        },
      },
    });
    filter.head.append(clear);
    let bodyTemplate: VDOMTemplate[] = [
      {
        type: 'lang',
        key: 'search.rate',
        classList: ['search-filter-title'],
      },
      {
        type: 'div',
        classList: ['search-filter-block'],
        attribute: {type: 'rate'},
        children: [
          {
            type: 'div',
            classList: ['search-filter-item'],
            attribute: {value:'true'},
            children: [
              {
                type: 'icon',
                key: 'HeartFill',
              },
              {
                type: 'lang',
                key: 'search.favorite',
              },
              {
                type: 'span',
                text: ' - ',
              },
              {
                type: 'span',
                text: '0',
              },
            ],
          },
          {
            type: 'div',
            classList: ['search-filter-item'],
            attribute: {value:'false'},
            children: [
              {
                type: 'icon',
                key: 'Heart',
              },
              {
                type: 'lang',
                key: 'search.non_favorite',
              },
              {
                type: 'span',
                text: ' - ',
              },
              {
                type: 'span',
                text: '0',
              },
            ],
          },
          {
            type: 'div',
            classList: ['search-filter-item'],
            attribute: {value: '0'},
            children: [
              {
                type: 'icon',
                key: 'FavoriteStar',
              },
              {
                type: 'div',
                classList: ['search-filter-star'],
                text: '0',
              },
              {
                type: 'span',
                text: ' - ',
              },
              {
                type: 'span',
                text: '0',
              },
            ],
          },
          {
            type: 'div',
            classList: ['search-filter-item'],
            attribute: {value: '1'},
            children: [
              {
                type: 'icon',
                key: 'FavoriteStar',
              },
              {
                type: 'div',
                classList: ['search-filter-star'],
                text: '1',
              },
              {
                type: 'span',
                text: ' - ',
              },
              {
                type: 'span',
                text: '0',
              },
            ],
          },
          {
            type: 'div',
            classList: ['search-filter-item'],
            attribute: {value: '2'},
            children: [
              {
                type: 'icon',
                key: 'FavoriteStar',
              },
              {
                type: 'div',
                classList: ['search-filter-star'],
                text: '2',
              },
              {
                type: 'span',
                text: ' - ',
              },
              {
                type: 'span',
                text: '0',
              },
            ],
          },
          {
            type: 'div',
            classList: ['search-filter-item'],
            attribute: {value: '3'},
            children: [
              {
                type: 'icon',
                key: 'FavoriteStar',
              },
              {
                type: 'div',
                classList: ['search-filter-star'],
                text: '3',
              },
              {
                type: 'span',
                text: ' - ',
              },
              {
                type: 'span',
                text: '0',
              },
            ],
          },
          {
            type: 'div',
            classList: ['search-filter-item'],
            attribute: {value: '4'},
            children: [
              {
                type: 'icon',
                key: 'FavoriteStar',
              },
              {
                type: 'div',
                classList: ['search-filter-star'],
                text: '4',
              },
              {
                type: 'span',
                text: ' - ',
              },
              {
                type: 'span',
                text: '0',
              },
            ],
          },
          {
            type: 'div',
            classList: ['search-filter-item'],
            attribute: {value: '5'},
            children: [
              {
                type: 'icon',
                key: 'FavoriteStar',
              },
              {
                type: 'div',
                classList: ['search-filter-star'],
                text: '5',
              },
              {
                type: 'span',
                text: ' - ',
              },
              {
                type: 'span',
                text: '0',
              },
            ],
          },
        ],
      },
      {
        type: 'lang',
        key: 'search.categories',
        classList: ['search-filter-title'],
      },
      {
        type: 'div',
        classList: ['search-filter-block'],
        attribute: {type: 'categories'},
      },
      {
        type: 'lang',
        key: 'search.exclude_categories',
        classList: ['search-filter-title'],
      },
      {
        type: 'div',
        classList: ['search-filter-block'],
        attribute: {type: 'exclude_categories'},
      },
      {
        type: 'lang',
        key: 'search.tags',
        classList: ['search-filter-title'],
      },
      {
        type: 'div',
        classList: ['search-filter-block'],
        attribute: {type: 'tags'},
      },
    ];
    for (const template of bodyTemplate) {
      filter.body.append(VDOM.create(template));
    }
    filter.body.event.on('click', filterClickHandler);
    setFilter();
    window.addEventListener('db', async ()=>{
      await setFilter(getFilter());
      fullSearch();
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
