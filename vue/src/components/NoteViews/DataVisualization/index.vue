<script lang="ts">
import {defineComponent} from 'vue'
import AnnualHeatMap from '@/components/NoteViews/DataVisualization/AnnualHeatMap.vue'

export default defineComponent({
  name: 'DataVisualization',
  components: {AnnualHeatMap},
})
</script>

<template>
  <div class="data-visualization">
    <n-page-header class="nav-header" title="Data Visualization" @back="$emit('onBack')">
    </n-page-header>
    <div class="visualization-content">
      <AnnualHeatMap />
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
