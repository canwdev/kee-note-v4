<script lang="ts">
import AutoRouterView from '@/components/AutoRouterView.vue'
export default defineComponent({
  components: {
    AutoRouterView,
  },
  setup() {
    window.$message = useMessage()
    window.$notification = useNotification()
    window.$dialog = useDialog()
  },
})
</script>
<template>
  <AutoRouterView />
</template>
