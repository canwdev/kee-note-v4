type KeeStore = {
  isDbOpened: boolean
  recycleBinUuid: string | null
  // if editing, set detailUuid
  detailUuid: string | null
}

export const useKeeStore = defineStore('keeStore', {
  state: (): KeeStore => {
    return {
      isDbOpened: false,
      recycleBinUuid: null,
      detailUuid: null,
    }
  },
  actions: {},
})
