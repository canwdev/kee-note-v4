export enum LdThemeType {
  SYSTEM = 0,
  LIGHT = 1,
  DARK = 2,
}

export const ldThemeOptions = [
  {
    label: 'Auto',
    value: LdThemeType.SYSTEM,
  },
  {
    label: 'Light',
    value: LdThemeType.LIGHT,
  },
  {
    label: 'Dark',
    value: LdThemeType.DARK,
  },
]

// 数据库打开历史记录
export type HistoryListItem = {
  dbPath: string
  keyPath: string
  // 最后打开的groupUuid，用于下次进入自动选中
  lastGroupUuid?: string
}
