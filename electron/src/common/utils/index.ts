import * as fs from 'fs-extra'
import * as kdbxweb from 'kdbxweb'

export async function readFileAsArrayBuffer(path) {
  const file = await fs.readFile(path)
  return new Uint8Array(file).buffer
}

export async function saveFileFromArrayBuffer(path, arrayBuffer) {
  await fs.writeFile(path, Buffer.from(arrayBuffer))
}

/**
 * 安全地获取嵌套对象的值
 * @param obj 对象
 * @param path 键值数组
 * @param fallback 获取失败的返回值
 */
export function getVal(obj, path, fallback) {
  try {
    let i
    const len = path.length
    for (i = 0; typeof obj === 'object' && i < len; ++i) {
      obj = obj[path[i]]
    }
    return obj || fallback
  } catch (e) {
    return fallback
  }
}

export function getValDot(obj, strPath, fallback) {
  const path = strPath.split('.')
  return getVal(obj, path, fallback)
}

export function setVal(obj, path, val) {
  let i
  const len = path.length - 1
  for (i = 0; typeof obj === 'object' && i < len; ++i) {
    obj = obj[path[i]]
  }

  if (obj instanceof Map) {
    obj.set(path[len], val)
  } else {
    obj[path[len]] = val
  }
}

export function setValDot(obj, strPath, val) {
  const path = strPath.split('.')
  return setVal(obj, path, val)
}

export const isDev = process.env.NODE_ENV === 'development'

export function getMapValue(obj, val) {
  if (obj instanceof Map) {
    return obj.get(val)
  }
  return obj[val]
}

export function getFieldString(entry, field) {
  const val = entry.fields.get(field)
  if (!val) {
    return ''
  }
  if (val instanceof kdbxweb.ProtectedValue) {
    return val.getText()
  }
  return val.toString()
}
