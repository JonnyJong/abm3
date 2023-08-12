function findDropTarget(ev: DragEvent) {
  let path = ev.composedPath();
  for (const element of path) {
    if (typeof (element as any).dropHandler !== 'function') continue;
    return (element as HTMLElement);
  }
  return null;
}
export function initDrag() {
  document.addEventListener('dragover',(ev)=>{
    ev.preventDefault();
    let target = findDropTarget(ev);
    if (!target) {
      (ev.dataTransfer as DataTransfer).dropEffect = 'none';
      return;
    }
    (ev.dataTransfer as DataTransfer).dropEffect = 'copy';
  });
  document.addEventListener('drop', (ev)=>{
    ev.preventDefault();
    let target = findDropTarget(ev);
    if (!target) return;
    let file = ev.dataTransfer?.files[0];
    if (!file) return;
    if (file.path !== '') {
      (target as any).dropHandler({
        path: file.path,
        type: file.type,
      });
      return;
    }
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.addEventListener('load', (ev)=>{
      if (!ev.target?.result) return;
      (target as any).dropHandler({
        path: ev.target.result,
        type: (file as any).type,
      });
    });
  });
}
