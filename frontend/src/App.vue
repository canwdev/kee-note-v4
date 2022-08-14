<script lang="ts" setup>
import {darkTheme} from 'naive-ui'
import AppContent from './AppContent.vue'

let isSystemDarkMode = ref<boolean>(
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
)

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  isSystemDarkMode.value = Boolean(event.matches)
})
</script>

<template>
  <n-config-provider :theme="isSystemDarkMode ? darkTheme : null">
    <n-dialog-provider>
      <n-notification-provider>
        <n-message-provider>
          <AppContent />
        </n-message-provider>
      </n-notification-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>
