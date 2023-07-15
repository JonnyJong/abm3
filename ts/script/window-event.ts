import { ipcRenderer } from "electron";

export function initWindowEvent(){
  ipcRenderer.send('win:resized');
  ipcRenderer.on('win:focused',(_, focused)=>{
    if (focused) {
      document.body.classList.remove('blur');
    }else{
      document.body.classList.add('blur');
    }
  });
  ipcRenderer.on('win:resized', (_, maxmized)=>{
    if (maxmized) {
      document.body.classList.add('maxmized');
    }else{
      document.body.classList.remove('maxmized');
    }
  });

  document.querySelector('.window-minimize')?.addEventListener('click',()=>ipcRenderer.send('win:minimize'));
  document.querySelector('.window-resize')?.addEventListener('click',()=>{
    ipcRenderer.send('win:resize');
    document.body.classList.toggle('maxmized');
  });
  document.querySelector('.window-close')?.addEventListener('click',()=>ipcRenderer.send('win:close'));
}
