export const API_BASE_URL = import.meta.env.VITE_API_HOST || ''
export const API_PROXY_BASE = import.meta.env.VITE_PROXY_BASE || ''
export const isDev = import.meta.env.MODE === 'development'

export const getMyCryptKey = () => localStorage.getItem(LsKeys.LS_KEY_KN_HTTP_CRYPT_KEY)

export const LsKeys = {
  LS_KEY_AUTHORIZATION: 'ck_keenote_authorization',
  LS_KEY_KN_HTTP_CRYPT_KEY: 'ck_keenote_KN_HTTP_CRYPT_KEY',
  GLOBAL_STYLE: 'ck_keenote_global_style',
}

export const getLocalStorageObject = (key, fallback?) => {
  const str = localStorage.getItem(key)
  if (str) {
    return JSON.parse(str)
  }
  return fallback
}
export const setLocalStorageObject = (key, obj) => {
  localStorage.setItem(key, JSON.stringify(obj))
}

export const Palette = [
  {name: 'red', color: '#f44336'},
  {name: 'pink', color: '#e91e63'},
  {name: 'purple', color: '#9c27b0'},
  {name: 'deep-purple', color: '#673ab7'},
  {name: 'indigo', color: '#3f51b5'},
  {name: 'blue', color: '#2196f3'},
  {name: 'light-blue', color: '#03a9f4'},
  {name: 'cyan', color: '#00bcd4'},
  {name: 'teal', color: '#009688'},
  {name: 'green', color: '#4caf50'},
  {name: 'light-green', color: '#8bc34a'},
  {name: 'lime', color: '#cddc39'},
  {name: 'yellow', color: '#ffeb3b'},
  {name: 'amber', color: '#ffc107'},
  {name: 'orange', color: '#ff9800'},
  {name: 'deep-orange', color: '#ff5722'},
  {name: 'brown', color: '#795548'},
  {name: 'grey', color: '#9e9e9e'},
  {name: 'blue-grey', color: '#607d8b'},
  {name: 'white', color: '#ffffff'},
  {name: 'black', color: '#000000'},
]
