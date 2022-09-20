<script lang="ts">
import AutoRouterView from '@/components/AutoRouterView.vue'
import GlobalSettings from '@/components/GlobalSettings.vue'
import globalEventBus, {GlobalEvents} from '@/utils/bus'
import {kService} from '@/api'

export default defineComponent({
  components: {
    AutoRouterView,
    GlobalSettings,
  },
  emits: ['themeChange'],
  setup() {
    window.$message = useMessage()
    window.$notification = useNotification()
    window.$dialog = useDialog()
    window.$loadingBar = useLoadingBar()

    onMounted(() => {
      globalEventBus.on(GlobalEvents.SHOW_SETTINGS, handleShowSettings)
      globalEventBus.on(GlobalEvents.SAVE_DATABASE, handleSaveDatabase)
    })
    onBeforeUnmount(() => {
      globalEventBus.off(GlobalEvents.SHOW_SETTINGS, handleShowSettings)
      globalEventBus.off(GlobalEvents.SAVE_DATABASE, handleSaveDatabase)
    })

    const settingsVisible = ref(false)
    const handleShowSettings = () => {
      settingsVisible.value = true
    }

    const handleSaveDatabase = async (options: any = {}) => {
      const {resolve, reject} = options
      try {
        await kService.saveDatabase()
        window.$message.success('Saved!')
        resolve()
      } catch (e) {
        reject(e)
      }
    }

    return {
      settingsVisible,
    }
  },
})
</script>
<template>
  <AutoRouterView />
  <GlobalSettings @themeChange="(v) => $emit('themeChange', v)" v-model:visible="settingsVisible" />
</template>
