function washArray(obj: any[]): any {
  let array = [];
  for (const item of obj) {
    array.push(wash(item));
  }
  return array;
}

function washSet(obj: Set<any>): any {
  let set = new Set();
  for (const item of obj) {
    set.add(wash(item));
  }
  return set;
}

function washMap(obj: Map<any,any>): any {
  let map = new Map();
  for (const item of obj) {
    map.set(wash(item[0]), wash(item[1]));
  }
  return map;
}

function washObject(obj: any): any {
  let object: any = {};
  for (const key of Object.keys(obj)) {
    object[key] = wash(obj[key]);
  }
  return object;
}

export function wash<T>(obj: any) {
  if (typeof obj !== 'object') return obj as T;
  if (Array.isArray(obj)) {
    return washArray(obj) as T;
  }
  if (obj instanceof Set) {
    return washSet(obj) as T;
  }
  if (obj instanceof Map) {
    return washMap(obj) as T;
  }
  return washObject(obj) as T;
}
