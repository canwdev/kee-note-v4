<script lang="ts">
import {defineComponent} from 'vue'
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {getLocalStorageObject, LS_KEY_DONT_SAVE_HISTORY, LS_KEY_HISTORY_LIST} from '@/enum'

export default defineComponent({
  name: 'HistoryDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, {emit}) {
    const mVisible = useModelWrapper(props, emit, 'visible')
    const isSaveHistory = ref(!Boolean(localStorage.getItem(LS_KEY_DONT_SAVE_HISTORY)))
    const historyList = ref(getLocalStorageObject(LS_KEY_HISTORY_LIST, []))
    watch(isSaveHistory, (val) => {
      if (val) {
        localStorage.removeItem(LS_KEY_DONT_SAVE_HISTORY)
      } else {
        localStorage.setItem(LS_KEY_DONT_SAVE_HISTORY, '1')
        handleClearHistory()
      }
    })

    const handleClearHistory = () => {
      localStorage.removeItem(LS_KEY_HISTORY_LIST)
      historyList.value = []
    }

    const removeHistoryItem = (index: number) => {
      historyList.value.splice(index, 1)
      localStorage.setItem(LS_KEY_HISTORY_LIST, JSON.stringify(historyList.value))
    }

    return {
      mVisible,
      isSaveHistory,
      historyList,
      removeHistoryItem,
    }
  },
})
</script>

<template>
  <n-modal v-model:show="mVisible" preset="dialog" title="History">
    <n-list>
      <n-list-item>
        <n-thing title="Enable History" description="" />
        <template #suffix>
          <n-switch v-model:value="isSaveHistory" />
        </template>
      </n-list-item>
      <n-list-item v-if="isSaveHistory">
        <n-list hoverable clickable>
          <n-list-item
            v-for="(item, index) in historyList"
            :key="item.dbPath"
            @click="$emit('historyItemClick', item)"
          >
            <n-thing :title="item.dbPath" />
            <template #suffix>
              <n-button @click.stop="removeHistoryItem(index)" round>⨉</n-button>
            </template>
          </n-list-item>
        </n-list>
      </n-list-item>
    </n-list>
  </n-modal>
</template>
