<script lang="ts">
import {darkTheme, GlobalThemeOverrides, NDialogProvider, NNotificationProvider} from 'naive-ui'
import AppContent from './AppContent.vue'
import {NThemeEditor, NConfigProvider, NLoadingBarProvider, NMessageProvider} from 'naive-ui'
import {useGlobalTheme} from './hooks/use-global-theme'
import {useLocalStorageBoolean} from '@/hooks/use-local-storage'
import {LsKeys} from '@/enum'
import {useGlobalShortcuts} from '@/hooks/use-global-shortcuts'

export default defineComponent({
  setup() {
    const themeOverrides: GlobalThemeOverrides = {
      common: {
        // borderRadiusSmall: '4px',
        // borderRadius: '4px',
        primaryColor: '#189BA0FF',
        primaryColorHover: '#36ADA9FF',
        primaryColorPressed: '#0C7A71FF',
        primaryColorSuppl: '#36AD95FF',
      },
    }
    const isEnableThemeEdit = useLocalStorageBoolean(LsKeys.LS_KEY_ENABLE_THEME_EDITOR)
    useGlobalShortcuts()
    return {
      ...useGlobalTheme(),
      themeOverrides,
      isEnableThemeEdit,
    }
  },
  render() {
    const contentVNode = h(
      NConfigProvider,
      {
        theme: this.isAppDarkMode ? darkTheme : null,
        'theme-overrides': this.themeOverrides,
      },
      {
        default: () =>
          h(
            NLoadingBarProvider,
            {
              loadingBarStyle: {
                loading: {
                  opacity: 0.4,
                },
              },
            },
            {
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
                              placement: 'top',
                            },
                            {
                              default: () => h(AppContent),
                            }
                          ),
                      }
                    ),
                }),
            }
          ),
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
