<script lang="ts">
import {defineComponent, ref} from 'vue'
import {FormInst, FormValidationError, useMessage, FormRules} from 'naive-ui'
import {kService} from '@/api'
import {useRouter} from 'vue-router'
import globalEventBus, {GlobalEvents} from '@/utils/bus'
import {isElectron} from '@/utils/backend'
import HistoryDialog from '@/components/HistoryDialog.vue'
import {getLocalStorageObject, LS_KEY_HISTORY_LIST, setLocalStorageObject} from '@/enum'

interface ModelType {
  dbPath: string | null
  password: string | null
  keyPath: string | null
}

export default defineComponent({
  setup() {
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

    const updateHistory = () => {
      const historyList = getLocalStorageObject(LS_KEY_HISTORY_LIST, [])
      const index = historyList.findIndex((item: any) => item.dbPath === modelRef.value.dbPath)
      if (index > -1) {
        historyList.splice(index, 1)
      }
      historyList.unshift({
        dbPath: modelRef.value.dbPath,
        keyPath: modelRef.value.keyPath,
      })
      setLocalStorageObject(LS_KEY_HISTORY_LIST, historyList)
    }

    const loadFirstHistory = () => {
      const historyList = getLocalStorageObject(LS_KEY_HISTORY_LIST, [])
      if (historyList.length > 0) {
        modelRef.value.dbPath = historyList[0].dbPath
        modelRef.value.keyPath = historyList[0].keyPath
      }
    }

    const handleLogin = async () => {
      await kService.openDatabase({
        dbPath: modelRef.value.dbPath,
        password: modelRef.value.password,
        keyPath: modelRef.value.keyPath,
      })

      await checkProfile()
      updateHistory()
    }

    const checkProfile = async () => {
      if (!(await kService.checkIsOpen())) {
        return
      }

      window.$notification.success({
        content: '🎉 Database unlocked！',
        meta: '',
        duration: 3000,
        keepAliveOnHover: true,
      })

      await router.replace({
        name: 'NoteView',
      })
    }

    onMounted(async () => {
      loadFirstHistory()
      await checkProfile()
    })

    const handleChooseFile = async (type) => {
      const {filePaths} = await kService.openFileDialog({
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
    }
  },
})
</script>

<template>
  <n-layout class="login-view">
    <HistoryDialog
      @historyItemClick="handleHistoryItemClick"
      v-model:visible="isShowHistoryDialog"
    />
    <n-layout-content>
      <n-card class="card-wrap" title="Open Kdbx Database" hoverable>
        <template #header-extra>
          <n-button size="small" @click="isShowHistoryDialog = true">History</n-button>
        </template>

        <n-form ref="formRef" :model="model" :rules="rules">
          <n-form-item path="dbPath" label="🔒 Kdbx Path">
            <n-input-group>
              <n-input
                v-model:value="model.dbPath"
                @keyup.enter="handleValidateButtonClick"
                clearable
                placeholder="Input or select file path"
              />
              <n-button @click="handleChooseFile('dbPath')">📂</n-button>
            </n-input-group>
          </n-form-item>
          <n-form-item path="password" label="🔑 Password">
            <n-input
              v-model:value="model.password"
              type="password"
              show-password-on="click"
              clearable
              @keyup.enter="handleValidateButtonClick"
              placeholder="Please input password"
            />
          </n-form-item>
          <n-form-item path="keyPath" label="🔑 Key Path (Optional)">
            <n-input-group>
              <n-input
                v-model:value="model.keyPath"
                @keyup.enter="handleValidateButtonClick"
                show-password-on="click"
                clearable
                type="password"
                placeholder="Input or select file path"
              />
              <n-button @click="handleChooseFile('keyPath')">📂</n-button>
            </n-input-group>
          </n-form-item>
          <n-space style="display: flex; justify-content: flex-end">
            <n-button round type="primary" @click="handleValidateButtonClick"> Unlock </n-button>
            <n-button round @click="handleSettings"> Settings </n-button>
          </n-space>
        </n-form>
      </n-card>
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss" scoped>
.login-view {
  height: 100%;

  :deep(.n-layout-scroll-container) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .card-wrap {
    max-width: 500px;
    margin: 20px;
  }
}
</style>
