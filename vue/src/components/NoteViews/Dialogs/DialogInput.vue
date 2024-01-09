<script lang="ts">
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {FormInst, FormRules, FormValidationError} from 'naive-ui'
import {ref} from 'vue'
import {NotepadEdit16Regular} from '@vicons/fluent'

export default defineComponent({
  name: 'DialogInput',
  components: {NotepadEdit16Regular},
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: '',
    },
    dialogTitle: {
      type: String,
      default: 'Input',
    },
    inputLabel: {
      type: String,
      default: 'Input',
    },
    isPassword: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['onSubmit', 'update:visible'],
  setup(props, {emit}) {
    const {value: propValue, inputLabel, required} = toRefs(props)
    const mVisible = useModelWrapper(props, emit, 'visible')
    const formRef = ref<FormInst | null>(null)
    const inputRef = ref<any>(null)
    const modelRef = reactive<{name: string}>({
      name: '',
    })
    const rules: FormRules = {
      name: [
        {
          required: required.value,
          message: `${inputLabel.value} is required`,
          trigger: ['blur'],
        },
      ],
    }

    watch(mVisible, (val) => {
      if (val) {
        modelRef.name = propValue.value
        nextTick(() => {
          if (inputRef.value) {
            inputRef.value.focus()
          }
        })
      } else {
        setTimeout(() => {
          modelRef.name = ''
        }, 1000)
      }
    })

    return {
      inputRef,
      formRef,
      mVisible,
      modelRef,
      rules,
      handleOK(e: MouseEvent) {
        e.preventDefault()
        formRef.value?.validate((errors: Array<FormValidationError> | undefined) => {
          if (errors) {
            return
          }
          emit('onSubmit', modelRef.name)
          mVisible.value = false
        })
      },
      dialogIconRender() {
        return h(NotepadEdit16Regular)
      },
    }
  },
})
</script>

<template>
  <n-modal v-model:show="mVisible" preset="dialog" :icon="dialogIconRender" :title="dialogTitle">
    <n-form ref="formRef" :model="modelRef" :rules="rules">
      <n-form-item path="name" :label="inputLabel">
        <n-input
          ref="inputRef"
          v-model:value="modelRef.name"
          :type="isPassword ? 'password' : 'text'"
          show-password-on="click"
          @keyup.enter="handleOK"
        />
      </n-form-item>

      <n-space style="display: flex; justify-content: flex-end">
        <n-button @click="mVisible = false"> Cancel </n-button>
        <n-button type="primary" @click="handleOK"> OK </n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>
