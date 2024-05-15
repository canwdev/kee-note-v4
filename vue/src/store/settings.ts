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

  // 是否启用日历
  isCalendarView: boolean
  // 一周开始的第一天index，-1表示自动
  calendarWeekIndex: number
  // 是否显示农历
  calendarShowLunar: boolean
  calendarShowTitle: boolean

  isSidebarCollapsed: boolean
  // 是否阻止截屏或录像App画面
  isContentProtection: boolean

  // 自动保存
  enableAutoSave: boolean
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

      isCalendarView: true,
      calendarWeekIndex: -1,
      calendarShowLunar: true,
      calendarShowTitle: true,

      isSidebarCollapsed: false,
      isContentProtection: true,

      enableAutoSave: true,
    }
  },
  actions: {},
  persist: {
    key: 'ls_key_keenote_settings',
  },
})
