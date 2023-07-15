import path from "path";
import { download } from "./db/image";
import { readFile, unlink, writeFile } from "fs/promises";

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
  links: Array<Link>,
};
type BangumiOriginData = {
  title?: string,
  content?: string,
  favorite?: boolean,
  stars?: 0 | 1 | 2 | 3 | 4 | 5,
  tags?: Array<string>,
  categories?: Array<string>,
  seasons?: Array<Season>,
  date?: number,
  updated?: number,
  ext?: {
    [x: string]: any,
  },
};
type DBOriginData = {
  items: Array<BangumiOriginData>,
  categories: {
    [x: string]: Array<number>,
  },
  tags: {
    [x: string]: Array<number>,
  },
  recommendation: {
    generationTime: number,
    item: number | null,
    weights: {
      categories: {
        [x: string]: number,
      },
      tags: {
        [x: string]: number,
      },
      favorites: number,
    },
    exclude: Array<number>,
  },
  favorites: Array<number>,
  specialCategory: {
    watched: null | string,
    payable: null | string,
    serialized: null | string,
  },
  mark: {
    categories: {
      [x: string]: string,
    },
    tags: {
      [x: string]: string,
    },
  },
  ext: {
    [x: string]: any,
  },
};
class Bangumi{
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
  constructor(db: DB, origin?: BangumiOriginData){
    this.db = db;
    if (!origin) return;
    this.title = (origin.title as string);
    this.content = (origin.content as string);
    this.favorite = (origin.favorite as boolean);
    this.stars = (origin.stars as 0 | 1 | 2 | 3 | 4 | 5);
    this.tags = new Set(origin.tags as Array<string>);
    this.categories = new Set(origin.categories as Array<string>);
    this.seasons = (origin.seasons as Array<Season>);
    this.date = new Date(origin.date as number);
    this.updated = new Date(origin.updated as number);
    this.ext = (origin.ext as { [x: string]: any });
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
        this.db.favorites.add(this);
      }else{
        this.db.favorites.delete(this);
      }
    }
    if (typeof origin.stars === 'number' && origin.stars <= 5 && origin.stars >= 0) {
      this.stars = origin.stars;
    }
    if (Array.isArray(origin.tags)) {
      for (const name of this.tags) {
        this.db.tags[name].delete(this);
      }
      this.tags = new Set();
      for (const name of origin.tags) {
        if (typeof name !== 'string') continue;
        this.tags.add(name);
        this.db.tags[name].add(this);
      }
    }
    if (Array.isArray(origin.categories)) {
      for (const name of this.categories) {
        this.db.categories[name].delete(this);
      }
      this.categories = new Set();
      for (const name of origin.categories) {
        if (typeof name !== 'string') continue;
        this.categories.add(name);
        this.db.categories[name].add(this);
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
        for (const link of season.links) {
          if (
            typeof link.name !== 'string' ||
            typeof link.url !== 'string'
          ) continue CHECK_SEASON;
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
  toOrigin(): BangumiOriginData{
    return {
      title: this.title,
      content: this.content,
      favorite: this.favorite,
      stars: this.stars,
      tags: Array.from(this.tags),
      categories: Array.from(this.categories),
      seasons: Array.from(this.seasons),
      date: this.date.getTime(),
      updated: this.updated.getTime(),
      ext: this.ext,
    };
  }
  remove(){
    if (this.favorite) {
      this.db.favorites.delete(this);
    }
    if (this === this.db.recommendation.item) {
      this.db.recommendation.item = null;
    }
    for (const name of Array.from(this.tags)) {
      this.db.tags[name].delete(this);
    }
    for (const name of Array.from(this.categories)) {
      this.db.categories[name].delete(this);
    }
    for (const season of this.seasons) {
      if (season.cover !== '') {
        try {unlink(season.cover)}catch{}
      }
      if (season.header !== '') {
        try {unlink(season.header)}catch{}
      }
    }
    this.db.items.delete(this);
    this.db.save();
  }
}
export class DB{
  items: Set<Bangumi> = new Set();
  categories: {
    [x: string]: Set<Bangumi>,
  } = {};
  tags: {
    [x: string]: Set<Bangumi>,
  } = {};
  recommendation: {
    generationTime: number,
    item: Bangumi | null,
    weights: {
      categories: {
        [x: string]: number,
      },
      tags: {
        [x: string]: number,
      },
      favorites: number,
    },
    exclude: Set<Bangumi>,
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
  favorites: Set<Bangumi> = new Set();
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
      let data: DBOriginData = JSON.parse(file);
      let items: Array<Bangumi> = [];
      for (let i = 0; i < data.items.length; i++) {
        let bangumi = new Bangumi(this, data.items[i]);
        items.push(bangumi);
      }
      this.items = new Set(items);
      for (const key in data.categories) {
        if (Object.prototype.hasOwnProperty.call(data.categories, key)) {
          this.categories[key] = new Set();
          for (const id of data.categories[key]) {
            this.categories[key].add(items[id]);
          }
        }
      }
      for (const key in data.tags) {
        if (Object.prototype.hasOwnProperty.call(data.tags, key)) {
          this.tags[key] = new Set();
          for (const id of data.tags[key]) {
            this.tags[key].add(items[id]);
          }
        }
      }
      this.recommendation.generationTime = data.recommendation.generationTime;
      if (typeof data.recommendation.item === 'number') {
        this.recommendation.item = items[data.recommendation.item];
      }
      this.recommendation.weights = data.recommendation.weights;
      for (const id of data.recommendation.exclude) {
        this.recommendation.exclude.add(items[id]);
      }
      for (const id of data.favorites) {
        this.favorites.add(items[id]);
      }
      this.specialCategory = data.specialCategory;
      this.mark = data.mark;
      this.ext = data.ext;
    } catch {}
  }
  async save(){
    let data: DBOriginData = {
      items: [],
      categories: {},
      tags: {},
      recommendation: {
        generationTime: this.recommendation.generationTime,
        item: null,
        weights: this.recommendation.weights,
        exclude: [],
      },
      favorites: [],
      specialCategory: this.specialCategory,
      mark: this.mark,
      ext: this.ext,
    };
    let items = Array.from(this.items);
    for (const item of items) {
      data.items.push(item.toOrigin());
    }
    for (const key in this.categories) {
      if (Object.prototype.hasOwnProperty.call(this.categories, key)) {
        data.categories[key] = [];
        for (const item of Array.from(this.categories[key])) {
          data.categories[key].push(items.indexOf(item));
        }
      }
    }
    for (const key in this.tags) {
      if (Object.prototype.hasOwnProperty.call(this.tags, key)) {
        data.tags[key] = [];
        for (const item of Array.from(this.tags[key])) {
          data.tags[key].push(items.indexOf(item));
        }
      }
    }
    if (this.recommendation.item) {
      data.recommendation.item = items.indexOf(this.recommendation.item);
    }
    for (const item of Array.from(this.favorites)) {
      data.favorites.push(items.indexOf(item));
    }
    try {
      return writeFile(path.join(this.dbPath, 'db.json'), JSON.stringify(data), 'utf-8');
    } catch (error) {
      console.error(error);
    }
    return;
  }
  async createItem(origin: BangumiOriginData){
    let item = new Bangumi(this);
    this.items.add(item);
    await item.edit(origin);
    return this.save();
  }
  async removeCategory(name: string){
    if (!this.categories[name]) return false;
    for (const item of Array.from(this.categories[name])) {
      item.categories.delete(name);
    }
    await this.save();
    return true;
  }
  async removeTag(name: string){
    if (!this.tags[name]) return false;
    for (const item of Array.from(this.tags[name])) {
      item.tags.delete(name);
    }
    await this.save();
    return true;
  }
  async mergeCategory(main: string, branch: string){
    if (!this.categories[main] || !this.categories[branch]) return false;
    for (const item of this.categories[branch]) {
      item.categories.delete(branch);
      item.categories.add(main);
      this.categories[main].add(item);
    }
    delete this.categories[branch];
    await this.save();
    return true;
  }
  async mergeTag(main: string, branch: string){
    if (!this.tags[main] || !this.tags[branch]) return false;
    for (const item of this.tags[branch]) {
      item.tags.delete(branch);
      item.tags.add(main);
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
      item.categories.delete(before);
      item.categories.add(after);
    }
    await this.save();
    return true;
  }
  async renameTag(before: string, after: string){
    if (!this.tags[before] || this.tags[after]) return false;
    this.tags[after] = this.tags[before];
    delete this.tags[before];
    for (const item of Array.from(this.tags[after])) {
      item.tags.delete(before);
      item.tags.add(after);
    }
    await this.save();
    return true;
  }
}
