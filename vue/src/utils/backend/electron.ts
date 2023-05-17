export default {
  async post(url, params, options) {
    // console.log('post1', {url, params})
    try {
      window.$loadingBar.start()
      let res = await window.$electronAPI.ipcInvoke(url, params)
      if (options && options.responseType === 'blob') {
        // 模拟 axios 的blob文件下载
        res = new Blob([res])
      }
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
