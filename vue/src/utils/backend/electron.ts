export default {
  async post(url, params) {
    console.log('post1', {url, params})
    try {
      window.$loadingBar.start()
      const res = await window.$electronAPI.ipcInvoke(url, params)
      window.$loadingBar.finish()
      return res
    } catch (error: any) {
      window.$notification.error({
        content: error.message,
        meta: 'Backend Message',
        duration: 3000,
        keepAliveOnHover: true,
      })
      window.$loadingBar.error()
      return Promise.reject(error)
    }
  },
}
