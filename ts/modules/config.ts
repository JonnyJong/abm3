import { readFile, mkdir, access, writeFile } from "fs/promises";
import path from "path";
import yaml from "yaml";
import fs = require("fs");
import { app, ipcRenderer } from "electron";

let configDir = '';

export default class Config{
  name: string;
  store: any;
  decoder: Function = JSON.parse;
  encoder: Function = JSON.stringify;
  constructor(name: string){
    this.name = name;
  }
  _loadConfig(){
    return readFile(path.join(configDir, this.name + '.json'), 'utf-8').then((value)=>this.decoder(value));
  }
  _loadDefault(){
    return readFile(path.join(process.cwd(), './configs/', this.name + '.json'), 'utf-8').then(JSON.parse).catch(()=>{
      return readFile(path.join(process.cwd(), './configs/', this.name + '.yaml'), 'utf-8').then(yaml.parse);
    }).catch(()=>{
      return readFile(path.join(process.cwd(), './configs/', this.name + '.yml'), 'utf-8').then(yaml.parse);
    }).catch(()=>{
      return {};
    });
  }
  load(): Promise<any>{
    return this._loadConfig().catch(()=>this._loadDefault()).then((value)=>{
      this.store = value;
      return value;
    });
  }
  save(): Promise<any>{
    return access(configDir).catch(()=>mkdir(configDir, {recursive: true})).then(()=>writeFile(path.join(configDir, this.name + '.json'), this.encoder(this.store), 'utf-8'));
  }
  reset(): Promise<any>{
    return this._loadDefault().then((value)=>{
      this.store = value;
      return this.save();
    });
  }
}
class ConfigSync{
  name: string;
  store: any;
  decoder: Function = JSON.parse;
  encoder: Function = JSON.stringify;
  constructor(name: string){
    this.name = name;
    this.load();
  }
  _loadConfig(){
    return this.decoder(fs.readFileSync(path.join(configDir, this.name + '.json'), 'utf-8'));
  }
  _loadDefault(){
    try {
      return JSON.parse(fs.readFileSync(path.join(process.cwd(), './configs/', this.name + '.json'), 'utf-8'));
    } catch {};
    try {
      return yaml.parse(fs.readFileSync(path.join(process.cwd(), './configs/', this.name + '.yaml'), 'utf-8'));
    } catch {};
    try {
      return yaml.parse(fs.readFileSync(path.join(process.cwd(), './configs/', this.name + '.yml'), 'utf-8'));
    } catch {};
    return {};
  }
  load(): any{
    try {
      this.store = this._loadConfig();
    } catch {
      this.store = this._loadDefault();
    }
    return this.store;
  }
  save(): void{
    try {
      fs.accessSync(configDir);
    } catch {
      fs.mkdirSync(configDir, {recursive: true});
    }
    return fs.writeFileSync(path.join(configDir, this.name + '.json'), this.encoder(this.store), 'utf-8');
  }
  reset(): any{
    this.store = this._loadDefault();
    this.save();
    return this.store;
  }
}
async function initConfig() {
  if (app) {
    configDir = path.join(app.getPath('home'), '.jonny', app.getName());
  } else {
    configDir = await ipcRenderer.invoke('getAppData');
  }
}
function getDefaultConfigDir() {
  return configDir;
}
export { Config, ConfigSync, initConfig, getDefaultConfigDir };
