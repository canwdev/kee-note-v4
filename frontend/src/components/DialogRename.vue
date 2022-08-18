<script lang="ts">
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {FormInst, FormRules, FormValidationError} from 'naive-ui'
import {ref} from 'vue'

export default defineComponent({
  name: 'DialogRename',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: '',
    },
  },
  emits: ['onRename'],
  setup(props, {emit}) {
    const {value: propValue} = toRefs(props)
    const mVisible = useModelWrapper(props, emit, 'visible')
    const formRef = ref<FormInst | null>(null)
    const modelRef = ref<{name: string}>({
      name: '',
    })
    const rules: FormRules = {
      name: [
        {
          required: true,
          message: 'Name is required',
          trigger: ['blur'],
        },
      ],
    }

    watch(mVisible, (val) => {
      if (val) {
        modelRef.value.name = propValue.value
      } else {
        setTimeout(() => {
          modelRef.value.name = ''
        }, 1000)
      }
    })

    return {
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
          emit('onRename', modelRef.value.name)
          mVisible.value = false
        })
      },
    }
  },
})
</script>

<template>
  <n-modal v-model:show="mVisible" preset="dialog" title="Edit Group">
    <n-form ref="formRef" :model="modelRef" :rules="rules">
      <n-form-item path="name" label="Name">
        <n-input v-model:value="modelRef.name" />
      </n-form-item>

      <n-space style="display: flex; justify-content: flex-end">
        <n-button round @click="mVisible = false"> Cancel </n-button>
        <n-button round type="primary" @click="handleOK"> OK </n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>
