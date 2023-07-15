import { ProtocolRequest, ProtocolResponse, WebContents } from "electron";
import { readFileSync, watch } from "fs";
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
  try {
    await webContents.removeInsertedCSS(key);
  } catch {}
  try {
    return await webContents.insertCSS(render(file));
  } catch {}
  return '';
}

export async function insert(file: string, webContents: WebContents, dir: string = path.join(process.cwd(), 'style')) {
  let key = '';
  try {
    key = await webContents.insertCSS(render(file));
  } catch {}
  watch(dir, async ()=>{
    key = await updateStyle(file, webContents, key);
  });
  webContents.on('dom-ready', async ()=>{
    key = await updateStyle(file, webContents, key);
  });
}

export default{
  portocolHandler,
  render,
  insert,
};
