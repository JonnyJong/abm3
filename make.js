const electronPackager = require('electron-packager');
const path = require('path');

const IGNORES = [
  '/ts',
  '/out',
  '/.git',
  '/.vscode',
  '/LICENSE',
  '/readme.md',
  '/layout/index.pug',
  '/layout/includes',
  '/build.js',
  '/make.js',
  '/scripts/ui/markdown',
  '/layout/ui/component',
  '/layout/ui/markdown',
];

const reg = new RegExp('^(' + IGNORES.join('|').replace(/\//g, '\\/').replace(/\./g, '\\.') + ').*');

electronPackager({
  dir: __dirname,
  platform: ['win32', 'linux'],
  asar: true,
  icon: path.join(__dirname, './assets/icons/icon.ico'),
  ignore: (url)=>{
    if (url.match(reg)) return true;
    if (['/style','/configs','/locales'].includes(url)) return false;
    if (url.indexOf('/style') === 0) {
      return url !== '/style/main.css';
    }
    if (url.indexOf('/configs') === 0 || url.indexOf('/locales') === 0) {
      return url.split('.').pop() !== 'json';
    }
    return false;
  },
  out: path.join(__dirname, 'out'),
  electronZipDir: path.join(__dirname, '../electron'),
  overwrite: true,
});
