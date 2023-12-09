type Main = {
  isAppDarkMode: boolean
}

export const useMainStore = defineStore('mainStore', {
  state: (): Main => {
    return {
      isAppDarkMode: true,
    }
  },
  actions: {},
})
