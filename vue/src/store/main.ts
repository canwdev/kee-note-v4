type Main = {
  isAppDarkMode: boolean
  isServerRunning: boolean
}

export const useMainStore = defineStore('mainStore', {
  state: (): Main => {
    return {
      isAppDarkMode: true,
      isServerRunning: false,
    }
  },
  actions: {},
})
