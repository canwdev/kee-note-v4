import {useRoute, useRouter} from 'vue-router'
import {useKeeStore} from '@/store/kee-store'
import {EntryItem} from '@/enum/kdbx'
import {kService} from '@/api'
import globalEventBus, {GlobalEvents} from '@/utils/bus'

interface CalendarData {
  // year
  [key: string]: {
    // month
    [key: string]: {
      // date
      [key: string]: EntryItem[]
    }
  }
}

export const useKeepassEntryList = (options?) => {
  const {isCalendar = false, getCalendarParams, cleanupFn} = options || {}
  const route = useRoute()

  const keeStore = useKeeStore()
  const entryList = ref<EntryItem[]>([])
  const calendarData = ref<CalendarData>({})

  const groupUuid = computed(() => {
    return route.query.groupUuid
  })

  onMounted(async () => {
    globalEventBus.on(GlobalEvents.REFRESH_ENTRY_LIST, getEntryList)
  })
  onBeforeUnmount(() => {
    globalEventBus.off(GlobalEvents.REFRESH_ENTRY_LIST, getEntryList)
  })

  watch(
    () => keeStore.isDbOpened,
    (val) => {
      if (val) {
        getEntryList()
      } else {
        entryList.value = []
      }
    }
  )

  watch(
    () => groupUuid.value,
    (val) => {
      getEntryList()
    }
  )

  const getEntryList = async () => {
    if (cleanupFn) {
      cleanupFn()
    }
    if (!groupUuid.value) {
      entryList.value = []
      return
    }
    if (isCalendar) {
      let params = {}
      if (getCalendarParams) {
        params = getCalendarParams()
      }
      calendarData.value = await kService.getGroupEntriesDeep({
        groupUuid: groupUuid.value,
        isDayMapped: true,
        ...params,
      })
    } else {
      entryList.value = await kService.getGroupEntries({
        groupUuid: groupUuid.value,
      })
    }
  }

  return {
    entryList,
    calendarData,
    getEntryList,
    keeStore,
    groupUuid,
  }
}
