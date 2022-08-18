<script lang="ts">
export default defineComponent({
  setup() {
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
  <router-view v-slot="{Component, route}">
    <keep-alive>
      <component :is="Component" :key="route.name" v-if="isKeepAlive(route)" />
    </keep-alive>
    <component :is="Component" :key="route.name" v-if="!isKeepAlive(route)" />
  </router-view>
</template>
