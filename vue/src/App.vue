<script lang="ts">
import {darkTheme, GlobalThemeOverrides, NDialogProvider, NNotificationProvider} from 'naive-ui'
import AppContent from './AppContent.vue'
import {getUserTheme, LsKeys, ThemeType} from '@/enum'
import {NThemeEditor, NConfigProvider, NLoadingBarProvider, NMessageProvider} from 'naive-ui'
import {useLocalStorageBoolean} from '@/hooks/use-local-storage'
import {useMainStore} from '@/store/main-store'

export default defineComponent({
  setup() {
    const getSystemIsDarkMode = () =>
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const isEnableThemeEdit = useLocalStorageBoolean(LsKeys.LS_KEY_ENABLE_THEME_EDITOR)
    const mainStore = useMainStore()

    const handleThemeChange = (val: ThemeType) => {
      if (val === ThemeType.SYSTEM) {
        mainStore.isAppDarkMode = getSystemIsDarkMode()
      } else if (val === ThemeType.LIGHT) {
        mainStore.isAppDarkMode = false
      } else if (val === ThemeType.DARK) {
        mainStore.isAppDarkMode = true
      }
    }

    handleThemeChange(getUserTheme())

    const handleSystemThemeChange = (event: any) => {
      if (getUserTheme() === ThemeType.SYSTEM) {
        mainStore.isAppDarkMode = Boolean(event.matches)
      }
    }

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

    const themeOverrides: GlobalThemeOverrides = {
      common: {
        borderRadiusSmall: '4px',
        borderRadius: '8px',
      },
    }
    return {
      mainStore,
      handleThemeChange,
      themeOverrides,
      darkTheme,
      isEnableThemeEdit,
    }
  },
  render() {
    const contentVNode = h(
      NConfigProvider,
      {
        theme: this.mainStore.isAppDarkMode ? this.darkTheme : null,
        'theme-overrides': this.themeOverrides,
      },
      {
        default: () =>
          h(NLoadingBarProvider, null, {
            default: () =>
              h(NDialogProvider, null, {
                default: () =>
                  h(
                    NNotificationProvider,
                    {
                      placement: 'bottom-left',
                    },
                    {
                      default: () =>
                        h(
                          NMessageProvider,
                          {
                            placement: 'bottom',
                          },
                          {
                            default: () =>
                              h(AppContent, {
                                onThemeChange: this.handleThemeChange,
                              }),
                          }
                        ),
                    }
                  ),
              }),
          }),
      }
    )
    if (this.isEnableThemeEdit) {
      return h(NThemeEditor, null, {
        default: () => contentVNode,
      })
    }
    return contentVNode
  },
})
</script>
