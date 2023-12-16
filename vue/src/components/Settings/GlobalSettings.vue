<script lang="ts">
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {Settings20Filled} from '@vicons/fluent'
import OptionUI from '@/components/CommonUI/OptionUI/index.vue'
import {useSettingsStore} from '@/store/settings'
import {StOptionItem, StOptionType} from '@/components/CommonUI/OptionUI/enum'
import {ldThemeOptions} from '@/enum/settings'
import {isElectron} from '@/utils/backend'
import {getMyCryptKey, LsKeys} from '@/enum'
import globalEventBus, {GlobalEvents} from '@/utils/bus'
import {NButton} from 'naive-ui'
import DialogTextEdit from '@/components/CommonUI/DialogTextEdit.vue'
import {useGlobalStyle} from '@/hooks/use-global-theme'
import {RouterLink} from 'vue-router'
import {useServerManager} from '@/components/Settings/use-server-manager'

export default defineComponent({
  name: 'GlobalSettings',
  components: {DialogTextEdit, OptionUI},
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['themeChange'],
  setup(props, {emit}) {
    const mVisible = useModelWrapper(props, emit, 'visible')

    const isShowGlobalStyleDialog = ref(false)
    const {globalStyleText, applyGlobalStyle} = useGlobalStyle()
    const handleSaveGlobalStyle = (val) => {
      console.log(val)
      globalStyleText.value = val
      applyGlobalStyle()
      isShowGlobalStyleDialog.value = false
    }

    const isShowMyCryptKeyDialog = ref(false)
    const myCryptKey = ref(getMyCryptKey())
    const handleMyCryptKeyChange = (value) => {
      isShowMyCryptKeyDialog.value = false
      myCryptKey.value = value
      localStorage.setItem(LsKeys.LS_KEY_KN_HTTP_CRYPT_KEY, String(value))
      location.reload()
    }

    const settingsStore = useSettingsStore()
    const {isServerRunning, serverManagerOption} = useServerManager()

    const optionList = computed((): StOptionItem[] => {
      return [
        {
          label: 'Personalization',
          key: 'personalization',
          children: [
            {
              label: 'Color Mode',
              key: 'ldTheme',
              store: settingsStore,
              type: StOptionType.MULTIPLE_SWITCH,
              selectOptions: ldThemeOptions,
            },
            {
              label: 'Enable Global Css',
              key: 'enableGlobalCss',
              store: settingsStore,
              type: StOptionType.SWITCH,
              actionRender: h(
                NButton,
                {
                  type: 'primary',
                  size: 'small',
                  onClick: () => {
                    isShowGlobalStyleDialog.value = true
                  },
                },
                {
                  default: () => 'Edit',
                }
              ),
            },
            {
              label: 'NaiveUI Theme Editor',
              subtitle: 'Toggle this will refresh page',
              key: 'isEnableThemeEdit',
              store: settingsStore,
              type: StOptionType.SWITCH,
            },
            {
              label: 'Calendar: Show Lunar Day',
              subtitle: '是否显示农历',
              key: 'isCalendarShowLunar',
              store: settingsStore,
              type: StOptionType.SWITCH,
            },
            {
              label: 'Disable Animation',
              subtitle: 'E-Ink optimization',
              key: 'disableAnimation',
              store: settingsStore,
              type: StOptionType.SWITCH,
            },
          ],
        },
        isElectron
          ? serverManagerOption.value
          : {
              label: 'Web UI Config',
              key: 'webui',
              children: [
                {
                  label: 'KN_HTTP_CRYPT_KEY',
                  subtitle: 'Change this will refresh page',
                  key: 'kn_http_crypt_key',
                  actionRender: h(
                    NButton,
                    {
                      type: 'primary',
                      size: 'small',
                      onClick: () => {
                        isShowMyCryptKeyDialog.value = true
                      },
                    },
                    {
                      default: () => 'Edit',
                    }
                  ),
                },
                {
                  label: '.env generator',
                  key: 'env_generator',
                  actionRender: h(
                    RouterLink,
                    {
                      to: '/gen',
                      target: '_blank',
                    },
                    {
                      default: () => 'Go',
                    }
                  ),
                },
              ],
            },
      ].filter(Boolean)
    })

    return {
      mVisible,
      optionList,
      dialogIconRender() {
        return h(Settings20Filled)
      },
      isElectron,
      isShowMyCryptKeyDialog,
      myCryptKey,
      handleMyCryptKeyChange,
      isShowGlobalStyleDialog,
      globalStyleText,
      handleSaveGlobalStyle,
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
    <OptionUI :option-list="optionList" />
  </n-modal>
  <DialogTextEdit
    v-model:visible="isShowGlobalStyleDialog"
    :text="globalStyleText"
    is-textarea
    @onSave="handleSaveGlobalStyle"
    title="Global CSS Editor"
    class="font-code"
  />
  <DialogTextEdit
    v-model:visible="isShowMyCryptKeyDialog"
    :text="myCryptKey"
    @onSave="handleMyCryptKeyChange"
    title="Edit KN_HTTP_CRYPT_KEY"
    placeholder="keep default"
    class="font-code"
    clearable
  />
</template>

<style lang="scss">
.global-settings {
  padding-left: 10px;
  padding-right: 10px;
  .webui-config {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
