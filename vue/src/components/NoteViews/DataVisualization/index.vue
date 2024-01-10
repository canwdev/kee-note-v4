<script lang="ts">
import {defineComponent, PropType} from 'vue'
import AnnualHeatMap from '@/components/NoteViews/DataVisualization/AnnualHeatMap.vue'
import {CalendarData, useKeeNoteEntryList} from '@/hooks/use-keenote'
import moment from 'moment'

export default defineComponent({
  name: 'DataVisualization',
  components: {AnnualHeatMap},
  props: {
    show: {type: Boolean, default: true},
  },
  setup(props, {emit}) {
    const {show} = toRefs(props)

    const {calendarData, getEntryList} = useKeeNoteEntryList({
      isCalendar: true,
    })

    const isRenderContent = ref(false)
    watch(
      show,
      async (val) => {
        // 只在第一次show时渲染，节约资源
        if (val && !isRenderContent.value) {
          await getEntryList()
          setTimeout(() => {
            isRenderContent.value = true
          })
        }
      },
      {immediate: true}
    )

    return {
      isRenderContent,
      getEntryList,
      calendarData,
    }
  },
})
</script>

<template>
  <div v-show="show" class="data-visualization">
    <n-page-header class="nav-header" title="Data Visualization" @back="$emit('onBack')">
      <template #extra>
        <n-space align="center">
          <n-button quaternary size="small" @click="getEntryList"> Refresh </n-button>
        </n-space>
      </template>
    </n-page-header>
    <div v-if="isRenderContent" class="visualization-content">
      <AnnualHeatMap
        :calendar-data="calendarData"
        @onSeriesClick="(data) => $emit('onSeriesClick', data)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-visualization {
  height: 100%;
  width: 100%;
  overflow: auto;
  padding: 0 16px;
  position: relative;
  box-sizing: border-box;
  .nav-header {
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(10px);
    padding: 10px 0;
  }
  .visualization-content {
    margin-top: 16px;
    width: 100%;
  }
}
</style>
