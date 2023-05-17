import {useMainStore} from '@/store/main-store'
import {isElectron} from '@/utils/backend'
import {copyToClipboard} from '@/utils'

function handleClick(event) {
  // 在外部打开链接
  if (isElectron) {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
      // console.log(event.target.href)
      copyToClipboard(event.target.href)
      window.$message.info('Link copied to clipboard')
      event.preventDefault()
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
