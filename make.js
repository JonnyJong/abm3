const electronPackager = require('electron-packager');
const path = require('path');

electronPackager({
  dir: __dirname,
  platform: ['win32', 'linux'],
  asar: true,
  icon: path.join(__dirname, './assets/icons/icon.ico'),
  ignore: (url)=>{
    console.log(url);
    return true;
  },
  out: path.join(__dirname, 'out'),
});
