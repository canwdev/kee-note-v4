export default {
  async post(url, params) {
    console.log('post1', {url, params})
    try {
      return await window.$electronAPI.ipcInvoke(url, params)
    } catch (error: any) {
      window.$notification.error({
        content: error.message,
        meta: 'message',
        duration: 3000,
        keepAliveOnHover: true,
      })
      return Promise.reject(error)
    }
  },
}
