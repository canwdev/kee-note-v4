<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {EntryItem} from '@/enum/kdbx'
import IconDisplay from '@/components/NoteViews/IconDisplay.vue'

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
})
</script>

<template>
  <div class="mini-list">
    <div
      v-for="item in list"
      :key="item.uuid"
      class="entry-item cursor-pointer overflow-hidden"
      @click="$emit('onItemClick', item)"
      @contextmenu="$emit('onItemContextMenu', {event: $event, item})"
    >
      <n-tooltip trigger="hover">
        <template #trigger>
          <IconDisplay
            :icon="item.icon"
            :size="16"
            :bg-color="item.bgColor"
            :fg-color="item.fgColor"
          />
        </template>
        <span class="entry-title">{{ item.title }}</span>
      </n-tooltip>
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
    padding: 4px;
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }

    .icon-display {
      flex-shrink: 0;
    }
  }
}
</style>
