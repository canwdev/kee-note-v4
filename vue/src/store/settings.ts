import {LdThemeType} from '@/enum/settings'

interface IStore {
  ldTheme: LdThemeType
  enableGlobalCss: boolean
  disableAnimation: boolean
  // Enable NaiveUI Theme Editor?
  isEnableThemeEdit: boolean
  // Save kdbx opened history?
  isSaveHistory: boolean
  historyList: any[]
  isCalendarView: boolean
  // 是否显示农历
  isCalendarShowLunar: boolean
  isSidebarCollapsed: boolean
}

export const useSettingsStore = defineStore('settingsStore', {
  state: (): IStore => {
    return {
      ldTheme: LdThemeType.SYSTEM,
      enableGlobalCss: false,
      disableAnimation: false,
      isEnableThemeEdit: false,
      isSaveHistory: true,
      historyList: [],
      isCalendarView: false,
      isCalendarShowLunar: true,
      isSidebarCollapsed: false,
    }
  },
  actions: {},
  persist: {
    key: 'ls_key_keenote_settings',
  },
})
