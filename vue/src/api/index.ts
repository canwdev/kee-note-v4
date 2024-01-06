import Service from '@/utils/service'
import {API_PROXY_BASE} from '@/enum'
export * as kService from './keepass'

const service = Service({
  baseURL: API_PROXY_BASE,
})

type UserLoginParam = {
  username: string | null
  password: string | null
}

export function getServerInfo() {
  return service.get('/hello')
}

export function setServerEnv(params) {
  return service.post('/set-env', params)
}

export function userLogin(params: UserLoginParam) {
  return service.post('/auth/login', params)
}

export function userProfile() {
  return service.get('/auth/profile')
}
