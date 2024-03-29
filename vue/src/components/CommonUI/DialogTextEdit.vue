<script lang="ts">
import {defineComponent, ref} from 'vue'
import {useModelWrapper} from '@/hooks/use-model-wrapper'

export default defineComponent({
  name: 'DialogTextEdit',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Text edit',
    },
    placeholder: {
      type: String,
      default: 'Input text',
    },
    // 默认文本
    text: {
      type: String,
      default: '',
    },
    isTextarea: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    // 输入框为input的type
    type: {
      type: String,
      default: 'text',
    },
  },
  emits: ['onSave'],
  setup(props, {emit}) {
    const {text} = toRefs(props)
    const mVisible = useModelWrapper(props, emit, 'visible')

    const inputRef = ref()
    const editingText = ref('')
    watch(
      text,
      (val) => {
        editingText.value = val
      },
      {immediate: true}
    )

    watch(mVisible, (val) => {
      if (val) {
        setTimeout(() => {
          inputRef.value?.focus()
        })
      }
    })

    return {
      inputRef,
      mVisible,
      editingText,
      handleSave() {
        emit('onSave', editingText.value)
      },
    }
  },
})
</script>

<template>
  <n-modal
    style="width: 700px"
    preset="dialog"
    negative-text="Cancel"
    positive-text="OK"
    :title="title"
    @positive-click="handleSave"
    @negative-click="mVisible = false"
    @close="mVisible = false"
    :show="mVisible"
    :clearable="clearable"
  >
    <template v-if="mVisible">
      <n-input
        ref="inputRef"
        type="textarea"
        v-if="isTextarea"
        v-model:value="editingText"
        style="height: 500px"
      />
      <n-input
        ref="inputRef"
        v-else
        :type="type"
        v-model:value="editingText"
        class="font-code"
        :rows="isTextarea ? 25 : null"
        :placeholder="placeholder"
        autofocus
        :clearable="clearable"
      ></n-input>
    </template>
  </n-modal>
</template>
