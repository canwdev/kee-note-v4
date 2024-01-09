<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {HolidayItem} from '@/components/NoteViews/Calendar/use-holiday'

export default defineComponent({
  name: 'HolidayDisplay',
  props: {
    item: {
      type: Object as PropType<HolidayItem>,
    },
  },
})
</script>

<template>
  <div
    v-if="item"
    class="holiday-display"
    :class="{'is-work': !item.isOffDay}"
    :title="item.name + (item.isOffDay ? '(放假)' : '(补班)')"
  >
    {{ item.isOffDay ? item.name : '班' }}
  </div>
</template>

<style lang="scss" scoped>
.holiday-display {
  font-size: 12px;
  background-color: #f44336;
  color: white;
  line-height: 1;
  padding: 2px;
  &.is-work {
    background-color: #4caf50;
    color: white;
  }
}
</style>
