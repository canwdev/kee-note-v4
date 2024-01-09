<script lang="ts">
import {defineComponent} from 'vue'
import {useKeepassEntryList} from '@/hooks/use-keepass'
import {useCommonActions} from '@/components/NoteViews/use-common-actions'
import DialogGroupSelect from '@/components/NoteViews/Dialogs/DialogGroupSelect.vue'
import DialogEntryPreview from '@/components/NoteViews/Dialogs/DialogEntryPreview.vue'
import CalendarLite from '@/components/CommonUI/CalendarLite/index.vue'
import MiniList from '@/components/NoteViews/Calendar/MiniList.vue'
import LunarDay from '@/components/NoteViews/Calendar/LunarDay.vue'
import {useSettingsStore} from '@/store/settings'
import {useCnHoliday} from '@/components/NoteViews/Calendar/use-holiday'
import {pad2Num} from '@/utils'
import HolidayDisplay from '@/components/NoteViews/Calendar/HolidayDisplay.vue'
import {CalendarCheckmark20Regular} from '@vicons/fluent'
import DataVisualization from '@/components/NoteViews/DataVisualization/index.vue'

export default defineComponent({
  name: 'CalendarView',
  components: {
    DataVisualization,
    CalendarCheckmark20Regular,
    HolidayDisplay,
    LunarDay,
    MiniList,
    CalendarLite,
    DialogGroupSelect,
    DialogEntryPreview,
  },
  setup() {
    const settingsStore = useSettingsStore()

    const calendarRef = ref()
    const currentDateRef = ref(new Date())

    const {calendarData, getEntryList, keeStore, groupUuid} = useKeepassEntryList({
      isCalendar: true,
      getCalendarParams: () => {
        const date = currentDateRef.value

        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)

        return {
          startDate: firstDay.getTime(),
          endDate: lastDay.getTime(),
        }
      },
    })

    onMounted(async () => {
      if (keeStore.isDbOpened) {
        await getEntryList()
      }
    })

    const getAttributes = (mm) => {
      try {
        const year = mm.year()
        const month = mm.month() + 1
        const date = mm.date()

        return calendarData.value[year][month][date]
      } catch (e) {
        // console.error(e)
      }
    }

    const handlePreview = (item) => {
      nodeAction(item, () => {
        isShowPreviewModal.value = true
      })
    }
    const handleItemContextMenu = (event: MouseEvent, item?) => {
      handleContextmenu(event, item)
    }

    const {
      editingNode,
      nodeAction,
      handleContextmenu,
      isShowGroupSelectModal,
      isShowPreviewModal,
      handleSelectGroup,
      getMenuOptions,
      ...contextMenuEtc
    } = useCommonActions({getEntryList})

    const holidayDate = ref<Date>(new Date())
    const {currentYearHolidayMap} = useCnHoliday(holidayDate)
    const handleCalendarDateChange = (date) => {
      if (date) {
        holidayDate.value = date.toDate()
      }
    }
    const getHoliday = (mm) => {
      try {
        if (!currentYearHolidayMap.value) {
          return null
        }
        const month = pad2Num(mm.month() + 1)
        const date = pad2Num(mm.date())
        if (currentYearHolidayMap.value[month]) {
          return currentYearHolidayMap.value[month][date]
        }
        return null
      } catch (e: any) {
        return e.message
      }
    }

    const isShowDataVisualization = ref(true)

    return {
      settingsStore,
      calendarRef,
      getAttributes,
      handlePreview,
      handleItemContextMenu,
      editingNode,
      nodeAction,
      handleContextmenu,
      isShowGroupSelectModal,
      isShowPreviewModal,
      handleSelectGroup,
      getMenuOptions,
      ...contextMenuEtc,
      groupUuid,
      currentDateRef,
      calendarData,
      handleCalendarDateChange,
      getHoliday,
      isShowDataVisualization,
    }
  },
})
</script>
<template>
  <div class="calendar-view-v2">
    <CalendarLite
      v-show="!isShowDataVisualization"
      @dateChange="handleCalendarDateChange"
      @onDayContextMenu="({event, day}) => handleItemContextMenu(event, {day})"
    >
      <template #headerLeft>
        <n-icon
          size="24"
          class="cursor-pointer"
          title="Data Visualization"
          @click="isShowDataVisualization = true"
        >
          <CalendarCheckmark20Regular />
        </n-icon>
      </template>
      <template #day="{day}">
        <div class="mini-list-scroll">
          <MiniList
            :list="getAttributes(day)"
            @onItemClick="(item) => handlePreview(item)"
            @onItemContextMenu="({event, item}) => handleItemContextMenu(event, item)"
          />
        </div>
        <HolidayDisplay v-if="settingsStore.calendarShowLunar" :item="getHoliday(day)" />
        <span class="date-title">
          <LunarDay
            v-if="settingsStore.calendarShowLunar"
            :year="day.year()"
            :month="day.month() + 1"
            :day="day.date()"
            class="lunar-label"
          />
          {{ day.date() }}
        </span>
      </template>
    </CalendarLite>

    <DataVisualization v-if="isShowDataVisualization" @onBack="isShowDataVisualization = false" />

    <n-dropdown
      trigger="manual"
      placement="bottom-start"
      :show="showRightMenu"
      :options="rightMenuOptions"
      :x="xRef"
      :y="yRef"
      @select="handleSelect"
      key-field="label"
      :on-clickoutside="handleClickOutside"
    />

    <DialogGroupSelect
      v-model:visible="isShowGroupSelectModal"
      :value="groupUuid"
      @onSubmit="handleSelectGroup"
    />

    <DialogEntryPreview
      v-model:visible="isShowPreviewModal"
      :uuid="editingNode && editingNode.uuid"
    />
  </div>
</template>

<style lang="scss">
.calendar-view-v2 {
  height: 100%;
  user-select: none;
  .mini-list-scroll {
    height: calc(100px - 30px);
    overflow-y: auto;
  }
  .holiday-display {
    position: absolute;
    left: 8px;
    bottom: 8px;
  }
}
</style>
