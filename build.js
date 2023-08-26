const CleanCSS = require("clean-css");
const { writeFileSync, readFileSync, readdirSync } = require("fs");
const path = require("path");
const { renderFile } = require("pug");
const stylus = require("stylus");
const yaml = require('yaml');

// layout
try {
  writeFileSync('./layout/index.html', renderFile('./layout/index.pug'), 'utf-8');
} catch (error) {
  console.error(error);
}

// style
try {
  writeFileSync('./style/main.css', new CleanCSS().minify(stylus.render(readFileSync('./style/main.styl', 'utf-8'), {
    paths: ['./style'],
    filename: 'main.styl',
  })).styles, 'utf-8');
} catch (error) {
  console.error(error);
}

// yaml
function generateYaml(dir) {
  let configList = readdirSync(dir, { withFileTypes: true });
  configList.forEach((dirent)=>{
    if (!dirent.isFile()) return;
    if(!['.yml','.yaml'].includes(path.extname(dirent.name))) return;
    try {
      writeFileSync(path.join(dir, path.parse(dirent.name).name + '.json'), JSON.stringify(yaml.parse(readFileSync(path.join(dir, dirent.name), 'utf-8'))), 'utf-8');
    } catch (error) {
      console.error(error);
    }
  });
}
generateYaml('./configs');
generateYaml('./locales');
