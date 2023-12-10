<script lang="ts">
import {defineComponent, ref} from 'vue'
import {FormInst, FormRules} from 'naive-ui'
import {hashSync} from 'bcryptjs'
import {getRandomHex} from '@/utils/my-crypt'

const genUserData = (username, password) => {
  return JSON.stringify([
    {
      userId: 1,
      username: username,
      password_salted: hashSync(password, 10),
    },
  ])
}

const EnvConfigMap = {
  PORT: {label: 'Server Port', value: '3030'},
  JWT_SECRET: {
    label: 'JWT Secret',
    tip: '',
    value: getRandomHex(),
    required: true,
  },
  JWT_EXPIRES_IN: {
    label: 'JWT Expires In',
    tip: 'Eg: 60, "2 days", "10h", "7d". A numeric value is interpreted as a seconds count. <a href="https://github.com/auth0/node-jsonwebtoken#usage" target="_blank">node-jsonwebtoken#usage</a>',
    value: '30d',
    required: true,
  },
  AUTH_USERS: {
    label: 'HTTP Auth users',
    tip: '',
    value: '', // genUserData('admin', 'admin')
    required: true,
    placeholder: 'Please generate by right button',
  },
  KN_KDBX_CONFIG_PATH: {
    label: 'Kdbx config path',
    tip: 'Absolute path for db-config.json, the database will be loaded once the server starts. If not set, it will load test/db-config.json',
    value: '',
    required: true,
    placeholder: 'Eg: D:/MyFolder/db-config.json',
  },
  KN_HTTP_CRYPT_KEY: {
    label: 'HTTP Crypt key',
    tip: 'Recommended to enable in production mode to enhance security. it can encrypt/decrypt HTTP request query/body and response body',
    value: getRandomHex(),
  },
}

const getDefaultFormValue = () => {
  const obj = {}
  for (const key in EnvConfigMap) {
    obj[key] = EnvConfigMap[key].value
  }
  return obj
}

const getFormRules = () => {
  const obj = {}
  for (const key in EnvConfigMap) {
    if (EnvConfigMap[key].required) {
      obj[key] = {
        required: true,
        trigger: ['blur'],
      }
    }
  }
  return obj
}

export default defineComponent({
  name: 'EnvGenerator',
  setup() {
    const formRef = ref<FormInst | null>(null)
    const dataForm = ref<ModelType>(getDefaultFormValue())
    const dataFormRules: FormRules = getFormRules()
    const outputText = ref('')

    const handleGenerate = () => {
      formRef.value?.validate((errors) => {
        if (errors) {
          window.$message.error('Invalid form!')
          return
        }
        let txt = ''
        for (const key in dataForm.value) {
          const val = dataForm.value[key]
          const commentFlag = val ? '' : '#'
          txt += `${commentFlag}${key}=${val}\n`
        }
        outputText.value = txt
      })
    }

    const setRandomValue = (key, len = 16) => {
      dataForm.value[key] = getRandomHex(len)
    }

    const showUserEditPrompt = () => {
      const username = window.prompt('Input username', 'admin')
      if (!username) {
        return
      }
      const password = window.prompt('Input password', 'admin')
      if (!password) {
        return
      }

      dataForm.value['AUTH_USERS'] = genUserData(username, password)
      window.$message.success('OK')
    }

    const handleSaveAs = async () => {
      // @ts-ignore
      const handle = await window.showSaveFilePicker({
        suggestedName: '.env',
      })
      const writable = await handle.createWritable()

      await writable.write(outputText.value)
      await writable.close()

      window.$message.success('Saved!')
    }

    return {
      formRef,
      dataForm,
      dataFormRules,
      outputText,
      handleGenerate,
      EnvConfigMap,
      RandomKeys: {
        JWT_SECRET: true,
        KN_HTTP_CRYPT_KEY: true,
      },
      setRandomValue,
      showUserEditPrompt,
      handleSaveAs,
    }
  },
})
</script>

<template>
  <n-layout class="env-generator">
    <n-layout-content>
      <n-card class="card-gen" title="① .env Generator">
        <n-form
          size="small"
          ref="formRef"
          :model="dataForm"
          :rules="dataFormRules"
          label-placement="left"
          label-width="auto"
          require-mark-placement="right-hanging"
        >
          <n-form-item
            v-for="(val, key) of EnvConfigMap"
            :key="key"
            :path="key"
            :label="val.label || key"
          >
            <n-input
              v-model:value="dataForm[key]"
              :disabled="key === 'AUTH_USERS'"
              :placeholder="val.placeholder || ''"
            />
            <n-space style="margin-left: 8px" :wrap="false" size="small">
              <n-button v-if="key === 'AUTH_USERS'" @click="showUserEditPrompt">🖍</n-button>
              <n-button v-if="RandomKeys[key]" @click="setRandomValue(key)">🎲</n-button>
              <n-popover v-if="val.tip" trigger="hover" style="max-width: 300px">
                <template #trigger>
                  <n-button>❓</n-button>
                </template>
                <div v-html="val.tip"></div>
              </n-popover>
            </n-space>
          </n-form-item>
          <n-space justify="end">
            <n-button round @click="handleGenerate" type="primary" class="font-emoji">
              Generate
            </n-button>
          </n-space>
        </n-form>
      </n-card>
      <n-card class="card-result" title="② Result">
        <n-input
          class="input-text font-code"
          type="textarea"
          v-model:value="outputText"
          placeholder=".env"
          rows="15"
        ></n-input>

        <n-space v-if="outputText" justify="space-between">
          <textarea
            class="font-code"
            readonly
            cols="50"
            rows="6"
            style="resize: none; color: #0f0; background-color: black"
            :value="`[Project Root]
├─ node_modules
├─ .env           <-- Place .env file here!
├─ package.json
└─ other files...`"
          ></textarea>
          <n-button round type="primary" @click="handleSaveAs"> Save as .env</n-button>
        </n-space>
      </n-card>
    </n-layout-content>
  </n-layout>
</template>

<style lang="scss" scoped>
.env-generator {
  height: 100%;
  :deep(.n-layout-scroll-container) {
    display: flex;
    justify-content: center;
    min-width: 500px;

    @media screen and (max-width: 800px) {
      flex-direction: column;
    }
  }
  .card-result {
    .input-text {
      margin-bottom: 10px;
      :deep(textarea) {
        word-break: break-all !important;
      }
    }
  }
}
</style>
