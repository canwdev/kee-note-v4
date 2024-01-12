type DbInfo = {
  header: {
    compression: number
    crsAlgorithm: number
    endPos: number
    versionMajor: number
    versionMinor: number
  }
  dbPath: string
  meta: {
    name: string
    recycleBinEnabled: boolean
    recycleBinUuid: {
      id: string | null
    }
  }
}

type KeeStore = {
  isDbOpened: boolean
  dbInfo: DbInfo | null
  // if editing, set detailUuid
  detailUuid: string | null
  // 前端本地是否有未保存的修改
  isChanged: boolean
}

export const useKeeStore = defineStore('keeStore', {
  state: (): KeeStore => {
    return {
      isDbOpened: false,
      dbInfo: null,
      detailUuid: null,
      isChanged: false,
    }
  },
  getters: {
    recycleBinUuid: (state): string | null => {
      if (state.dbInfo) {
        return state.dbInfo.meta?.recycleBinUuid?.id || null
      }
      return null
    },
  },
  actions: {},
})
