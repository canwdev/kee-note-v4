<script lang="ts">
import {defineComponent, PropType} from 'vue'
import AnnualHeatMap from '@/components/NoteViews/DataVisualization/AnnualHeatMap.vue'
import {CalendarData} from '@/hooks/use-keepass'

export default defineComponent({
  name: 'DataVisualization',
  components: {AnnualHeatMap},
  props: {
    calendarData: {type: Object as PropType<CalendarData>},
  },
})
</script>

<template>
  <div class="data-visualization">
    <n-page-header class="nav-header" title="Data Visualization" @back="$emit('onBack')">
    </n-page-header>
    <div class="visualization-content">
      <AnnualHeatMap :calendar-data="calendarData" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-visualization {
  padding: 0 16px;
  position: relative;
  .nav-header {
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(10px);
    padding: 8px 0;
  }
  .visualization-content {
    margin-top: 16px;
  }
}
</style>
