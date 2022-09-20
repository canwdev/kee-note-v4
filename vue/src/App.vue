<script lang="ts" setup>
import {darkTheme, GlobalThemeOverrides} from 'naive-ui'
import AppContent from './AppContent.vue'
import {getUserTheme, ThemeType} from '@/enum'
import {NThemeEditor} from 'naive-ui'

const getSystemIsDarkMode = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

let isSystemDarkMode = ref(true)

const handleThemeChange = (val: ThemeType) => {
  if (val === ThemeType.SYSTEM) {
    isSystemDarkMode.value = getSystemIsDarkMode()
  } else if (val === ThemeType.LIGHT) {
    isSystemDarkMode.value = false
  } else if (val === ThemeType.DARK) {
    isSystemDarkMode.value = true
  }
}

handleThemeChange(getUserTheme())

const handleSystemThemeChange = (event: any) => {
  if (getUserTheme() === ThemeType.SYSTEM) {
    isSystemDarkMode.value = Boolean(event.matches)
  }
}

onMounted(() => {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', handleSystemThemeChange)
})

onBeforeUnmount(() => {
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .removeEventListener('change', handleSystemThemeChange)
})

const themeOverrides: GlobalThemeOverrides = {
  common: {
    borderRadiusSmall: '4px',
    borderRadius: '8px',
  },
}
</script>

<template>
  <!--  <n-theme-editor>-->
  <n-config-provider :theme="isSystemDarkMode ? darkTheme : null" :theme-overrides="themeOverrides">
    <n-loading-bar-provider>
      <n-dialog-provider>
        <n-notification-provider placement="bottom-left">
          <n-message-provider placement="bottom">
            <AppContent @themeChange="handleThemeChange" />
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-loading-bar-provider>
  </n-config-provider>
  <!--  </n-theme-editor>-->
</template>
