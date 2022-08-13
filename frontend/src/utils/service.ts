import axios from 'axios'
import {LS_KEY_AUTHORIZATION} from '@/enum'

function Service(config: any) {
  const {
    baseURL,
    withCredentials = false,
    timeout,
    headers,
    isAuth = true,
    isToast = true,
    isRawResponse = false,
  } = config || {}

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
      return response.data
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
