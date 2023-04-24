<script lang="ts">
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {getMyCryptKey, LsKeys} from '@/enum'
import globalEventBus, {GlobalEvents} from '@/utils/bus'
import {isElectron} from '@/utils/backend'
import {useLocalStorageBoolean} from '@/hooks/use-local-storage'
import {getUserTheme, themeOptions, ThemeType, useHandleThemeChange} from '@/hooks/use-global-theme'
import {Settings20Filled} from '@vicons/fluent'

export default defineComponent({
  name: 'GlobalSettings',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['themeChange'],
  setup(props, {emit}) {
    const mVisible = useModelWrapper(props, emit, 'visible')

    const themeValue = ref(getUserTheme())
    const myCryptKey = ref(getMyCryptKey())
    const isEnableThemeEdit = useLocalStorageBoolean(LsKeys.LS_KEY_ENABLE_THEME_EDITOR)

    watch(isEnableThemeEdit, (val) => {
      nextTick(() => {
        location.reload()
      })
    })

    const {handleThemeChange} = useHandleThemeChange()

    const handleMyCryptKeyChange = () => {
      if (getMyCryptKey() === myCryptKey.value) {
        return
      }
      localStorage.setItem(LsKeys.LS_KEY_KN_HTTP_CRYPT_KEY, String(myCryptKey.value))
      window.$message.success('KN_HTTP_CRYPT_KEY is set!')
      globalEventBus.emit(GlobalEvents.UPDATE_KN_HTTP_CRYPT_KEY, String(myCryptKey.value))
    }

    return {
      isElectron,
      mVisible,
      themeValue,
      handleThemeChange,
      myCryptKey,
      themeOptions,
      handleMyCryptKeyChange,
      isEnableThemeEdit,
      dialogIconRender() {
        return h(Settings20Filled)
      },
    }
  },
})
</script>

<template>
  <n-modal
    class="global-settings"
    v-model:show="mVisible"
    preset="dialog"
    :icon="dialogIconRender"
    title="Settings"
  >
    <n-list>
      <n-list-item>
        <n-thing title="Toggle light/dark theme" />
        <template #suffix>
          <n-select
            v-model:value="themeValue"
            :options="themeOptions"
            style="width: 150px"
            @update:value="handleThemeChange"
          />
        </template>
      </n-list-item>
      <n-list-item>
        <n-thing title="Enable Theme Editor" />
        <template #suffix>
          <n-switch v-model:value="isEnableThemeEdit" />
        </template>
      </n-list-item>
      <n-list-item v-if="!isElectron">
        <n-thing title="HTTP Crypt key" description="KN_HTTP_CRYPT_KEY" style="line-height: 1" />
        <template #suffix>
          <n-input
            v-model:value="myCryptKey"
            type="password"
            style="width: 200px"
            show-password-on="click"
            placeholder="keep default"
            clearable
            @keyup.enter="handleMyCryptKeyChange"
            @blur="handleMyCryptKeyChange"
          />
        </template>
      </n-list-item>
    </n-list>
  </n-modal>
</template>

<style lang="scss" scoped>
.global-settings {
}
</style>
