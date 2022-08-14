type KeeStore = {
  currentGroupUuid: string | null
}

export const useKeeStore = defineStore('keeStore', {
  state: (): KeeStore => {
    return {
      currentGroupUuid: null,
    }
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    setCurrentGroupUuid(uuid: string | null) {
      this.currentGroupUuid = uuid
    },
  },
})
