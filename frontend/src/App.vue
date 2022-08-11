<script lang="ts" setup>
import HelloWorld from '@/components/HelloWorld.vue'
</script>

<template>
  <div class="page-craft-root">
    <n-message-provider>
      <n-button type="primary">OK</n-button>
      <HelloWorld />
    </n-message-provider>
  </div>
</template>

<style scoped></style>
