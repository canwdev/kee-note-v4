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

interface ModelType {
  username: string | null
  password: string | null
}

export default defineComponent({
  setup() {
    const formRef = ref<FormInst | null>(null)
    const message = useMessage()
    const modelRef = ref<ModelType>({
      username: null,
      password: null,
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
      localStorage.setItem(LS_KEY_AUTHORIZATION, access_token)

      message.success('Login Success!')
    }

    const checkProfile = async () => {
      const data = await userProfile()

      window.$notification.success({
        content: '恭喜🎉，你已成功登录！',
        meta: JSON.stringify(data),
        duration: 3000,
        keepAliveOnHover: true,
      })
    }

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
    }
  },
})
</script>

<template>
  <div class="login-view">
    <n-card class="card-wrap" title="Login">
      <n-form ref="formRef" :model="model" :rules="rules">
        <n-form-item path="username" label="Username">
          <n-input v-model:value="model.username" @keydown.enter.prevent />
        </n-form-item>
        <n-form-item path="password" label="Password">
          <n-input v-model:value="model.password" type="password" />
        </n-form-item>
        <n-space style="display: flex; justify-content: flex-end">
          <n-button round @click="checkProfile"> Profile </n-button>
          <n-button round type="primary" @click="handleValidateButtonClick"> Login </n-button>
        </n-space>
      </n-form>
    </n-card>
  </div>
</template>

<style lang="scss" scoped>
.login-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  .card-wrap {
    max-width: 500px;
  }
}
</style>
