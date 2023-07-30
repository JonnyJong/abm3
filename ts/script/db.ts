import path from "path";
import { download } from "./db/image";
import { readFile, unlink, writeFile } from "fs/promises";
import { nextId } from "ts/helper/id";

type Link = {
  name: string,
  url: string,
};
type Season = {
  title: string,
  set: number,
  watched: number,
  cover: string,
  header: string,
  links: Array<Link> | null,
};
type BangumiOriginData = {
  title?: string,
  content?: string,
  favorite?: boolean,
  stars?: 0 | 1 | 2 | 3 | 4 | 5,
  tags?: Set<string>,
  categories?: Set<string>,
  seasons?: Array<Season>,
  date?: number,
  updated?: number,
  ext?: {
    [x: string]: string,
  },
};
export class Bangumi{
  id: string = '';
  title: string = '';
  content: string = '';
  favorite: boolean = false;
  stars: 0 | 1 | 2 | 3 | 4 | 5 = 0;
  tags: Set<string> = new Set();
  categories: Set<string> = new Set();
  seasons: Array<Season> = [];
  date: Date = new Date();
  updated: Date = new Date();
  ext: {
    [x: string]: any,
  } = {};
  db: DB;
  constructor(db: DB, origin?: any){
    this.db = db;
    if (!origin) return;
    for (const key in origin) {
      if (!Object.prototype.hasOwnProperty.call(origin, key)) continue;
      // @ts-ignore
      this[key] = origin[key];
    }
  }
  async edit(origin: BangumiOriginData){
    if (typeof origin.title === 'string') {
      this.title = origin.title;
    }
    if (typeof origin.content === 'string') {
      this.content = origin.content;
    }
    if (typeof origin.favorite === 'boolean') {
      this.favorite = origin.favorite;
      if (this.favorite) {
        this.db.favorites.add(this.id);
      }else{
        this.db.favorites.delete(this.id);
      }
    }
    if (typeof origin.stars === 'number' && origin.stars <= 5 && origin.stars >= 0) {
      this.stars = origin.stars;
    }
    if (Array.isArray(origin.tags)) {
      for (const name of this.tags) {
        this.db.tags[name].delete(this.id);
      }
      this.tags = new Set();
      for (const name of origin.tags) {
        if (typeof name !== 'string') continue;
        this.tags.add(name);
        this.db.tags[name].add(this.id);
      }
    }
    if (Array.isArray(origin.categories)) {
      for (const name of this.categories) {
        this.db.categories[name].delete(this.id);
      }
      this.categories = new Set();
      for (const name of origin.categories) {
        if (typeof name !== 'string') continue;
        this.categories.add(name);
        this.db.categories[name].add(this.id);
      }
    }
    if (Array.isArray(origin.seasons)) {
      let seasons = [];
      CHECK_SEASON: for (const season of origin.seasons) {
        if (
          typeof season.title !== 'string' ||
          typeof season.set !== 'number' ||
          typeof season.watched !== 'number' ||
          typeof season.cover !== 'string' ||
          typeof season.header !== 'string' ||
          !Array.isArray(season.links)
        ) continue;
        if (Array.isArray(season.links)) {
          for (const link of season.links) {
            if (
              typeof link.name !== 'string' ||
              typeof link.url !== 'string'
            ) continue CHECK_SEASON;
          }
        } else if (season.links !== null) {
          continue CHECK_SEASON;
        }
        seasons.push(season);
      }
      let originalPool: Set<string> = new Set();
      let newPool: { [x: string]: string } = {};
      for (const season of this.seasons) {
        if (season.cover !== '') {
          originalPool.add(season.cover);
        }
        if (season.header !== '') {
          originalPool.add(season.header);
        }
      }
      let imgaesDir = path.join(this.db.dbPath, 'images');
      for (const season of seasons) {
        if (season.cover !== '') {
          if (newPool[season.cover]) {
            season.cover = newPool[season.cover];
          } else if (originalPool.has(season.cover)) {
            originalPool.delete(season.cover);
            newPool[season.cover] = season.cover;
          } else {
            let img = await download(season.cover, imgaesDir);
            newPool[season.cover] = img;
            season.cover = img;
          }
        }
        if (season.header !== '') {
          if (newPool[season.header]) {
            season.header = newPool[season.header];
          } else if (originalPool.has(season.header)) {
            originalPool.delete(season.header);
            newPool[season.header] = season.header;
          } else {
            let img = await download(season.header, imgaesDir);
            newPool[season.header] = img;
            season.header = img;
          }
        }
      }
      for (const img of Array.from(originalPool)) {
        try {unlink(path.join(imgaesDir, img))}catch{}
      }
    }
    if (typeof origin.date === 'number') {
      this.date = new Date(origin.date);
    }
    if (typeof origin.updated === 'number') {
      this.updated = new Date(origin.updated);
    }
    return;
  }
  remove(){
    if (this.favorite) {
      this.db.favorites.delete(this.id);
    }
    if (this.id === this.db.recommendation.item) {
      this.db.recommendation.item = null;
    }
    for (const name of Array.from(this.tags)) {
      this.db.tags[name].delete(this.id);
    }
    for (const name of Array.from(this.categories)) {
      this.db.categories[name].delete(this.id);
    }
    for (const season of this.seasons) {
      if (season.cover !== '') {
        try {unlink(season.cover)}catch{}
      }
      if (season.header !== '') {
        try {unlink(season.header)}catch{}
      }
    }
    delete this.db.items[this.id];
    this.db.save();
  }
}
export class DB{
  id: string = 'a0';
  items: {
    [x:  string]: Bangumi,
  } = {};
  categories: {
    [x: string]: Set<string>,
  } = {};
  tags: {
    [x: string]: Set<string>,
  } = {};
  recommendation: {
    generationTime: number,
    item: string | null,
    weights: {
      categories: {
        [x: string]: number,
      },
      tags: {
        [x: string]: number,
      },
      favorites: number,
    },
    exclude: Set<string>,
  } = {
    generationTime: 0,
    item: null,
    weights: {
      categories: {},
      tags: {},
      favorites: 1,
    },
    exclude: new Set(),
  };
  favorites: Set<string> = new Set();
  specialCategory: {
    watched: null | string,
    payable: null | string,
    serialized: null | string,
  } = {
    watched: null,
    payable: null,
    serialized: null,
  };
  mark: {
    categories: {
      [x: string]: string,
    },
    tags: {
      [x: string]: string,
    },
  } = {
    categories: {},
    tags: {},
  };
  ext: {
    [x: string]: any,
  } = {};
  dbPath: string;
  constructor(dbPath: string){
    this.dbPath = dbPath;
  }
  async init(){
    try {
      let file = await readFile(path.join(this.dbPath, 'db.json'), 'utf-8');
      let data = JSON.parse(file, (key, value)=>{
        if (typeof value === 'number' && ['date', 'updated'].includes(key)) {
          return new Date(value);
        } else if (Array.isArray(value) && typeof value[0] === 'string') {
          return new Set(value);
        }
        return value;
      });
      for (const key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key) || key === 'items') continue;
        // @ts-ignore
        this[key] = data[key];
      }
      for (const key in this.items) {
        if (Object.prototype.hasOwnProperty.call(this.items, key)) {
          this.items[key] = new Bangumi(this, this.items);
        }
      }
    } catch {}
  }
  async save(){
    let data = JSON.stringify(this, (key, value)=>{
      if (typeof value !== 'object') return value;
      if (value instanceof Date) {
        return value.getTime();
      } else if (value instanceof Set) {
        return Array.from(value);
      } else {
        return value;
      }
    })
    try {
      return writeFile(path.join(this.dbPath, 'db.json'), JSON.stringify(data), 'utf-8');
    } catch (error) {
      console.error(error);
    }
    return;
  }
  async createItem(origin: BangumiOriginData){
    let item = new Bangumi(this, {id: this.id});
    this.items[item.id] = item;
    await item.edit(origin);
    this.id = nextId(this.id);
    return this.save();
  }
  async removeCategory(name: string){
    if (!this.categories[name]) return false;
    for (const item of Array.from(this.categories[name])) {
      this.items[item].categories.delete(name);
    }
    await this.save();
    return true;
  }
  async removeTag(name: string){
    if (!this.tags[name]) return false;
    for (const item of Array.from(this.tags[name])) {
      this.items[item].tags.delete(name);
    }
    await this.save();
    return true;
  }
  async mergeCategory(main: string, branch: string){
    if (!this.categories[main] || !this.categories[branch]) return false;
    for (const item of this.categories[branch]) {
      this.items[item].categories.delete(branch);
      this.items[item].categories.add(main);
      this.categories[main].add(item);
    }
    delete this.categories[branch];
    await this.save();
    return true;
  }
  async mergeTag(main: string, branch: string){
    if (!this.tags[main] || !this.tags[branch]) return false;
    for (const item of this.tags[branch]) {
      this.items[item].tags.delete(branch);
      this.items[item].tags.add(main);
      this.tags[main].add(item);
    }
    delete this.tags[branch];
    await this.save();
    return true;
  }
  async renameCategory(before: string, after: string){
    if (!this.categories[before] || this.categories[after]) return false;
    this.categories[after] = this.categories[before];
    delete this.categories[before];
    for (const item of Array.from(this.categories[after])) {
      this.items[item].categories.delete(before);
      this.items[item].categories.add(after);
    }
    await this.save();
    return true;
  }
  async renameTag(before: string, after: string){
    if (!this.tags[before] || this.tags[after]) return false;
    this.tags[after] = this.tags[before];
    delete this.tags[before];
    for (const item of Array.from(this.tags[after])) {
      this.items[item].tags.delete(before);
      this.items[item].tags.add(after);
    }
    await this.save();
    return true;
  }
}
