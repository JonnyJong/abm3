type SchemaBigint = {
  type: 'bigint',
  max?: BigInt,
  min?: BigInt,
  required?: boolean,
};
type SchemaBoolean = {
  type: 'boolean',
  value?: boolean,
  required?: boolean,
};
type SchemaFunction = {
  type: 'function',
  max?: number,
  min?: number,
  name?: string,
  arrow?: boolean,
  required?: boolean,
};
type SchemaNumber = {
  type: 'number',
  max?: number,
  min?: number,
  allowNaN?: boolean,
  allowInfinity?: boolean,
  required?: boolean,
};
type SchemaObject = {
  type: 'object',
  schema?: {
    [x: string | number | symbol]: Schema,
  },
  defaultName?: ('string' | 'number' | 'symbol')[]
  defaultSchema?: Schema,
  prototypes?: Function[]
  required?: boolean,
};
type SchemaTypes = {
  type: 'types',
  types: Schema[],
  required?: boolean,
};
type SchemaValues = {
  type: 'values',
  values: any[],
  required?: boolean,
};
type SchemaString = {
  type: 'string',
  disallowEmpty?: boolean,
  required?: boolean,
};
type SchemaSymbol = {
  type: 'symbol',
  valuse?: Symbol[],
  description?: string[],
  required?: boolean,
};
type SchemaUndefined = {
  type: 'undefined',
};
type SchemaArray = {
  type: 'array',
  schema?: Schema[],
  max?: number,
  min?: number,
  required?: boolean,
}
type SchemaSet = {
  type: 'set',
  schema?: Schema[],
  max?: number,
  min?: number,
  required?: boolean,
};
type SchemaMap = {
  type: 'map',
  schema?: {
    key: any,
    schema: Schema,
  }[],
  defaultName?: any[]
  defaultSchema?: Schema,
  required?: boolean,
};
type SchemaNaN = {
  type: 'NaN',
  required?: boolean,
};
type SchemaNull = {
  type: 'null',
  required?: boolean,
};
type SchemaElement = {
  type: 'element',
  properties?: {
    [x: string]: any[]
  },
  prototypes?: Function[],
  required?: boolean,
};
type SchemaAny = {
  type: 'any',
}
export type Schema = SchemaBigint | SchemaBoolean | SchemaFunction | SchemaNumber | SchemaObject | SchemaTypes | SchemaValues | SchemaString | SchemaSymbol | SchemaUndefined | SchemaArray | SchemaSet | SchemaMap | SchemaNaN | SchemaNull | SchemaElement | SchemaAny;
function isRequired(schema: Schema) {
  if (['any', 'undefined'].includes(schema.type)) return false;
  // @ts-ignore
  return !(schema.required !== undefined || schema.required !== true)
}
function baseCheck(obj: any, schema: SchemaBigint | SchemaBoolean | SchemaFunction | SchemaNumber | SchemaObject | SchemaString | SchemaSymbol, key: string) {
  let type = typeof obj;
  if (schema.required === true || schema.required === undefined) {
    if (type !== schema.type) throw new Error(`${key} is not ${schema.type}`);
  } else if (type !== schema.type && type !== 'undefined') {
    throw new Error(`${key} is not ${schema.type} or undefined`);
  }
}
function checkBigint(obj: any, schema: SchemaBigint, key: string) {
  baseCheck(obj, schema, key);
  if (typeof schema.max === 'bigint' && obj > schema.max) {
    throw new Error(`${key} is larger than ${schema.max}`);
  }
  if (typeof schema.min === 'bigint' && obj < schema.min) {
    throw new Error(`${key} is smaller than ${schema.min}`);
  }
}
function checkBoolean(obj: any, schema: SchemaBoolean, key: string) {
  baseCheck(obj, schema, key);
  if (typeof schema.value === 'boolean' && obj !== schema.value) {
    throw new Error(`${key} is not ${schema.value}`);
  }
}
function checkFunction(obj: any, schema: SchemaFunction, key: string) {
  baseCheck(obj, schema, key);
  let arrow = !('prototype' in obj);
  if (typeof schema.arrow === 'boolean' && schema.arrow !== arrow) {
    throw new Error(`${key} is ${schema.arrow ? 'not' : ''} a arrow function`);
  }
  if (arrow) return;
  if (typeof schema.max === 'number' && obj.length > schema.max) {
    throw new Error(`${key}'s arguments are more than ${schema.max}`);
  }
  if (typeof schema.min === 'number' && obj.length < schema.min) {
    throw new Error(`${key}'s arguments are less than ${schema.min}`);
  }
  if (typeof schema.name === 'string' && obj.name !== schema.name) {
    throw new Error(`${key}'s name is not ${schema.name}`);
  }
}
function checkNumber(obj: any, schema: SchemaNumber, key: string) {
  baseCheck(obj, schema, key);
  if (schema.allowNaN !== true && isNaN(obj)) {
    throw new Error(`${key} is NaN`);
  }
  if (schema.allowInfinity !== true && [Infinity, -Infinity].includes(obj)) {
    throw new Error(`${key} is Infinity`);
  }
  if (typeof schema.max === 'number' && obj > schema.max) {
    throw new Error(`${key} is larger than ${schema.max}`);
  }
  if (typeof schema.min === 'number' && obj < schema.min) {
    throw new Error(`${key} is smaller than ${schema.min}`);
  }
}
function checkObject(obj: any, schema: SchemaObject, key: string) {
  baseCheck(obj, schema, key);
  let prototypes = true;
  if (Array.isArray(schema.prototypes)) {
    prototypes = false;
    for (const prototype of schema.prototypes) {
      if (!(obj instanceof prototype)) continue;
      prototypes = true;
      break;
    }
  }
  if (!prototypes) throw new Error(`${key} can not match all prototype`);
  let required = new Set();
  if (schema.schema) {
    for (const name in schema.schema) {
      if (!Object.prototype.hasOwnProperty.call(schema.schema, name) || !isRequired(schema)) continue;
      required.add(name);
    }
  }
  for (const name in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, name)) continue;
    required.delete(name);
    if (!schema.schema || !schema.schema[name]) {
      // @ts-ignore
      if (Array.isArray(schema.defaultName) && !schema.defaultName.includes(typeof name)) {
        throw new Error(`${key}.${name}'s name's is wrong`);
      }
      if (schema.defaultSchema) {
        check(obj[name], schema.defaultSchema, 'key.' + name);
      }
      continue;
    }
    check(obj[name], schema.schema[name], 'key.' + name);
  }
  if (required.size > 0) throw new Error(`${key} don not have ${Array.from(required)}`);
}
function checkTypes(obj: any, schema: SchemaTypes, key: string) {
  if (isRequired(schema) && obj === undefined) throw new Error(`${key} is undefined.`);
  for (const type of schema.types) {
    try {
      check(obj, type, key);
      return;
    } catch {}
  }
  throw new Error(`${key} can not match all the schemas`);
}
function checkValues(obj: any, schema: SchemaValues, key: string) {
  if (isRequired(schema) && obj === undefined) throw new Error(`${key} is undefined.`);
  if (!schema.values.includes(obj)) {
    throw new Error(`${key} can not match all the values`);
  }
}
function checkString(obj: any, schema: SchemaString, key: string) {
  baseCheck(obj, schema, key);
  if (schema.disallowEmpty && obj === '') {
    throw new Error(`${key} is an empty string`);
  }
}
function checkSymbol(obj: any, schema: SchemaSymbol, key: string) {
  baseCheck(obj, schema, key);
  if (Array.isArray(schema.valuse) && !schema.valuse.includes(obj)) {
    throw new Error(`${obj} can not match all the values`);
  }
  if (Array.isArray(schema.description) && !schema.description.includes(obj.description)) {
    throw new Error(`${obj}'s description can not match`);
  }
}
function checkUndefined(obj: any, schema: SchemaUndefined, key: string) {
  if (typeof obj !== schema.type) throw new Error(`${key} is not ${schema.type}`);
}
function checkArray(obj: any, schema: SchemaArray, key: string) {
  if (isRequired(schema) && obj === undefined) throw new Error(`${key} is undefined.`);
  if (!Array.isArray(obj)) throw new Error(`${key} is not an array`);
  if (typeof schema.max === 'number' && obj.length > schema.max) {
    throw new Error(`${key}'s length is larger than ${schema.max}`);
  }
  if (typeof schema.min === 'number' && obj.length < schema.min) {
    throw new Error(`${key}'s length is larger than ${schema.min}`);
  }
  if (!Array.isArray(schema.schema) || schema.schema.length < 0) return;
  for (let i = 0; i < obj.length; i++) {
    for (const type of schema.schema) {
      check(obj[i], type, key + '[' + i + ']');
    }
  }
}
function checkSet(obj: any, schema: SchemaSet, key: string) {
  if (isRequired(schema) && obj === undefined) throw new Error(`${key} is undefined.`);
  if (typeof obj !== 'object' || !(obj instanceof Set)) throw new Error(`${key} is not a set`);
  if (typeof schema.max === 'number' && obj.size > schema.max) {
    throw new Error(`${key}'s size is larger than ${schema.max}`);
  }
  if (typeof schema.min === 'number' && obj.size < schema.min) {
    throw new Error(`${key}'s size is larger than ${schema.min}`);
  }
  if (!Array.isArray(schema.schema) || schema.schema.length < 0) return;
  obj.forEach((value)=>{
    // @ts-ignore
    for (const type of schema.schema) {
      check(value, type, key + '.value');
    }
  });
}
function checkMap(obj: any, schema: SchemaMap, key: string) {
  if (isRequired(schema) && obj === undefined) throw new Error(`${key} is undefined.`);
  if (typeof obj !== 'object' || !(obj instanceof Map)) throw new Error(`${key} is not a map`);
  let required = new Set();
  if (Array.isArray(schema.schema)) {
    for (const type of schema.schema) {
      if (!isRequired(type.schema)) continue;
      required.add(key);
    }
  }
  obj.forEach((value, name)=>{
    required.delete(name);
    if (!Array.isArray(schema.schema) || !schema.schema.find(name)) {
      if (Array.isArray(schema.defaultName) && !schema.defaultName.includes(typeof name)) {
        throw new Error(`${key}.${name}'s name's is wrong`);
      }
      if (schema.defaultSchema) {
        check(value, schema.defaultSchema, 'key.' + name);
      }
      return;
    }
    // @ts-ignore
    check(value, schema.schema.find(name), 'key.' + name);
  });
  if (required.size > 0) throw new Error(`${key} don not have ${Array.from(required)}`);
}
function checkNaN(obj: any, schema: SchemaNaN, key: string) {
  if (isRequired(schema) && obj === undefined) throw new Error(`${key} is undefined.`);
  if (!isNaN(obj)) throw new Error(`${key} is not NaN`);
}
function checkNull(obj: any, schema: SchemaNull, key: string) {
  if (isRequired(schema) && obj === undefined) throw new Error(`${key} is undefined.`);
  if (obj !== null) throw new Error(`${key} is not null`);
}
function checkElement(obj: any, schema: SchemaElement, key: string) {
  if (isRequired(schema) && obj === undefined) throw new Error(`${key} is undefined.`);
  if (typeof obj !== 'object' || (obj instanceof HTMLElement)) throw new Error(`${key} is not a HTMLElement`);
  let prototypes = true;
  if (Array.isArray(schema.prototypes)) {
    prototypes = false;
    for (const prototype of schema.prototypes) {
      if (!(obj instanceof prototype)) continue;
      prototypes = true;
      break;
    }
  }
  if (!prototypes) throw new Error(`${key} can not match all prototype`);
  if (!schema.properties) return;
  for (const name in schema.properties) {
    if (!Object.prototype.hasOwnProperty.call(schema.properties, name) || schema.properties[name].includes(obj[name])) continue;
    throw new Error(`${key}.${name} can not match`);
  }
}
function check(obj: any, schema: Schema, key: string) {
  switch (schema.type) {
    case 'bigint':
      return checkBigint(obj, schema, key);
    case 'boolean':
      return checkBoolean(obj, schema, key);
    case 'function':
      return checkFunction(obj, schema, key);
    case 'number':
      return checkNumber(obj, schema, key);
    case 'object':
      return checkObject(obj, schema, key);
    case 'types':
      return checkTypes(obj, schema, key);
    case 'values':
      return checkValues(obj, schema, key);
    case 'string':
      return checkString(obj, schema, key);
    case 'symbol':
      return checkSymbol(obj, schema, key);
    case 'undefined':
      return checkUndefined(obj, schema, key);
    case 'array':
      return checkArray(obj, schema, key);
    case 'set':
      return checkSet(obj, schema, key);
    case 'map':
      return checkMap(obj, schema, key);
    case 'NaN':
      return checkNaN(obj, schema, key);
    case 'null':
      return checkNull(obj, schema, key);
    case 'element':
      return checkElement(obj, schema, key);
    case 'any':
      return;
    default:
      // @ts-ignore
      throw new Error(`Unknown type '${schema.type}' in '${key}'`);
  }
}
export function isType(obj: any, schema: Schema) {
  check(obj, schema, 'obj');
}
