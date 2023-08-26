export function shuffle (arr: any[]) {
  let m = arr.length
  let index
  let tmp
  while (m > 1) {
    index = Math.floor(Math.random() * m--)
    tmp = arr[m]
    arr[m] = arr[index]
    arr[index] = tmp
  }
  return arr;
}
