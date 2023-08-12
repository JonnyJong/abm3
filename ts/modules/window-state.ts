import { BrowserWindow } from "electron";
import { ConfigSync } from "./config";

class WindowState{
  win: BrowserWindow;
  config: ConfigSync;
  constructor(window: BrowserWindow) {
    this.win = window;
    this.config = new ConfigSync('window-state');
    this.win.on('resized', ()=>this.save());
    this.win.on('moved', ()=>this.save());
    this.win.on('maximize', ()=>this.save());
    this.win.on('restore', ()=>this.save());
  }
  save(){
    if (this.win.isMaximized()) {
      this.config.store.maxmized = true;
    } else {
      let rect = this.win.getBounds();
      this.config.store = {
        height: rect.height,
        width: rect.width,
        x: rect.x,
        y: rect.y,
        maxmized: false,
      };
    }
    this.config.save();
  }
  show(){
    this.win.setSize(this.config.store.width, this.config.store.height, false);
    this.win.setPosition(this.config.store.x, this.config.store.y, false);
    if (this.config.store.maxmized) {
      return this.win.maximize();
    }
    this.win.show();
  }
}

export { WindowState };
export default WindowState;
