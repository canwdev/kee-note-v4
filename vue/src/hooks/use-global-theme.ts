import {useSettingsStore} from '@/store/settings'
import {LdThemeType} from '@/enum/settings'

import {useMainStore} from '@/store/main'
import {LsKeys} from '@/enum'
import {createOrFindStyleNode} from '@/utils/dom'

const getSystemIsDarkMode = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

export const useGlobalTheme = () => {
  const mainStore = useMainStore()
  const settingsStore = useSettingsStore()

  const handleThemeChange = (val: LdThemeType) => {
    if (val === LdThemeType.SYSTEM) {
      mainStore.isAppDarkMode = getSystemIsDarkMode()
    } else if (val === LdThemeType.LIGHT) {
      mainStore.isAppDarkMode = false
    } else if (val === LdThemeType.DARK) {
      mainStore.isAppDarkMode = true
    }
    settingsStore.ldTheme = val
  }

  handleThemeChange(settingsStore.ldTheme)

  const handleSystemThemeChange = (event: any) => {
    if (settingsStore.ldTheme === LdThemeType.SYSTEM) {
      mainStore.isAppDarkMode = Boolean(event.matches)
    }
  }

  watch(() => settingsStore.ldTheme, handleThemeChange)

  onMounted(() => {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', handleSystemThemeChange)
  })

  onBeforeUnmount(() => {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .removeEventListener('change', handleSystemThemeChange)
  })

  const isAppDarkMode = computed(() => mainStore.isAppDarkMode)

  return {
    isAppDarkMode,
  }
}

/**
 * 使用全局样式
 */
export const useGlobalStyle = () => {
  const styleEl = ref<HTMLElement | null>(null)
  const globalStyleText = ref('')
  const settingsStore = useSettingsStore()

  const applyGlobalStyle = () => {
    if (styleEl.value) {
      if (settingsStore.enableGlobalCss) {
        styleEl.value.innerHTML = globalStyleText.value
        localStorage.setItem(LsKeys.GLOBAL_STYLE, globalStyleText.value)
      } else {
        styleEl.value.innerHTML = ''
      }
    }
  }

  watch(
    () => settingsStore.enableGlobalCss,
    (val) => {
      applyGlobalStyle()
    }
  )

  onMounted(() => {
    styleEl.value = createOrFindStyleNode(LsKeys.GLOBAL_STYLE)
    globalStyleText.value =
      localStorage.getItem(LsKeys.GLOBAL_STYLE) || 'body {font-family: "LXGW WenKai", "楷体";}'

    applyGlobalStyle()
  })

  return {
    globalStyleText,
    applyGlobalStyle,
  }
}
