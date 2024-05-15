import {isElectron} from '@/utils/backend'

import {electronCommonApi} from '@/api/electron'

function handleClick(event) {
  // 在外部打开链接
  if (isElectron) {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
      // console.log(event.target.href)
      event.preventDefault()
      electronCommonApi.electronOpenLink({url: event.target.href})
    }
  }
}
export const useGlobalShortcuts = () => {
  onMounted(() => {
    window.addEventListener('click', handleClick)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('click', handleClick)
  })
}
