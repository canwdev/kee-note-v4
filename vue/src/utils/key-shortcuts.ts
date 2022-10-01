// 注册键盘快捷键
import {isElectron} from '@/utils/backend'
import {copyToClipboard} from '@/utils/index'

export function registerKeyShortcuts() {
  // window.addEventListener('keydown', handleKey)
  window.addEventListener('click', handleClick)
}

export function unRegisterKeyShortcuts() {
  // window.removeEventListener('keydown', handleKey)
  window.removeEventListener('click', handleClick)
}

// function handleKey(event) {
//   if (event.ctrlKey || event.metaKey) {
//     switch (String.fromCharCode(event.which).toLowerCase()) {
//       case 'l':
//         event.preventDefault()
//         // setUnlocked()
//         break
//       default:
//         return
//     }
//   }
// }

function handleClick(event) {
  // 在外部打开链接
  if (isElectron) {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
      console.log(event.target.href)
      copyToClipboard(event.target.href)
      window.$message.info('Link copied to clipboard')
      event.preventDefault()
    }
  }
}
