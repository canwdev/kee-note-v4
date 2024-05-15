/* ----- electron common api ----- */
import service from '@/utils/backend'

export const electronCommonApi = {
  electronOpenFileDialog: (params: any) => {
    return service.post('open-file-dialog', params)
  },
  electronOpenSaveDialog: (params: any) => {
    return service.post('open-save-dialog', params)
  },
  electronToggleServer: (params: any) => {
    return service.post('toggle-server', params)
  },
  electronOpenLink: (params: any) => {
    return service.post('open-link', params)
  },
  electronCloseWindow: () => {
    return service.post('close-window')
  },
  electronSetContentProtection: (params: any) => {
    return service.post('set-content-protection', params)
  },
}
