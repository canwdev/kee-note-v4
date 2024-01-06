<script lang="ts">
import {defineComponent, ref} from 'vue'
import {FormInst, FormRules} from 'naive-ui'
import {hashSync} from 'bcryptjs'
import {getRandomHex} from '@/utils/my-crypt'
import {isDev} from '@/enum'
import {showInputPrompt} from '@/components/CommonUI/input-prompt'

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
  KN_KDBX_CONFIG_JSON: {
    label: 'Kdbx config json (TODO)',
    value: '',
    placeholder: '',
  },
  KN_HTTP_CRYPT_KEY: {
    label: 'HTTP Crypt key',
    tip: 'Recommended to enable in production mode to enhance security. it can encrypt/decrypt HTTP request query/body and response body',
    value: '',
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
    const currentStep = ref(1)

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
        currentStep.value = 2
      })
    }

    const setRandomValue = (key, len = 16) => {
      dataForm.value[key] = getRandomHex(len)
    }

    const showUserEditPrompt = async () => {
      const username = await showInputPrompt({
        title: 'Input username',
        value: 'admin',
      })
      if (!username) {
        return
      }
      const password = await showInputPrompt({
        title: 'Input password',
        value: 'admin',
      })
      if (!password) {
        return
      }

      dataForm.value['AUTH_USERS'] = genUserData(username, password)
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
      isDev,
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
      currentStep,
    }
  },
})
</script>

<template>
  <div class="env-generator">
    <n-card size="small" style="position: sticky; top: 0; z-index: 100; margin-bottom: 10px">
      <n-page-header subtitle="" @back="$router.push({name: 'HomeView'})">
        <template #title>KeeNote Server `.env` Generator</template>
        <template #extra> </template>
      </n-page-header>
    </n-card>

    <div class="generator-content">
      <n-steps :vertical="false" v-model:current="currentStep" style="padding: 10px 10px">
        <n-step title="Edit Config" description="Edit Nest.js server configuration information" />
        <n-step title="Save Result" description="Save the .env configuration file" />
      </n-steps>
      <n-card v-if="currentStep === 1" class="card-gen">
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
            <n-space style="margin-right: 8px" :wrap="false" size="small">
              <n-popover v-if="val.tip" trigger="hover" style="max-width: 300px" placement="bottom">
                <template #trigger>
                  <n-button secondary>❓</n-button>
                </template>
                <div v-html="val.tip"></div>
              </n-popover>
              <n-button
                secondary
                type="primary"
                v-if="key === 'AUTH_USERS'"
                @click="showUserEditPrompt"
                >🖍</n-button
              >
              <n-button
                secondary
                type="primary"
                v-if="key === 'KN_KDBX_CONFIG_JSON'"
                @click="showUserEditPrompt"
                >🖍</n-button
              >
              <n-button secondary type="primary" v-if="RandomKeys[key]" @click="setRandomValue(key)"
                >🎲</n-button
              >
            </n-space>
            <n-input
              v-model:value="dataForm[key]"
              :disabled="key === 'AUTH_USERS'"
              :placeholder="val.placeholder || ''"
              class="font-code"
            />
          </n-form-item>
          <n-space justify="end">
            <n-button @click="handleGenerate" type="primary" class="font-emoji">
              Generate
            </n-button>
          </n-space>
        </n-form>
      </n-card>
      <n-card v-if="currentStep === 2" class="card-result">
        <n-input
          class="input-text font-code"
          type="textarea"
          v-model:value="outputText"
          placeholder=".env"
          rows="15"
        ></n-input>

        <n-space justify="space-between">
          <n-space>
            <textarea
              class="font-code"
              readonly
              cols="39"
              rows="7"
              style="resize: none; color: #0f0; background-color: black"
              :value="
                isDev
                  ? `[Project Root]/electron
├─ node_modules
├─ .env     <-- Place .env file here!
├─ package.json
└─ ...`
                  : `[App Root]
├─ locales
├─ resources
├─ .env     <-- Place .env file here!
├─ KeeNote.exe
└─ ...
`
              "
            ></textarea>

            <n-button :disabled="true" @click="handleSaveAs" type="primary">
              Save to Server (TODO)
            </n-button>
          </n-space>
          <n-button :disabled="!outputText" type="primary" @click="handleSaveAs">
            Save as .env
          </n-button>
        </n-space>
      </n-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.env-generator {
  height: 100%;

  .generator-content {
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
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
