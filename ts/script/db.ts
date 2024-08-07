import path from "path";
import { download } from "../helper/image";
import { readFile, readdir, unlink, writeFile } from "fs/promises";
import { nextId } from "../helper/id";
import { settings } from "./settings";
import { shuffle } from "../helper/array";
import { timer } from "../helper/timer";

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
        if (!this.db.tags[name]) continue;
        this.db.tags[name].delete(this.id);
      }
      this.tags = new Set();
      for (const name of origin.tags) {
        if (typeof name !== 'string') continue;
        this.tags.add(name);
        if (!this.db.tags[name]) this.db.tags[name] = new Set();
        this.db.tags[name].add(this.id);
      }
    }
    if (Array.isArray(origin.categories)) {
      for (const name of this.categories) {
        if (!this.db.categories[name]) continue;
        this.db.categories[name].delete(this.id);
      }
      this.categories = new Set();
      for (const name of origin.categories) {
        if (typeof name !== 'string') continue;
        this.categories.add(name);
        if (!this.db.categories[name]) this.db.categories[name] = new Set();
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
      let imgaesDir = path.join(settings.getDB(), 'images');
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
      this.seasons = seasons;
    }
    if (typeof origin.date === 'number') {
      this.date = new Date(origin.date);
    }
    if (typeof origin.updated === 'number') {
      this.updated = new Date(origin.updated);
    }
    await this.db.save();
    dispatchEvent(new Event('db'));
    return this.id;
  }
  remove(){
    let imgaesDir = path.join(settings.getDB(), 'images');
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
        try {unlink(path.join(imgaesDir, season.cover))}catch{}
      }
      if (season.header !== '') {
        try {unlink(path.join(imgaesDir, season.header))}catch{}
      }
    }
    delete this.db.items[this.id];
    this.db.save();
    dispatchEvent(new Event('db'));
  }
  toJSON() {
    return{
      id: this.id,
      title: this.title,
      content: this.content,
      favorite: this.favorite,
      stars: this.stars,
      tags: this.tags,
      categories: this.categories,
      seasons: this.seasons,
      date: this.date,
      updated: this.updated,
      ext: this.ext,
    };
  }
}
export class DB{
  ver: number = 0;
  inited: boolean = false;
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
  async init(){
    if (this.inited) return;
    try {
      let file = await readFile(path.join(settings.getDB(), 'db.json'), 'utf-8');
      let data = JSON.parse(file);
      // id
      this.id = data.id;
      // categories
      for (const name of Object.keys(data.categories)) {
        this.categories[name] = new Set(data.categories[name]);
      }
      // tags
      for (const name of Object.keys(data.tags)) {
        this.tags[name] = new Set(data.tags[name]);
      }
      // mark
      this.mark = data.mark
      // recommendation
      this.recommendation = data.recommendation;
      this.recommendation.exclude = new Set(this.recommendation.exclude);
      // specialCategory
      this.specialCategory = data.specialCategory;
      // favorites
      this.favorites = new Set(data.favorites)
      // items
      for (const id of Object.keys(data.items)) {
        data.items[id].date = new Date(data.items[id].date);
        data.items[id].updated = new Date(data.items[id].updated);
        data.items[id].tags = new Set(data.items[id].tags);
        data.items[id].categories = new Set(data.items[id].categories);
        this.items[id] = new Bangumi(this, data.items[id]);
      }
      // ext
      this.ext = data.ext;
    } catch {}
    this.inited = true;
    dispatchEvent(new Event('db'));
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
    });
    try {
      return writeFile(path.join(settings.getDB(), 'db.json'), data, 'utf-8');
    } catch (error) {
      console.error(error);
    }
    return;
  }
  async createItem(origin: BangumiOriginData){
    let item = new Bangumi(this, {id: this.id});
    this.items[item.id] = item;
    this.id = nextId(this.id);
    await item.edit(origin);
    return item.id;
  }
  async removeCategory(name: string){
    if (!this.categories[name]) return false;
    for (const item of this.categories[name]) {
      this.items[item].categories.delete(name);
      this.items[item].updated = new Date();
    }
    delete this.categories[name];
    delete this.mark.categories[name];
    await this.save();
    dispatchEvent(new Event('db'));
    return true;
  }
  async removeTag(name: string){
    if (!this.tags[name]) return false;
    for (const item of this.tags[name]) {
      this.items[item].tags.delete(name);
      this.items[item].updated = new Date();
    }
    delete this.tags[name];
    delete this.mark.tags[name];
    await this.save();
    dispatchEvent(new Event('db'));
    return true;
  }
  async mergeCategory(main: string, branch: string){
    if (!this.categories[main] || !this.categories[branch]) return false;
    for (const item of this.categories[branch]) {
      this.items[item].categories.delete(branch);
      this.items[item].categories.add(main);
      this.categories[main].add(item);
      this.items[item].updated = new Date();
    }
    delete this.categories[branch];
    delete this.mark.categories[branch];
    await this.save();
    dispatchEvent(new Event('db'));
    return true;
  }
  async mergeTag(main: string, branch: string){
    if (!this.tags[main] || !this.tags[branch]) return false;
    for (const item of this.tags[branch]) {
      this.items[item].tags.delete(branch);
      this.items[item].tags.add(main);
      this.tags[main].add(item);
      this.items[item].updated = new Date();
    }
    delete this.tags[branch];
    delete this.mark.tags[branch];
    await this.save();
    dispatchEvent(new Event('db'));
    return true;
  }
  async renameCategory(before: string, after: string){
    if (!this.categories[before] || this.categories[after]) return false;
    this.categories[after] = this.categories[before];
    delete this.categories[before];
    for (const item of Array.from(this.categories[after])) {
      this.items[item].categories.delete(before);
      this.items[item].categories.add(after);
      this.items[item].updated = new Date();
    }
    this.mark.categories[after] = this.mark.categories[before];
    delete this.mark.categories[before];
    await this.save();
    dispatchEvent(new Event('db'));
    return true;
  }
  async renameTag(before: string, after: string){
    if (!this.tags[before] || this.tags[after]) return false;
    this.tags[after] = this.tags[before];
    delete this.tags[before];
    for (const item of Array.from(this.tags[after])) {
      this.items[item].tags.delete(before);
      this.items[item].tags.add(after);
      this.items[item].updated = new Date();
    }
    this.mark.tags[after] = this.mark.tags[before];
    delete this.mark.tags[before];
    await this.save();
    dispatchEvent(new Event('db'));
    return true;
  }
  async reset() {
    let dbPath = settings.getDB();
    try {
      let images = await readdir(path.join(dbPath, 'images'));
      for (const img of images) {
        try {
          await unlink(path.join(dbPath, 'images', img));
        } catch {}
      }
    } catch {}
    try {
      await unlink(path.join(dbPath, 'db.json'));
    } catch {}
  }
}

