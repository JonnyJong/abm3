import { access, mkdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";

export function getImgSuffix(data: Buffer): string {
  const imgBufHeaders = [
    { bufBegin: [0x42, 0x4d], suffix: 'bmp' },
    { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], suffix: 'gif' },
    { bufBegin: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], suffix: 'gif' },
    { bufBegin: [0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x20, 0x20], suffix: 'ico' },
    { bufBegin: [0xff, 0xd8], bufEnd: [0xff, 0xd9], suffix: 'jpg' },
    { bufBegin: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], suffix: 'png' },
    { bufBegin: [0x3c, 0x73, 0x76, 0x67], suffix: 'svg' },
    { bufBegin: [0x49, 0x49], suffix: 'tif' },
    { bufBegin: [0x4d, 0x4d], suffix: 'tif' },
    { bufBegin: [0x52, 0x49, 0x46, 0x46], suffix: 'webp' },
  ];
  for (const imgBufHeader of imgBufHeaders) {
    let isEqual;
    if (imgBufHeader.bufBegin) {
      const buf = Buffer.from(imgBufHeader.bufBegin);
      isEqual = buf.equals(data.subarray(0, imgBufHeader.bufBegin.length));
    }
    if (isEqual && imgBufHeader.bufEnd) {
      const buf = Buffer.from(imgBufHeader.bufEnd);
      isEqual = buf.equals(data.subarray(-imgBufHeader.bufEnd.length));
    }
    if (isEqual) {
      return imgBufHeader.suffix;
    }
  }
  return '';
}

async function getData(url: string) {
  try {
    if ((await stat(url)).isFile()) {
      return readFile(url);
    } 
  }catch{}
  try {
    let res = await fetch(url);
    let buffer = await res.arrayBuffer();
    return Buffer.from(buffer);
  }catch{}
  throw new Error(`Can not get anything from '${url}'`);
}

export async function download(url: string, outDir: string): Promise<string> {
  try {
    let data = await getData(url);
    let shffix = getImgSuffix(data);
    if (shffix === '') throw new Error(`'${url}' is not an image.`);
    let name = Date.now() + '.' + shffix;
    try {
      await access(outDir);
    } catch {
      await mkdir(outDir);
    }
    await writeFile(path.join(outDir, name), data);
    return name;
  } catch {
    return '';
  }
}
