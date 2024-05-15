import {NButton} from 'naive-ui'
import {StOptionItem, StOptionType} from '@/components/CommonUI/OptionUI/enum'
import {isElectron} from '@/utils/backend'
import {marked} from 'marked'
import {useMainStore} from '@/store/main'
import {useSettingsStore} from '@/store/settings'
import {electronCommonApi} from '@/api/electron'

export const useAppSettings = () => {
  const mainStore = useMainStore()
  const settingsStore = useSettingsStore()
  const isLoading = ref(false)
  const serverLogMessage = ref('')

  const serverManagerOption = computed((): StOptionItem => {
    return {
      label: 'Electron App Config',
      key: 'electron',
      children: [
        {
          label: 'Window Content Protection',
          subtitle: 'Prevents the window contents from being captured by other apps.',
          key: 'isContentProtection',
          store: settingsStore,
          type: StOptionType.SWITCH,
        },
        {
          label: 'Nest.js Server',
          subtitle: mainStore.isServerRunning
            ? serverLogMessage.value
            : 'Run KeeNote on a webpage!',
          key: 'enable_server',
          actionRender: h(
            NButton,
            {
              type: 'primary',
              size: 'small',
              onClick: async () => {
                await doToggleServer({toggle: !mainStore.isServerRunning})
              },
              disabled: isLoading.value,
            },
            {
              default: () => {
                if (isLoading.value) {
                  return '...'
                }
                return mainStore.isServerRunning ? 'Stop' : 'Start'
              },
            },
          ),
        },
      ],
    }
  })

  const doToggleServer = async (params) => {
    try {
      isLoading.value = true
      const res = await electronCommonApi.electronToggleServer(params)
      mainStore.isServerRunning = res.running
      serverLogMessage.value = marked.parse(res.logMessage)
    } catch (e) {
    } finally {
      isLoading.value = false
    }
  }

  onMounted(async () => {
    if (isElectron) {
      await doToggleServer({getStatusOnly: true})
      if (mainStore.isServerRunning) {
        window.$notification.success({
          content: 'Server auto started!',
          meta: () =>
            h('div', {
              innerHTML: serverLogMessage.value,
            }),
          duration: 3000,
          keepAliveOnHover: true,
        })
      }
    }
  })

  return {
    serverManagerOption,
  }
}
