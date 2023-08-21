import { UIText } from "../ui/text";
import { history } from "./page";
import { fullSearch } from "./page/search";
import { db } from "./db";
import { UIBangumi } from "../ui/bangumi";
import { LocaleAuto } from "../ui/lang";

let searchbar: UIText;

function createKeywords(str: string): string[] {
  return [...new Set(str.toLowerCase().replace(/\s{2,}/, ' ').split(' ').filter((v)=>v !== ''))];
}

function openSearchPage() {
  searchbar.list = [];
  let keywords = createKeywords(searchbar.value);
  if (history.now.page._options.name !== 'search') {
    history.open('search', keywords);
    return;
  }
  fullSearch(keywords);
}

function openQuickSearchItem(element: HTMLDivElement) {
  (element.children?.[0] as UIBangumi).click();
  searchbar.blur();
}

function quickSearch(keyword: string) {
  let result = [];
  keyword = keyword.toLowerCase();
  for (const id of Object.keys(db.items)) {
    if (!db.items[id].title.toLowerCase().includes(keyword)) continue;
    result.push(id);
    if (result.length > 4) break;
  }
  let list: {html: string, action: (element: HTMLDivElement)=>void}[] = [];
  for (const id of result) {
    list.push({
      html: `<ui-bangumi id="${id}" class="search-quick-item"></ui-bangumi>`,
      action: openQuickSearchItem,
    });
  }
  searchbar.list = list;
}

export async function initSearchbar() {
  searchbar = (document.querySelector('ui-text') as UIText);
  searchbar.buttonsLeft = [{
    icon: 'Search',
    tooltipLocaleKey: 'search.advanced_search',
    action: openSearchPage,
  }];
  searchbar.buttonsRight = [{
    icon: 'Clear',
    tooltipLocaleKey: 'text.clear',
    clear: true,
  }];
  searchbar.onconfirmed = openSearchPage;
  searchbar.addEventListener('input', ()=>{
    let keyword = searchbar.value.trim();
    if (keyword === '' || history.now.page._options.name === 'search') {
      searchbar.list = [];
      return;
    }
    quickSearch(keyword);
  });
  new LocaleAuto({key: 'search.type_to_search'}, (str: string)=>{
    searchbar.placeholder = str;
  });
}
