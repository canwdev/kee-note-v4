<script lang="ts">
import {defineComponent, ref} from 'vue'
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {
  DatabasePerson20Regular,
  DocumentEdit20Regular,
  Folder16Regular,
  Key16Regular,
  KeyMultiple20Regular,
} from '@vicons/fluent'
import {FormInst, FormRules, FormValidationError} from 'naive-ui'

export default defineComponent({
  name: 'KdbxConfigDialog',
  components: {DatabasePerson20Regular, Key16Regular, Folder16Regular, KeyMultiple20Regular},
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, {emit}) {
    const mVisible = useModelWrapper(props, emit, 'visible')
    const formRef = ref<FormInst | null>(null)
    const dataForm = ref<ModelType>({
      kdbxOpenOptions: {
        dbPath: '',
        password: '',
        keyPath: '',
      },
      isRelativeBase: false,
    })
    const dataFormRules: FormRules = {
      'kdbxOpenOptions.dbPath': [
        {
          required: true,
          trigger: ['blur'],
        },
      ],
    }

    return {
      formRef,
      mVisible,
      dialogIconRender() {
        return h(DocumentEdit20Regular)
      },
      dataForm,
      dataFormRules,
      handleValidateButtonClick(e: MouseEvent) {
        e.preventDefault()
        formRef.value?.validate((errors: Array<FormValidationError> | undefined) => {
          if (errors) {
            message.error('Invalid Form!')
            return
          }
          emit('submit', dataForm.value)
          mVisible.value = false
        })
      },
    }
  },
})
</script>

<template>
  <n-modal v-model:show="mVisible" preset="dialog" :icon="dialogIconRender" title="Kdbx Config">
    <n-form ref="formRef" :model="dataForm" :rules="dataFormRules">
      <n-form-item path="dataForm.isRelativeBase" label="Relative File Path">
        <n-switch v-model:value="dataForm.isRelativeBase" />
      </n-form-item>

      <n-form-item path="kdbxOpenOptions.dbPath" label="Kdbx Path">
        <n-input-group>
          <n-input-group-label>
            <n-icon size="16"><DatabasePerson20Regular /></n-icon>
          </n-input-group-label>
          <n-input
            v-model:value="dataForm.kdbxOpenOptions.dbPath"
            @keyup.enter="handleValidateButtonClick"
            clearable
            placeholder="Input kdbx file path"
          />
        </n-input-group>
      </n-form-item>
      <n-form-item path="kdbxOpenOptions.password" label="Password (Optional)">
        <n-input-group>
          <n-input-group-label>
            <n-icon size="16"><Key16Regular /></n-icon>
          </n-input-group-label>
          <n-input
            ref="inputPwdRef"
            v-model:value="dataForm.kdbxOpenOptions.password"
            type="password"
            show-password-on="click"
            clearable
            @keyup.enter="handleValidateButtonClick"
            placeholder="Please input password"
            class="font-code"
          />
        </n-input-group>
      </n-form-item>
      <n-form-item path="kdbxOpenOptions.keyPath" label="Key Path (Required if there is a key)">
        <n-input-group>
          <n-input-group-label>
            <n-icon size="16"><KeyMultiple20Regular /></n-icon>
          </n-input-group-label>
          <n-input
            v-model:value="dataForm.kdbxOpenOptions.keyPath"
            @keyup.enter="handleValidateButtonClick"
            show-password-on="click"
            clearable
            placeholder="Input key file path"
            class="font-code"
          />
        </n-input-group>
      </n-form-item>

      <n-space style="display: flex; justify-content: flex-end">
        <n-button strong type="primary" @click="handleValidateButtonClick" style="color: white">
          Done
        </n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>
