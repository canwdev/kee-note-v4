<script lang="ts">
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {getMyCryptKey, getUserTheme, LS_KEY_MY_CRYPT_KEY, LS_KEY_THEME, ThemeType} from '@/enum'
import globalEventBus, {GlobalEvents} from '@/utils/bus'
import {isElectron} from '@/utils/backend'
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

    const handleThemeSelectChange = (val: ThemeType) => {
      localStorage.setItem(LS_KEY_THEME, String(val))
      emit('themeChange', val)
    }

    const handleMyCryptKeyChange = () => {
      if (getMyCryptKey() === myCryptKey.value) {
        return
      }
      localStorage.setItem(LS_KEY_MY_CRYPT_KEY, String(myCryptKey.value))
      window.$message.success('MY_CRYPT_KEY is set!')
      globalEventBus.emit(GlobalEvents.UPDATE_MY_CRYPT_KEY, String(myCryptKey.value))
    }

    return {
      isElectron,
      mVisible,
      themeValue,
      handleThemeSelectChange,
      myCryptKey,
      themeOptions: [
        {
          label: 'Follow System',
          value: ThemeType.SYSTEM,
        },
        {
          label: 'Light Theme',
          value: ThemeType.LIGHT,
        },
        {
          label: 'Dark Theme',
          value: ThemeType.DARK,
        },
      ],
      handleMyCryptKeyChange,
    }
  },
})
</script>

<template>
  <n-modal class="global-settings" v-model:show="mVisible" preset="dialog" title="Settings">
    <n-list>
      <n-list-item>
        <n-thing title="Theme" description="Toggle light/dark theme" />
        <template #suffix>
          <n-select
            v-model:value="themeValue"
            :options="themeOptions"
            style="width: 150px"
            @update:value="handleThemeSelectChange"
          />
        </template>
      </n-list-item>
      <n-list-item v-if="!isElectron">
        <n-thing title="Crypt Key" description="Set `MY_CRYPT_KEY`" />
        <template #suffix>
          <n-input
            v-model:value="myCryptKey"
            type="password"
            style="width: 200px"
            show-password-on="click"
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
