<script lang="ts">
import {darkTheme, GlobalThemeOverrides, NDialogProvider, NNotificationProvider} from 'naive-ui'
import AppContent from './AppContent.vue'
import {getUserTheme, LsKeys, ThemeType} from '@/enum'
import {NThemeEditor, NConfigProvider, NLoadingBarProvider, NMessageProvider} from 'naive-ui'
import {useLocalStorageBoolean} from '@/hooks/use-local-storage'

export default defineComponent({
  setup() {
    const getSystemIsDarkMode = () =>
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const isEnableThemeEdit = useLocalStorageBoolean(LsKeys.LS_KEY_ENABLE_THEME_EDITOR)

    let isSystemDarkMode = ref(true)

    const handleThemeChange = (val: ThemeType) => {
      if (val === ThemeType.SYSTEM) {
        isSystemDarkMode.value = getSystemIsDarkMode()
      } else if (val === ThemeType.LIGHT) {
        isSystemDarkMode.value = false
      } else if (val === ThemeType.DARK) {
        isSystemDarkMode.value = true
      }
    }

    handleThemeChange(getUserTheme())

    const handleSystemThemeChange = (event: any) => {
      if (getUserTheme() === ThemeType.SYSTEM) {
        isSystemDarkMode.value = Boolean(event.matches)
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
      isSystemDarkMode,
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
        theme: this.isSystemDarkMode ? this.darkTheme : null,
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
