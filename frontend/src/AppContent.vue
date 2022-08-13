<script lang="ts">
export default defineComponent({
  setup() {
    window.$message = useMessage()
    window.$notification = useNotification()
    window.$dialog = useDialog()
  },
})
</script>
<template>
  <router-view></router-view>
</template>
