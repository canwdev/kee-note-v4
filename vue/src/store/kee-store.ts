type KeeStore = {
  isDbOpened: boolean
  recycleBinUuid: string | null
  // if editing, set detailUuid
  detailUuid: string | null
  // 前端本地是否有未保存的修改
  isChanged: boolean
}

export const useKeeStore = defineStore('keeStore', {
  state: (): KeeStore => {
    return {
      isDbOpened: false,
      recycleBinUuid: null,
      detailUuid: null,
      isChanged: false,
    }
  },
  actions: {},
})
