import { watch } from "chokidar";
import { ProtocolRequest, ProtocolResponse, WebContents, app } from "electron";
import { readFileSync } from "fs";
import path from "path";
import stylus from "stylus";

export function portocolHandler(file: string, request: ProtocolRequest, callback: (response: (Buffer) | (ProtocolResponse)) => void) {
  return callback({data: Buffer.from(render(file)), mimeType:'text/css'});
}

export function render(file: string) {
  let content = readFileSync(file, 'utf-8');
  return stylus.render(content, {
    paths: [path.dirname(file)],
    filename: path.basename(file),
  });
}

async function updateStyle(file: string, webContents: WebContents, key: string) {
  setTimeout(() => {
    webContents.removeInsertedCSS(key);
  }, 10);
  return await webContents.insertCSS(render(file));
}

export async function insert(file: string, webContents: WebContents, dir: string = path.join(process.cwd(), 'style')) {
  let key = await webContents.insertCSS(render(file));
  let timer: NodeJS.Timeout | null = null
  function debounce() {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(async ()=>{
      key = await updateStyle(file, webContents, key);
      timer = null;
    }, 100);
  }
  // watch(dir, debounce);
  let watcher = watch(dir);
  watcher.on('ready', ()=>{
    watcher.on('all', debounce);
  });
  webContents.on('did-start-loading', debounce);
  app.on('will-quit', ()=>watcher.close());
}

export default{
  portocolHandler,
  render,
  insert,
};
