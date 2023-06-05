type KeeStore = {
  isDbOpened: boolean
  recycleBinUuid: string | null
}

export const useKeeStore = defineStore('keeStore', {
  state: (): KeeStore => {
    return {
      isDbOpened: false,
      recycleBinUuid: null,
    }
  },
  actions: {},
})