export let db = new DB();

export async function initDB() {
  await db.init();
}

export async function getRcmd(force?: boolean) {
  if (!db.inited) {
    await timer(500);
  }
  // Check expiration date
  if (!force && Date.now() - db.recommendation.generationTime < 604800000) {
    if (db.recommendation.item) {
      return db.items[db.recommendation.item]
    }
    return undefined;
  }
  // Get new expiration date
  let newDate = new Date();
  newDate.setHours(0, 0, 0, 0);
  newDate.setTime(newDate.getTime() - newDate.getDay() * 86400000);
  // When nothing in db
  if (Object.keys(db.items).length === 0){
    db.recommendation.item = null;
    db.recommendation.generationTime = newDate.getTime();
    db.save();
    return undefined;
  }
  // Create pool
  let pool: {[id: string]: number} = {};
  let favoritesPool: {[name: string]: number} = {};
  for (const id of Object.keys(db.items)) {
    let weights = 0;
    for (const name of db.items[id].categories) {
      if (typeof db.recommendation.weights.categories[name] === 'number') {
        weights += db.recommendation.weights.categories[name];
      }
    }
    for (const name of db.items[id].tags) {
      if (typeof db.recommendation.weights.tags[name] === 'number') {
        weights += db.recommendation.weights.tags[name];
      }
      if (db.items[id].favorite) {
        if (typeof favoritesPool[name] === 'number') {
          favoritesPool[name] += db.recommendation.weights.favorites;
        } else {
          favoritesPool[name] = db.recommendation.weights.favorites;
        }
      }
    }
    if (id === db.recommendation.item) continue;
    pool[id] = weights;
  }
  // Set favorites weights
  for (const name of Object.keys(favoritesPool)) {
    for (const id of db.tags[name]) {
      pool[id] += favoritesPool[name];
    }
  }
  // Convert to Array, sort, intercept, mess up
  let poolArray: {id: string, weights: number}[] = [];
  for (const id of Object.keys(pool)) {
    poolArray.push({id, weights: pool[id]});
  }
  poolArray.sort((b, a)=>a.weights - b.weights);
  poolArray = poolArray.slice(0, 48);
  poolArray = shuffle(poolArray);
  db.recommendation.item = poolArray[Math.floor(Math.random() * poolArray.length)].id;
  db.recommendation.generationTime = newDate.getTime();
  db.save();
  return db.items[db.recommendation.item];
}
