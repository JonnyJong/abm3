import { UIText } from "ts/ui/text";

export async function initSearchbar() {
  let searchbar = (document.querySelector('ui-text') as UIText);
  searchbar.buttonsLeft = [{
    icon: 'Search',
    tooltipLocaleKey: 'search.advanced_search',
    action: ()=>{},
  }];
  searchbar.buttonsRight = [{
    icon: 'Clear',
    tooltipLocaleKey: 'text.clear',
    clear: true,
  }];
}
