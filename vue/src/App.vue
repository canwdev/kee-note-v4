<script lang="ts">
import {darkTheme, GlobalThemeOverrides, NDialogProvider, NNotificationProvider} from 'naive-ui'
import AppContent from './AppContent.vue'
import {NThemeEditor, NConfigProvider, NLoadingBarProvider, NMessageProvider} from 'naive-ui'
import {useGlobalTheme} from './hooks/use-global-theme'
import {useLocalStorageBoolean} from '@/hooks/use-local-storage'
import {LsKeys} from '@/enum'

export default defineComponent({
  setup() {
    const themeOverrides: GlobalThemeOverrides = {
      common: {
        borderRadiusSmall: '4px',
        borderRadius: '8px',
      },
    }
    const isEnableThemeEdit = useLocalStorageBoolean(LsKeys.LS_KEY_ENABLE_THEME_EDITOR)
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
                            default: () => h(AppContent),
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
