<script lang="ts" setup>
import {darkTheme} from 'naive-ui'
import AppContent from './AppContent.vue'
</script>

<template>
  <n-config-provider :theme="darkTheme">
    <n-dialog-provider>
      <n-notification-provider>
        <n-message-provider>
          <AppContent />
        </n-message-provider>
      </n-notification-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>
