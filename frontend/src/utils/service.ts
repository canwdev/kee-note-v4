import axios from 'axios'
import {LS_KEY_AUTHORIZATION} from '@/enum'
import {MyCrypt} from '@/utils/my-crypt'

function Service(config: any) {
  const {
    baseURL,
    withCredentials = false,
    timeout,
    headers,
    isAuth = true,
    isToast = true,
    isRawResponse = false,
    encryptionKey = import.meta.env.VITE_MY_ENCRYPT_KEY,
  } = config || {}

  let myCrypt: MyCrypt
  if (encryptionKey) {
    myCrypt = new MyCrypt(encryptionKey)
  }

  // 创建 axios 实例
  const service = axios.create({
    baseURL,
    withCredentials, // send cookies when cross-domain requests
    timeout, // request timeout
    headers, // 请求头部
  })

  // 请求 拦截器
  service.interceptors.request.use(
    (config) => {
      if (isAuth) {
        const Authorization = localStorage.getItem(LS_KEY_AUTHORIZATION)
        if (Authorization) {
          // @ts-ignore
          config.headers.Authorization = 'bearer ' + Authorization
        }
      }

      if (myCrypt) {
        // 加密请求
        // console.log('config1',config)
        if (/post/gi.test(<string>config.method) && config.data) {
          config.data = {
            ie: true,
            main: myCrypt.encrypt(JSON.stringify(config.data)),
          }
        }
        if (/get/gi.test(<string>config.method) && config.params) {
          // console.log(config.params)
          config.params = {
            ie: true,
            main: myCrypt.encrypt(JSON.stringify(config.params)),
          }
        }
      }

      return config
    },
    (error) => Promise.reject(error)
  )

  // 响应 拦截器
  service.interceptors.response.use(
    (response) => {
      if (isRawResponse) {
        return response
      }
      let {data} = response
      try {
        // 解密请求
        if (myCrypt && data.ie) {
          data = JSON.parse(myCrypt.decrypt(data.main))
          // console.log('dd', data)
        }
      } catch (error: any) {
        window.$message.error(error.message)
        return Promise.reject(error)
      }
      return data
    },
    (error) => {
      let message = error.message
      let backendMessage
      const {response} = error || {}

      // extract backend message
      if (response && response.data) {
        const {data} = response
        if (data.message) {
          backendMessage = data.message
        }
      }
      if (isToast) {
        if (backendMessage) {
          window.$notification.error({
            content: backendMessage,
            meta: message,
            duration: 3000,
            keepAliveOnHover: true,
          })
        } else {
          window.$message.error(message)
        }
      }
      return Promise.reject(error)
    }
  )

  return service
}

export default Service
