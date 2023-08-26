import { Dialog } from "../../ui/dialog";
import { element } from "../../helper/layout";
import { UIRack, createSetRackTypeDialog } from "../../ui/rack";
import { SinglePageOptions, history } from "../page";
import { settings } from "../settings";
import { db, getRcmd } from "../db";
import { timer } from "../../helper/timer";
import path from "path";

type RackObject = {element: UIRack, type: 'none' | 'all' | 'category' | 'tag' | 'custom', value: string, fold: boolean};

let racks: RackObject[] = []

let container: HTMLDivElement;

function addRack(type: {type: 'none' | 'all' | 'category' | 'tag' | 'custom', value: string, fold?: boolean}) {
  let rack = (document.createElement('ui-rack') as UIRack);
  rack.type = type;
  if (typeof type.fold === 'boolean') {
    rack.folded = type.fold;
  }
  let obj: RackObject = {element: rack, type: type.type, value: type.value, fold: false};
  racks.push(obj);
  container.append(rack);
  rack.addEventListener('change',()=>{
    obj.type = rack.type.type;
    obj.value = rack.type.value;
    obj.fold = rack.folded;
    saveRack();
  });
}

function saveRack() {
  let value = [];
  for (const rack of racks) {
    value.push({type: rack.type, value: rack.value, fold: rack.fold});
  }
  settings.setRack(value);
}

function loadRacks() {
  container.innerHTML = '';
  for (const rack of settings.getRack()) {
    addRack(rack);
  }
}

function createRackSorter() {
  let container = document.createElement('div');
  container.classList.add('home-rack-sort-items');
  for (const rack of racks) {
    let item = element('page/home/rack', ['home-rack-sort-item'], rack);
    (item as any).value = rack;
    item.querySelector('.home-rack-sort-item-up')?.addEventListener('click', ()=>item.previousSibling?.before(item));
    item.querySelector('.home-rack-sort-item-down')?.addEventListener('click', ()=>item.nextElementSibling?.after(item));
    item.querySelector('.home-rack-sort-item-remove')?.addEventListener('click',()=>item.remove());
    container.append(item);
  }
  return{
    element: container,
    getValue: ()=>{
      let result: RackObject[] = [];
      for (const item of container.children) {
        result.push((item as any).value);
      }
      return result;
    },
  };
}

async function setRcmd(element: HTMLElement, force?: boolean) {
  const defaultSrc = '../assets/defaultCover.png';
  let title = element.querySelector('.rcmd-title') as HTMLDivElement;
  let bg = element.querySelector('.rcmd-bg') as HTMLImageElement;
  let cover = element.querySelector('.rcmd-cover') as HTMLImageElement;
  let btn = element.querySelector('.rcmd-check') as HTMLButtonElement;
  let item = await getRcmd(force);
  if (!item) {
    title.innerHTML = '<ui-lang>home.rcmd_nothing</ui-lang>';
    btn.innerHTML = '<ui-lang>home.rcmd_regenerate</ui-lang>';
    bg.src = defaultSrc;
    cover.src = defaultSrc;
    bg.classList.toggle('rcmd-bg-blur', true);
    return;
  }
  let noHeader = false;
  let bgSrc = '';
  let coverSrc = '';
  for (const season of item.seasons) {
    if (season.cover && !coverSrc) {
      coverSrc = path.join(settings.getDB(), 'images', season.cover);
    }
    if (season.header && !bgSrc) {
      bgSrc = path.join(settings.getDB(), 'images', season.header);
    }
  }
  if (!coverSrc) {
    coverSrc = defaultSrc;
  }
  if (!bgSrc) {
    noHeader = true;
    bgSrc = coverSrc;
  }
  bg.src = bgSrc;
  bg.classList.toggle('rcmd-bg-blur', noHeader);
  cover.src = coverSrc;
  title.textContent = item.title;
  btn.innerHTML = '<ui-lang>home.rcmd_check</ui-lang>';
}
let rmcdInited = false;
function initRcmd(element: HTMLElement) {
  if (rmcdInited) return;
  rmcdInited = true;
  let cover = element.querySelector('.rcmd-cover') as HTMLImageElement;
  setRcmd(element);
  (element.querySelector('.rcmd-check') as HTMLButtonElement).addEventListener('click', async ()=>{
    if (db.recommendation.item === null) {
      return setRcmd(element, true);
    }
    let img = cover.cloneNode() as HTMLImageElement;
    img.classList.add('ui-bangumi-animation');
    let rect = cover.getBoundingClientRect();
    img.style.left = rect.left + 'px';
    img.style.top = rect.top + 'px';
    img.style.height = rect.height + 'px';
    img.style.width = rect.width + 'px';
    document.body.append(img);
    (document.querySelector('.page-current') as any)?.page.hide();
    await timer(100);
    img.style.top = window.innerHeight * 0.9 - 128 + 'px';
    img.style.left = (window.innerWidth - Math.min(window.innerWidth - 32, 1104)) / 2 + 'px';
    img.style.height = '400px';
    img.style.width = '300px';
    await timer(100);
    history.open('bangumi', db.recommendation.item);
    await timer(300);
    img.remove();
  });
}


const page: SinglePageOptions = {
  name: 'home',
  single: true,
  async onCreate(element, option) {
    container = element.querySelector('.display-rack') as HTMLDivElement;
    let btnAdd = element.querySelector('.home-rack-add') as HTMLButtonElement;
    let btnSort = element.querySelector('.home-rack-sort') as HTMLButtonElement;
    btnAdd.addEventListener('click',async ()=>{
      let { isCanceled, value } = await createSetRackTypeDialog({type: 'none', value: ''}, '<ui-lang>home.rack_add</ui-lang>');
      if (isCanceled) return;
      addRack(value);
      saveRack();
    });
    btnSort.addEventListener('click', ()=>{
      let {element, getValue} = createRackSorter();
      let dialog = new Dialog({
        title: '<ui-lang>home.rack_sort_title</ui-lang>',
        content: element,
        buttons: [
          {
            text: '<ui-lang>dialog.confirm</ui-lang>',
            level: 'confirm',
            action: ()=>{
              racks = getValue();
              saveRack();
              container.innerHTML = '';
              for (const rack of racks) {
                container.append(rack.element);
              }
              for (const rack of racks) {
                rack.element.updateVList();
              }
              dialog.close();
            },
          },
          {
            text: '<ui-lang>dialog.cancel</ui-lang>',
            action: ()=>{
              dialog.close();
            },
          },
        ],
      });
      dialog.show();
    });
    loadRacks();
    element.addEventListener('animationstart', (ev)=>{
      if (ev.animationName !== 'page-in') return;
      for (const rack of container.children) {
        (rack as UIRack).updateVList();
      }
      initRcmd(element);
    });
    window.addEventListener('db',()=>setRcmd(element));
  },
  onBack(element, option) {
  },
  onOpen(element, option) {
  },
};

export default page;
