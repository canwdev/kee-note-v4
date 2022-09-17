<script lang="ts">
import {defineComponent, ref} from 'vue'
import {FormInst, FormValidationError, useMessage, FormRules} from 'naive-ui'
import {kService, userLogin, userProfile} from '@/api'
import {LS_KEY_AUTHORIZATION} from '@/enum'
import cookies from 'js-cookie'
import {useRouter} from 'vue-router'
import globalEventBus, {GlobalEvents} from '@/utils/bus'
import {isElectron} from '@/utils/backend'

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

    const handleLogin = async () => {
      await kService.openDatabase({
        dbPath: modelRef.value.dbPath,
        password: modelRef.value.password,
        keyPath: modelRef.value.keyPath,
      })

      await checkProfile()
    }

    const checkProfile = async () => {
      if (!(await kService.checkIsOpen())) {
        return
      }

      window.$notification.success({
        content: '🎉 You already unlocked！',
        meta: '',
        duration: 3000,
        keepAliveOnHover: true,
      })

      await router.replace({
        name: 'NoteView',
      })
    }

    onMounted(async () => {
      await checkProfile()
    })

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
    }
  },
})
</script>

<template>
  <n-layout class="login-view">
    <n-layout-content>
      <n-card class="card-wrap" title="Open Kdbx Database" hoverable>
        <n-form ref="formRef" :model="model" :rules="rules">
          <n-form-item path="dbPath" label="dbPath">
            <n-input v-model:value="model.dbPath" @keyup.enter="handleValidateButtonClick" />
          </n-form-item>
          <n-form-item path="password" label="Password">
            <n-input
              v-model:value="model.password"
              type="password"
              show-password-on="click"
              @keyup.enter="handleValidateButtonClick"
            />
          </n-form-item>
          <n-form-item path="keyPath" label="keyPath">
            <n-input v-model:value="model.keyPath" @keyup.enter="handleValidateButtonClick" />
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
