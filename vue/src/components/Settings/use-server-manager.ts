import {NButton} from 'naive-ui'
import {StOptionItem} from '@/components/CommonUI/OptionUI/enum'
import {isElectron} from '@/utils/backend'
import {electronToggleServer} from '@/api/keepass'

export const useServerManager = () => {
  const isLoading = ref(false)
  const isServerRunning = ref(false)
  const serverLogMessage = ref('')
  const serverManagerOption = computed((): StOptionItem => {
    return {
      label: 'Electron App Config',
      key: 'electron',
      children: [
        {
          label: 'Nest.js Server',
          subtitle: isServerRunning.value ? serverLogMessage.value : 'Run KeeNote on a webpage!',
          key: 'enable_server',
          actionRender: h(
            NButton,
            {
              type: 'primary',
              size: 'small',
              onClick: async () => {
                await doToggleServer({toggle: !isServerRunning.value})
              },
              disabled: isLoading.value,
            },
            {
              default: () => {
                if (isLoading.value) {
                  return '...'
                }
                return isServerRunning.value ? 'Stop' : 'Start'
              },
            }
          ),
        },
      ],
    }
  })

  const doToggleServer = async (params) => {
    try {
      isLoading.value = true
      const res = await electronToggleServer(params)
      isServerRunning.value = res.running
      serverLogMessage.value = res.logMessage
    } catch (e) {
    } finally {
      isLoading.value = false
    }
  }

  onMounted(async () => {
    if (isElectron) {
      await doToggleServer({getStatusOnly: true})
    }
  })

  return {
    isServerRunning,
    serverManagerOption,
  }
}
