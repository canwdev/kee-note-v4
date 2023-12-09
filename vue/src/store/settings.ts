import {LdThemeType} from '@/enum/settings'

interface IStore {
  ldTheme: LdThemeType
  enableGlobalCss: boolean
  // Enable NaiveUI Theme Editor?
  isEnableThemeEdit: boolean
  // Save kdbx opened history?
  isSaveHistory: boolean
  historyList: any[]
  isCalendarView: boolean
  isSidebarCollapsed: boolean
}

export const useSettingsStore = defineStore('settingsStore', {
  state: (): IStore => {
    return {
      ldTheme: LdThemeType.SYSTEM,
      enableGlobalCss: false,
      isEnableThemeEdit: false,
      isSaveHistory: true,
      historyList: [],
      isCalendarView: false,
      isSidebarCollapsed: false,
    }
  },
  actions: {},
  persist: {
    key: 'ls_key_keenote_settings',
  },
})
