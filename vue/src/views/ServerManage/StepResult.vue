<script lang="ts">
import {defineComponent} from 'vue'
import {isDev} from '@/enum'
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {getServerInfo, setServerEnv} from '@/api'

export default defineComponent({
  name: 'StepResult',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  setup(props, {emit}) {
    const mValue = useModelWrapper(props, emit)
    const handleSaveAs = async () => {
      // @ts-ignore
      const handle = await window.showSaveFilePicker({
        suggestedName: '.env',
      })
      const writable = await handle.createWritable()

      await writable.write(mValue.value)
      await writable.close()

      window.$message.success('Saved!')
    }

    const enableSaveToServer = ref(false)
    onMounted(async () => {
      const {has_env_file} = await getServerInfo()
      if (!has_env_file) {
        enableSaveToServer.value = true
      }
    })

    const isSaving = ref(false)
    const handleSaveToServer = async () => {
      try {
        isSaving.value = true
        const {message} = await setServerEnv({
          env: mValue.value,
        })
        window.$dialog.success({
          title: 'Saved!',
          content: message,
          positiveText: 'OK',
        })
      } catch (e) {
        console.error(e)
        window.$message.error(e.message)
      } finally {
        isSaving.value = false
      }
    }

    return {
      isDev,
      mValue,
      handleSaveAs,
      handleSaveToServer,
      enableSaveToServer,
      isSaving,
    }
  },
})
</script>

<template>
  <n-card class="card-result">
    <n-input
      class="input-text font-code"
      type="textarea"
      v-model:value="mValue"
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

        <n-button
          v-if="enableSaveToServer"
          :disabled="!mValue"
          @click="handleSaveToServer"
          type="primary"
          :loading="isSaving"
        >
          Save to Server
        </n-button>
        <n-button v-else disabled> Please save .env file manually </n-button>
      </n-space>
      <n-button
        :disabled="!mValue"
        :type="enableSaveToServer ? 'default' : 'primary'"
        @click="handleSaveAs"
      >
        Save as .env
      </n-button>
    </n-space>
  </n-card>
</template>

<style lang="scss" scoped>
.card-result {
  .input-text {
    margin-bottom: 10px;
    :deep(textarea) {
      word-break: break-all !important;
    }
  }
}
</style>
