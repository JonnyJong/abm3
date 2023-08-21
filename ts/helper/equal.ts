function checkNormal(a: any, b: any) {
  if (typeof a === 'number' && isNaN(a) && typeof b === 'number' && isNaN(b)) {
    return true;
  }
  return a === b;
}

function checkArray(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (equal(a[i], b[i])) continue;
    return false;
  }
  return true;
}

function checkSet(a: Set<any>, b: Set<any>): boolean {
  if (a.size !== b.size) return false;
  /* for (const item of a) {
    if (b.has(item)) continue;
    return false;
  } */
  CHECK_A: for (const itemA of a) {
    for (const itemB of b) {
      if (equal(itemA, itemB)) {
        continue CHECK_A;
      }
    }
    return false;
  }
  return true;
}

function checkMap(a: Map<any, any>, b: Map<any, any>): boolean {
  if (a.size !== b.size) return false;
  /* for (const item of a) {
    if (!b.has(item[0])) return false;
    if (!equal(item[1], b.get(item[0]))) return false;
  } */
  CHECK_A: for (const itemA of a) {
    for (const itemB of b) {
      if (!equal(itemA[0], itemB[0])) continue;
      if (!equal(itemA[1], itemB[1])) continue;
      continue CHECK_A;
    }
    return false;
  }
  return true;
}

function checkObject(a: any, b: any): boolean {
  let keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  for (const key of keys) {
    if (equal(a[key], b[key])) continue;
    return false;
  }
  return true;
}

export function equal(a: any, b: any): boolean {
  if (typeof a !== 'object' || typeof b !== 'object') {
    return checkNormal(a, b);
  }
  let aIsArray = Array.isArray(a);
  let bIsArray = Array.isArray(b);
  if (aIsArray !== bIsArray) {
    return false;
  }
  if (aIsArray && bIsArray) {
    return checkArray(a, b);
  }
  let aIsSet = a instanceof Set;
  let bIsSet = b instanceof Set;
  if (aIsSet !== bIsSet) {
    return false;
  }
  if (aIsSet && bIsSet) {
    return checkSet(a, b);
  }
  let aIsMap = a instanceof Map;
  let bIsMap = b instanceof Map;
  if (aIsMap !== bIsMap) {
    return false;
  }
  if (aIsMap && bIsMap) {
    return checkMap(a, b);
  }
  return checkObject(a, b);
}
