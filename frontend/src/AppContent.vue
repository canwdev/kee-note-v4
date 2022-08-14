<script lang="ts">
export default defineComponent({
  setup() {
    window.$message = useMessage()
    window.$notification = useNotification()
    window.$dialog = useDialog()

    const isKeepAlive = (route: any) => {
      return route.meta && route.meta.keepAlive
    }
    return {
      isKeepAlive,
    }
  },
})
</script>
<template>
  <router-view v-slot="{Component}">
    <keep-alive>
      <component :is="Component" :key="$route.name" v-if="isKeepAlive($route)" />
    </keep-alive>
    <component :is="Component" :key="$route.name" v-if="!isKeepAlive($route)" />
  </router-view>
</template>
