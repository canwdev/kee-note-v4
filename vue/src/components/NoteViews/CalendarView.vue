<script lang="ts">
import {defineComponent} from 'vue'
import {Calendar} from 'v-calendar'
import 'v-calendar/dist/style.css'
import {useMainStore} from '@/store/main-store'
import LunarDay from '@/components/NoteViews/Calendar/LunarDay.vue'
import {useKeepassEntryList} from '@/hooks/use-keepass'
import {EntryItem} from '@/enum/kdbx'
import {useRouter} from 'vue-router'
import IconDisplay from '@/components/IconDisplay.vue'
import {useCommonActions} from '@/components/NoteViews/use-common-actions'
import DialogGroupSelect from '@/components/DialogGroupSelect.vue'
import DialogEntryPreview from '@/components/DialogEntryPreview.vue'

export default defineComponent({
  name: 'CalendarView',
  components: {
    Calendar,
    LunarDay,
    IconDisplay,
    DialogGroupSelect,
    DialogEntryPreview,
  },
  setup() {
    const router = useRouter()
    const mainStore = useMainStore()

    const calendarRef = ref()
    const currentDateRef = ref(new Date())
    const isInitialized = ref(false)

    // trigger refresh when init
    const initCalendar = () => {
      const calendar = calendarRef.value

      const date = currentDateRef.value
      const year = date.getFullYear()
      const month = date.getMonth()

      calendar.move({month: month + 1, year: year})
      isInitialized.value = true
    }

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
      initCalendar()
    })

    const calendarAttributes = computed(() => {
      const date = currentDateRef.value

      if (!date || !calendarData.value) {
        return []
      }

      const year = date.getFullYear()
      const month = date.getMonth() + 1

      const list = (calendarData.value[year] && calendarData.value[year][month]) || []

      return list.map((entry: EntryItem, index) => {
        return {
          key: index,
          customData: entry,
          dates: entry.creationTime,
        }
      })
    })

    const handlePreview = (attr) => {
      const {customData} = attr

      nodeAction(customData, () => {
        isShowPreviewModal.value = true
      })
    }
    const handleItemContextMenu = (event: MouseEvent, attr) => {
      // console.log('handleItemContextMenu', attr)
      handleContextmenu(event, attr.customData)
    }

    const handlePageChange = ({year, month}) => {
      if (!isInitialized.value) return
      // console.log('handlePageChange', year, month)
      currentDateRef.value = new Date(year, month - 1, 1)
      getEntryList()
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
      mainStore,
      calendarRef,
      calendarAttributes,
      handlePreview,
      handleItemContextMenu,
      handlePageChange,
      editingNode,
      nodeAction,
      handleContextmenu,
      isShowGroupSelectModal,
      isShowPreviewModal,
      handleSelectGroup,
      getMenuOptions,
      ...contextMenuEtc,
      groupUuid,
    }
  },
})
</script>
<template>
  <div class="calendar-view">
    <n-scrollbar trigger="none" x-scrollable>
      <div class="content-padding">
        <Calendar
          ref="calendarRef"
          is-expanded
          :is-dark="mainStore.isAppDarkMode"
          :attributes="calendarAttributes"
          title-position="left"
          trim-weeks
          @update:from-page="handlePageChange"
        >
          <template v-slot:day-content="{day, attributes}">
            <div class="day-content">
              <div class="entry-list">
                <n-scrollbar>
                  <template v-for="attr in attributes">
                    <div
                      v-if="attr.customData"
                      :key="attr.key"
                      class="entry-item cursor-pointer overflow-hidden"
                      @click="handlePreview(attr)"
                      @contextmenu="handleItemContextMenu($event, attr)"
                    >
                      <IconDisplay
                        :icon="attr.customData.icon"
                        :size="16"
                        :bg-color="attr.customData.bgColor"
                        :fg-color="attr.customData.fgColor"
                      />
                      <span class="entry-title">{{ attr.customData.title }}</span>
                    </div>
                  </template>
                </n-scrollbar>
              </div>
              <span class="day-label-wrap">
                <LunarDay :year="day.year" :month="day.month" :day="day.day" class="lunar-label" />
                <span class="day-label">{{ day.day }}</span>
              </span>
            </div>
          </template>
        </Calendar>
      </div>
    </n-scrollbar>

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
.calendar-view {
  height: 100%;
  user-select: none;
  .vc-container {
    min-width: 620px;
    --day-border: 1px solid rgba(160, 174, 192, 0.4);
    --day-width: 120px;
    --day-height: 120px;
    width: 100%;

    @media screen and (max-width: $mq_pc_min_width) {
      --day-width: 100px;
      --day-height: 100px;
    }

    @media screen and (max-width: $mq_tablet_width) {
      --day-width: 80px;
      --day-height: 80px;
    }

    @media screen and (max-width: $mq_mobile_width) {
      --day-width: 60px;
      --day-height: 60px;
    }

    &.vc-dark {
      background: #1d1d1d;

      .vc-weekday {
        color: $bg_color;
      }
    }

    &.vc-light {
      .vc-header {
        button {
          background-color: white;
        }
      }
    }

    .vc-header {
      padding-bottom: 10px;
      height: auto;
    }

    .vc-weeks {
      padding: 0;
    }

    .vc-weekday {
      border-bottom: var(--day-border);
      border-top: var(--day-border);
      padding: 5px 0;
    }

    .vc-day {
      position: relative;
      text-align: left;
      height: var(--day-height);
      min-width: var(--day-width);

      &.weekday-1,
      &.weekday-7 {
        .lunar-label {
          color: $color_theme_red;
        }

        .day-label {
          color: $color_theme_red;
        }
      }

      &.is-today {
        &:before {
          position: absolute;
          display: block;
          content: '今';
          left: 0;
          bottom: 0;
          color: white;
          width: 18px;
          height: 18px;
          font-size: 12px;
          transform: scale(0.8);
          transform-origin: right top;
          background: $color_theme_red;
          border-radius: 50%;
          text-align: center;
        }

        &:after {
          content: ' ';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: $color_theme_red;
        }
      }

      &:not(.on-bottom) {
        border-bottom: var(--day-border);

        &.weekday-1 {
        }
      }

      &:not(.on-right) {
        border-right: var(--day-border);
      }
    }

    .on-left {
      margin-right: 0;
    }

    .on-right {
      margin-left: 0;
    }

    .vc-day-dots {
      margin-bottom: 5px;
    }
  }
  .vc-container {
    .day-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      z-index: 10;

      .day-label-wrap {
        font-size: 14px;
        padding: 0 4px 2px;
        text-align: right;

        .lunar-label {
          font-size: 12px;
          margin-right: 4px;
          opacity: 0.8;
        }

        .day-label {
          font-weight: 500;
        }
      }

      .entry-list {
        overflow: auto;
        flex-grow: 1;

        .n-scrollbar-content {
        }
      }

      .entry-item {
        padding: 3px 4px;
        font-size: 11px;
        line-height: 1.2;
        cursor: pointer;
        display: flex;
        align-items: center;
        border-bottom: 1px dashed rgba(134, 134, 134, 0.23);

        &:hover {
          opacity: 0.8;
        }

        .icon-display {
          flex-shrink: 0;
        }

        .entry-title {
          display: inline;
          margin-left: 2px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>
