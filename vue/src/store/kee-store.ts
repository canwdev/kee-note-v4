type KeeStore = {
  isDbOpened: boolean
}

export const useKeeStore = defineStore('keeStore', {
  state: (): KeeStore => {
    return {
      isDbOpened: false,
    }
  },
  actions: {},
})
