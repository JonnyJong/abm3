import { ProtocolRequest, ProtocolResponse, app, protocol } from "electron";
import { readFileSync } from "fs";
import path from "path";
import { parse } from "url";
import mine from "mime";

type PortocolHandler = (file: string, request: ProtocolRequest, callback: (response: (Buffer) | (ProtocolResponse)) => void) => void;

function getPath(url: string) {
  let parsed = parse(url);
  let result = decodeURIComponent((parsed.pathname as string));
  if (process.platform === 'win32' && !parsed.host?.trim()) {
    result = result.substring(1);
  }
  return result;
}

let extensions: {
  [x: string]: PortocolHandler
} = {};

app.on('ready', ()=>{
  protocol.interceptBufferProtocol('file', (req, callback)=>{
    let file = getPath(req.url);
    try {
      let ext = path.extname(file).slice(1);
      if (!extensions[ext]) {
        let content = readFileSync(file);
        let mime = mine.getType(ext);
        if (!mime) {
          mime = 'text/plain';
        }
        return callback({data: content, mimeType: mime});
      }
      extensions[ext](file, req, callback);
    } catch (error) {
      // @ts-ignore
      return callback(error);
    }
  });
});

export function registeProtocol(ext: string, handler: PortocolHandler) {
  extensions[ext] = handler;
}
