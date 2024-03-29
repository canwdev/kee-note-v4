<script lang="ts">
import {darkTheme, GlobalThemeOverrides, NDialogProvider, NNotificationProvider} from 'naive-ui'
import AppContent from './AppContent.vue'
import {NThemeEditor, NConfigProvider, NLoadingBarProvider, NMessageProvider} from 'naive-ui'
import {useGlobalTheme} from './hooks/use-global-theme'
import {useGlobalShortcuts} from '@/hooks/use-global-shortcuts'
import {useSettingsStore} from '@/store/settings'
import moment from 'moment/moment'

export default defineComponent({
  setup() {
    const settingsStore = useSettingsStore()

    const isEnableThemeEdit = computed(() => settingsStore.isEnableThemeEdit)
    useGlobalShortcuts()

    watch(
      () => settingsStore.calendarWeekIndex,
      (val) => {
        moment.updateLocale(moment.locale(), {
          week: {
            dow: val > -1 ? val : moment.localeData().firstDayOfWeek(),
          },
        })
      },
      {immediate: true}
    )

    return {
      ...useGlobalTheme(),
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
                              placement: 'bottom',
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
