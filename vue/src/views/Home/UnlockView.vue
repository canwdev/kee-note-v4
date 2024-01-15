<script lang="ts">
import {defineComponent, ref} from 'vue'
import {FormInst, FormValidationError, useMessage, FormRules} from 'naive-ui'
import {kService} from '@/api'
import {useRouter} from 'vue-router'
import globalEventBus, {GlobalEvents} from '@/utils/bus'
import {isElectron} from '@/utils/backend'
import {
  Folder16Regular,
  DatabasePerson20Regular,
  Key16Regular,
  KeyMultiple20Regular,
  History20Regular,
  Add20Filled,
  ArrowLeft20Regular,
} from '@vicons/fluent'
import HistoryDialog from '@/components/NoteViews/HistoryDialog.vue'
import {useMainStore} from '@/store/main'
import {useHistory} from '@/views/Home/use-history'
import {checkDatabaseIsOpen, createCredentialKey, createDatabase} from '@/api/keepass'
import moment from 'moment/moment'

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
    History20Regular,
    Add20Filled,
    ArrowLeft20Regular,
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

    const handleCreate = async () => {
      await kService.createDatabase({
        dbPath: modelRef.value.dbPath,
        password: modelRef.value.password,
        keyPath: modelRef.value.keyPath,
        name: `New Database`,
      })
      window.$message.success('Database created: ' + modelRef.value.dbPath)
      isCreateMode.value = false
      modelRef.value.password = ''

      autoFocusInput()
    }

    const checkProfile = async (query = {}) => {
      if (!(await kService.checkDatabaseIsOpen())) {
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

    // 选择要创建的文件
    const handleChooseCreateFile = async (type) => {
      const newFilename = moment().format('YYYY-MM-DD')
      const {filePath} = await kService.electronOpenSaveDialog({
        defaultPath: type === 'dbPath' ? `${newFilename}.kdbx` : `${newFilename}.key`,
        filters: [
          type === 'dbPath'
            ? {
                name: 'KeePass Database',
                extensions: ['kdbx'],
              }
            : {
                name: 'Key File',
                extensions: ['key'],
              },
        ],
      })

      // 创建key
      if (type === 'keyPath') {
        await createCredentialKey({keyPath: filePath})
        window.$message.success('Key file created: ' + filePath)
      }

      if (filePath) {
        modelRef.value[type] = filePath
      }
    }

    // 选择已存在的文件
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
                extensions: ['key', '*'],
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

    const isCreateMode = ref(false)
    const toggleCreate = () => {
      if (!isCreateMode.value) {
        modelRef.value.dbPath = ''
        modelRef.value.password = ''
        modelRef.value.keyPath = ''
      }
      isCreateMode.value = !isCreateMode.value
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
          if (isCreateMode.value) {
            handleCreate()
            return
          }
          handleLogin()
        })
      },
      checkProfile,
      handleSettings() {
        globalEventBus.emit(GlobalEvents.SHOW_SETTINGS)
      },
      handleChooseCreateFile,
      handleChooseFile,
      isShowHistoryDialog,
      handleHistoryItemClick,
      inputPwdRef,
      isCreateMode,
      toggleCreate,
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
      <n-card class="card-wrap" :title="`${isCreateMode ? 'Create' : 'Open'} Kdbx Database`">
        <template #header-extra>
          <n-space size="small">
            <n-button
              size="small"
              quaternary
              :title="isCreateMode ? 'Back' : 'Create Database'"
              @click="toggleCreate"
            >
              <n-icon size="20">
                <ArrowLeft20Regular v-if="isCreateMode" />
                <Add20Filled v-else />
              </n-icon>
            </n-button>
            <n-button
              v-if="!isCreateMode"
              quaternary
              size="small"
              @click="isShowHistoryDialog = true"
              title="History"
            >
              <n-icon size="20"><History20Regular /></n-icon>
            </n-button>
          </n-space>
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
                class="font-code"
              />
              <n-button v-if="isCreateMode" @click="handleChooseCreateFile('dbPath')">
                <n-icon size="16"><Add20Filled /></n-icon>
              </n-button>
              <n-button v-else @click="handleChooseFile('dbPath')">
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
              <n-button v-if="isCreateMode" @click="handleChooseCreateFile('keyPath')">
                <n-icon size="16"><Add20Filled /></n-icon>
              </n-button>
              <n-button @click="handleChooseFile('keyPath')">
                <n-icon size="16"><Folder16Regular /></n-icon>
              </n-button>
            </n-input-group>
          </n-form-item>
          <n-space v-if="isCreateMode" justify="end" size="small">
            <n-button strong type="primary" @click="handleValidateButtonClick" style="color: white">
              Create
            </n-button>
          </n-space>
          <n-space v-else justify="end" size="small">
            <n-badge :show="mainStore.isServerRunning" dot type="success" :offset="[-2, 3]">
              <n-button @click="handleSettings"> Settings </n-button>
            </n-badge>
            <n-button strong type="primary" @click="handleValidateButtonClick" style="color: white">
              Unlock
            </n-button>
          </n-space>
        </n-form>
      </n-card>
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss" scoped>
@import './login';
</style>
