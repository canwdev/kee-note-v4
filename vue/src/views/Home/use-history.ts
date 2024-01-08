import {HistoryListItem} from '@/enum/settings'
import {useSettingsStore} from '@/store/settings'

export const useHistory = () => {
  const settingsStore = useSettingsStore()

  // 更新历史记录
  const updateHistory = (options: any = {}) => {
    const {dbPath = '', keyPath = ''} = options
    if (!settingsStore.isSaveHistory) {
      return
    }
    const historyList = [...settingsStore.historyList]
    const idx = historyList.findIndex((item: any) => item.dbPath === dbPath)
    let newItem: HistoryListItem = {
      dbPath,
      keyPath,
    }
    // 删除旧的
    if (idx > -1) {
      const oldItem = historyList[idx]
      newItem = {
        ...newItem,
        // 保留旧的lastGroupUuid，
        lastGroupUuid: oldItem.lastGroupUuid,
      }
      historyList.splice(idx, 1)
    }
    // 放置新的
    historyList.unshift(newItem)
    settingsStore.historyList = historyList
    settingsStore.lastOpenedHistoryItem = newItem

    return newItem
  }

  const loadFirstHistory = () => {
    const historyList = settingsStore.historyList
    if (historyList.length > 0) {
      return historyList[0]
    }
  }

  return {
    updateHistory,
    loadFirstHistory,
  }
}
