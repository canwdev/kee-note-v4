<script lang="ts">
import {defineComponent} from 'vue'
import {useMainStore} from '@/store/main'
import {useKeepassEntryList} from '@/hooks/use-keepass'
import {useRouter} from 'vue-router'
import {useCommonActions} from '@/components/NoteViews/use-common-actions'
import DialogGroupSelect from '@/components/NoteViews/Dialogs/DialogGroupSelect.vue'
import DialogEntryPreview from '@/components/NoteViews/Dialogs/DialogEntryPreview.vue'
import CalendarLite from '@/components/CommonUI/CalendarLite/index.vue'
import MiniList from '@/components/NoteViews/Calendar/MiniList.vue'
import LunarDay from '@/components/NoteViews/Calendar/LunarDay.vue'
import {useSettingsStore} from '@/store/settings'

export default defineComponent({
  name: 'CalendarView',
  components: {
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
    }
  },
})
</script>
<template>
  <div class="calendar-view-v2">
    <CalendarLite @onDayContextMenu="({event, day}) => handleItemContextMenu(event, {day})">
      <template #day="{day}">
        <div class="mini-list-scroll">
          <MiniList
            :list="getAttributes(day)"
            @onItemClick="(item) => handlePreview(item)"
            @onItemContextMenu="({event, item}) => handleItemContextMenu(event, item)"
          />
        </div>
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
}
</style>
