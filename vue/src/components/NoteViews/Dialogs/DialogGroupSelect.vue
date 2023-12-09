<script lang="ts">
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {ref} from 'vue'
import {GroupItem} from '@/enum/kdbx'
import {kService} from '@/api'
import {TextBulletListTree16Regular} from '@vicons/fluent'

export default defineComponent({
  name: 'DialogGroupSelect',
  components: {TextBulletListTree16Regular},
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
  emits: ['onSubmit', 'update:visible'],
  setup(props, {emit}) {
    const {value: propValue} = toRefs(props)
    const mVisible = useModelWrapper(props, emit, 'visible')
    const groupUuid = ref<string>('')

    const groupTree = ref<GroupItem[]>([])
    const getGroupTree = async () => {
      groupTree.value = await kService.getGroupTree()
    }

    watch(mVisible, (val) => {
      if (val) {
        groupUuid.value = propValue.value
        getGroupTree()
      } else {
        setTimeout(() => {
          groupUuid.value = ''
          groupTree.value = []
        }, 1000)
      }
    })

    const selectedKeys = computed({
      get(): string[] {
        if (!groupUuid.value) {
          return []
        }
        return [String(groupUuid.value)]
      },
      set(val: string[]) {
        if (!val) {
          val = []
        }
        groupUuid.value = val[0]
      },
    })

    return {
      groupTree,
      mVisible,
      selectedKeys,
      handleOK(e: MouseEvent) {
        e.preventDefault()

        if (!groupUuid.value) {
          return
        }
        emit('onSubmit', groupUuid.value)
        mVisible.value = false
      },
      dialogIconRender() {
        return h(TextBulletListTree16Regular)
      },
    }
  },
})
</script>

<template>
  <n-modal v-model:show="mVisible" :icon="dialogIconRender" preset="dialog" title="Select Group">
    <n-tree
      :data="groupTree"
      key-field="uuid"
      label-field="title"
      children-field="children"
      selectable
      default-expand-all
      v-model:selected-keys="selectedKeys"
    />
    <n-space style="display: flex; justify-content: flex-end">
      <n-button round @click="mVisible = false"> Cancel </n-button>
      <n-button round type="primary" @click="handleOK"> OK </n-button>
    </n-space>
  </n-modal>
</template>
