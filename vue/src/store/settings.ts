import {HistoryListItem, LdThemeType} from '@/enum/settings'

interface IStore {
  ldTheme: LdThemeType
  // 主题色
  themeColor: string
  enableGlobalCss: boolean
  disableAnimation: boolean
  // Enable NaiveUI Theme Editor?
  isEnableThemeEdit: boolean

  // Save kdbx opened history?
  isSaveHistory: boolean
  historyList: HistoryListItem[]
  lastOpenedHistoryItem: HistoryListItem | null

  isCalendarView: boolean
  // 是否显示农历
  calendarShowLunar: boolean
  calendarShowTitle: boolean

  isSidebarCollapsed: boolean
}

export const useSettingsStore = defineStore('settingsStore', {
  state: (): IStore => {
    return {
      ldTheme: LdThemeType.SYSTEM,
      themeColor: '#189BA0',
      enableGlobalCss: false,
      disableAnimation: false,
      isEnableThemeEdit: false,

      isSaveHistory: true,
      historyList: [],
      lastOpenedHistoryItem: null,

      isCalendarView: false,
      calendarShowLunar: true,
      calendarShowTitle: true,

      isSidebarCollapsed: false,
    }
  },
  actions: {},
  persist: {
    key: 'ls_key_keenote_settings',
  },
})
