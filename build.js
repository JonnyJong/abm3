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
function generateYaml(dir, createManifest) {
  let configList = readdirSync(dir, { withFileTypes: true });
  let manifest = [];
  configList.forEach((dirent)=>{
    if (!dirent.isFile()) return;
    if(!['.yml','.yaml'].includes(path.extname(dirent.name))) return;
    let name = path.parse(dirent.name).name;
    if (createManifest) manifest.push(name);
    try {
      writeFileSync(path.join(dir, name + '.json'), JSON.stringify(yaml.parse(readFileSync(path.join(dir, dirent.name), 'utf-8'))), 'utf-8');
    } catch (error) {
      console.error(error);
    }
  });
  if (!createManifest) return;
  manifest.sort();
  writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest), 'utf-8');
}
generateYaml('./configs');
generateYaml('./locales', true);
