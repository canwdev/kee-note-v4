import {useMainStore} from '@/store/main'
import {isElectron} from '@/utils/backend'
import {copyToClipboard} from '@/utils'
import {electronOpenLink} from '@/api/keepass'

function handleClick(event) {
  // 在外部打开链接
  if (isElectron) {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
      // console.log(event.target.href)
      event.preventDefault()
      electronOpenLink({url: event.target.href})
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
