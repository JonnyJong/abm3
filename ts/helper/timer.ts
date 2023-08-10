export function timer(time: number) {
  return new Promise<void>((resolve)=>{
    setTimeout(()=>resolve(), time);
  });
}
