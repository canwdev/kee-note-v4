<script lang="ts">
import AutoRouterView from '@/components/AutoRouterView.vue'
import GlobalSettings from '@/components/GlobalSettings.vue'
import globalEventBus, {GlobalEvents} from '@/utils/bus'
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

    onMounted(() => {
      globalEventBus.on(GlobalEvents.SHOW_SETTINGS, handleShowSettings)
    })
    onBeforeUnmount(() => {
      globalEventBus.off(GlobalEvents.SHOW_SETTINGS, handleShowSettings)
    })

    const settingsVisible = ref(false)
    const handleShowSettings = () => {
      settingsVisible.value = true
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
