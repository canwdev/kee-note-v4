<script lang="ts">
import {defineComponent, ref} from 'vue'
import {FormInst, FormValidationError, useMessage, FormRules} from 'naive-ui'
import {kService} from '@/api'
import {useRouter} from 'vue-router'
import globalEventBus, {GlobalEvents} from '@/utils/bus'
import {isElectron} from '@/utils/backend'
import {getLocalStorageObject, LsKeys, setLocalStorageObject} from '@/enum'
import {
  Folder16Regular,
  DatabasePerson20Regular,
  Key16Regular,
  KeyMultiple20Regular,
  History16Regular,
} from '@vicons/fluent'
import {useSettingsStore} from '@/store/settings'
import HistoryDialog from '@/components/NoteViews/HistoryDialog.vue'
import {HistoryListItem} from '@/enum/settings'
import {useMainStore} from '@/store/main'
import {useHistory} from '@/views/Home/use-history'

interface ModelType {
  dbPath: string | null
  password: string | null
  keyPath: string | null
}

export default defineComponent({
  components: {
    HistoryDialog,
    Folder16Regular,
    DatabasePerson20Regular,
    Key16Regular,
    KeyMultiple20Regular,
    History16Regular,
  },
  setup() {
    const mainStore = useMainStore()
    const router = useRouter()
    const formRef = ref<FormInst | null>(null)
    const message = useMessage()
    const modelRef = ref<ModelType>({
      dbPath: '',
      password: '',
      keyPath: '',
    })

    const rules: FormRules = {
      dbPath: [
        {
          required: true,
          message: 'dbPath is required',
          trigger: ['blur'],
        },
      ],
    }

    const {updateHistory, loadFirstHistory} = useHistory()

    const handleLogin = async () => {
      await kService.openDatabase({
        dbPath: modelRef.value.dbPath,
        password: modelRef.value.password,
        keyPath: modelRef.value.keyPath,
      })

      const hItem = updateHistory(modelRef.value)

      // 传入query参数
      await checkProfile(hItem ? {groupUuid: hItem.lastGroupUuid} : {})
    }

    const checkProfile = async (query = {}) => {
      if (!(await kService.checkIsOpen())) {
        return
      }

      await router.replace({
        name: 'NoteView',
        query,
      })
    }

    // 自动聚焦输入框
    const inputPwdRef = ref()
    const autoFocusInput = () => {
      inputPwdRef.value?.focus()
    }

    onMounted(async () => {
      const hItem = loadFirstHistory()
      if (hItem) {
        modelRef.value.dbPath = hItem.dbPath
        modelRef.value.keyPath = hItem.keyPath
      }

      await checkProfile()
      autoFocusInput()
    })

    const handleChooseFile = async (type) => {
      const {filePaths} = await kService.electronOpenFileDialog({
        filters: [
          type === 'dbPath'
            ? {
                name: 'KeePass Database',
                extensions: ['kdbx'],
              }
            : {
                name: 'Key File',
                extensions: ['*'],
              },
        ],
      })
      if (filePaths && filePaths.length > 0) {
        modelRef.value[type] = filePaths[0]
      }
    }

    const isShowHistoryDialog = ref(false)
    const handleHistoryItemClick = (item) => {
      modelRef.value.dbPath = item.dbPath
      modelRef.value.keyPath = item.keyPath
      isShowHistoryDialog.value = false
    }

    return {
      mainStore,
      isElectron,
      formRef,
      model: modelRef,
      rules,
      handleValidateButtonClick(e: MouseEvent) {
        e.preventDefault()
        formRef.value?.validate((errors: Array<FormValidationError> | undefined) => {
          if (errors) {
            message.error('Invalid Form!')
            return
          }
          handleLogin()
        })
      },
      checkProfile,
      handleSettings() {
        globalEventBus.emit(GlobalEvents.SHOW_SETTINGS)
      },
      handleChooseFile,
      isShowHistoryDialog,
      handleHistoryItemClick,
      inputPwdRef,
    }
  },
})
</script>

<template>
  <n-layout class="login-view f">
    <HistoryDialog
      @historyItemClick="handleHistoryItemClick"
      v-model:visible="isShowHistoryDialog"
    />
    <n-layout-content>
      <n-card class="card-wrap" title="Open Kdbx Database">
        <template #header-extra>
          <n-button quaternary size="small" @click="isShowHistoryDialog = true" title="History">
            <n-icon size="20"><History16Regular /></n-icon>
          </n-button>
        </template>

        <n-form ref="formRef" :model="model" :rules="rules">
          <n-form-item path="dbPath" label="Kdbx Path">
            <n-input-group>
              <n-input-group-label>
                <n-icon size="16"><DatabasePerson20Regular /></n-icon>
              </n-input-group-label>
              <n-input
                v-model:value="model.dbPath"
                @keyup.enter="handleValidateButtonClick"
                clearable
                placeholder="Input or select file path"
              />
              <n-button secondary @click="handleChooseFile('dbPath')">
                <n-icon size="16"><Folder16Regular /></n-icon>
              </n-button>
            </n-input-group>
          </n-form-item>
          <n-form-item path="password" label="Password">
            <n-input-group>
              <n-input-group-label>
                <n-icon size="16"><Key16Regular /></n-icon>
              </n-input-group-label>
              <n-input
                ref="inputPwdRef"
                v-model:value="model.password"
                type="password"
                show-password-on="click"
                clearable
                @keyup.enter="handleValidateButtonClick"
                placeholder="Please input password"
                class="font-code"
              />
            </n-input-group>
          </n-form-item>
          <n-form-item path="keyPath" label="Key Path (Optional)">
            <n-input-group>
              <n-input-group-label>
                <n-icon size="16"><KeyMultiple20Regular /></n-icon>
              </n-input-group-label>
              <n-input
                v-model:value="model.keyPath"
                @keyup.enter="handleValidateButtonClick"
                show-password-on="click"
                clearable
                type="password"
                placeholder="Input or select file path"
                class="font-code"
              />
              <n-button secondary @click="handleChooseFile('keyPath')">
                <n-icon size="16"><Folder16Regular /></n-icon>
              </n-button>
            </n-input-group>
          </n-form-item>
          <n-space style="display: flex; justify-content: flex-end">
            <n-button strong type="primary" @click="handleValidateButtonClick" style="color: white">
              Unlock
            </n-button>

            <n-badge :show="mainStore.isServerRunning" dot type="success" :offset="[-2, 3]">
              <n-button tertiary @click="handleSettings"> Settings </n-button>
            </n-badge>
          </n-space>
        </n-form>
      </n-card>
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss" scoped>
@import './login';
</style>
