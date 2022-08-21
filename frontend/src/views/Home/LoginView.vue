<script lang="ts">
import {defineComponent, ref} from 'vue'
import {
  FormInst,
  FormItemInst,
  FormItemRule,
  FormValidationError,
  useMessage,
  FormRules,
} from 'naive-ui'
import {userLogin, userProfile} from '@/api'
import {LS_KEY_AUTHORIZATION} from '@/enum'
import cookies from 'js-cookie'
import {useRouter} from 'vue-router'
import globalEventBus, {GlobalEvents} from '@/utils/bus'

interface ModelType {
  username: string | null
  password: string | null
}

export default defineComponent({
  setup() {
    const router = useRouter()
    const formRef = ref<FormInst | null>(null)
    const message = useMessage()
    const modelRef = ref<ModelType>({
      username: 'test',
      password: '__REPLACE_ME__',
    })

    const rules: FormRules = {
      username: [
        {
          required: true,
          message: 'Username is required',
          trigger: ['blur'],
        },
      ],
      password: [
        {
          required: true,
          message: 'Password is required',
          trigger: ['blur'],
        },
      ],
    }

    const handleLogin = async () => {
      const {access_token} = await userLogin({
        username: modelRef.value.username,
        password: modelRef.value.password,
      })
      if (!access_token) {
        message.error('Invalid token! Check crypt key in settings?')
        return
      }
      localStorage.setItem(LS_KEY_AUTHORIZATION, access_token)

      checkProfile()
    }

    const checkProfile = async () => {
      if (!localStorage.getItem(LS_KEY_AUTHORIZATION)) {
        return
      }
      const data = await userProfile()

      window.$notification.success({
        content: 'Congrats🎉，you have successfully logged in！',
        meta: JSON.stringify(data),
        duration: 3000,
        keepAliveOnHover: true,
      })

      router.replace({
        name: 'NoteView',
      })
    }

    onMounted(async () => {
      await checkProfile()
    })

    return {
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
      <n-card class="card-wrap" title="Login" hoverable>
        <n-form ref="formRef" :model="model" :rules="rules">
          <n-form-item path="username" label="Username">
            <n-input v-model:value="model.username" @keydown.enter.prevent />
          </n-form-item>
          <n-form-item path="password" label="Password">
            <n-input v-model:value="model.password" type="password" />
          </n-form-item>
          <n-space style="display: flex; justify-content: flex-end">
            <n-button round @click="handleSettings"> Settings </n-button>
            <n-button round type="primary" @click="handleValidateButtonClick"> Login </n-button>
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
