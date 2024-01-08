<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {EntryItem} from '@/enum/kdbx'
import IconDisplay from '@/components/NoteViews/IconDisplay.vue'
import {useSettingsStore} from '@/store/settings'

export default defineComponent({
  name: 'MiniList',
  components: {
    IconDisplay,
  },
  props: {
    list: {
      type: Array as PropType<EntryItem[]>,
      default() {
        return []
      },
    },
  },
  emits: ['onItemClick', 'onItemContextMenu'],
  setup() {
    const settingsStore = useSettingsStore()
    return {
      settingsStore,
    }
  },
})
</script>

<template>
  <div class="mini-list">
    <div
      v-for="item in list"
      :key="item.uuid"
      class="entry-item"
      @click="$emit('onItemClick', item)"
      @contextmenu.stop="$emit('onItemContextMenu', {event: $event, item})"
      :title="item.title"
    >
      <IconDisplay :icon="item.icon" :size="16" :bg-color="item.bgColor" :fg-color="item.fgColor" />
      <span v-if="settingsStore.calendarShowTitle" class="entry-title">{{ item.title }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mini-list {
  display: flex;
  flex-wrap: wrap;
  padding: 4px;
  gap: 2px;
  .entry-item {
    padding: 2px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &:hover {
      opacity: 0.8;
    }

    .icon-display {
      flex-shrink: 0;
    }
    .entry-title {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 12px;
    }
  }
}
</style>
