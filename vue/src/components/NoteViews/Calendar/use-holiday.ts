import {useSettingsStore} from '@/store/settings'

export type HolidayItem = {
  // 节日名称
  name: string
  // ISO 8601 日期
  date: string
  // 是否为休息日，否为补班
  isOffDay: boolean
}

type HolidayMap = {
  // month
  [key: string]: {
    // date
    [key: string]: HolidayItem
  }
}

export const useCnHoliday = (dateRef) => {
  const currentYearHolidayMap = ref<HolidayMap>({})
  const currentYear = ref<number>(-1)
  const settingsStore = useSettingsStore()

  const getHolidayData = async () => {
    try {
      if (!settingsStore.calendarShowLunar) {
        return
      }
      if (currentYear.value < 0) {
        return
      }
      const date = dateRef.value
      currentYear.value = date.getFullYear()
      const res = await fetch(`/holiday-cn/${currentYear.value}.json`)
      const data = await res.json()
      const {days} = data

      const map: HolidayMap = {}
      days.forEach((item: HolidayItem) => {
        const {date} = item
        // date like 2024-01-01
        const [year, month, day] = date.split('-')
        // fill HolidayMap
        if (!map[month]) {
          map[month] = {}
        }
        map[month][day] = item
      })
      // console.log(map)
      currentYearHolidayMap.value = map
    } catch (e) {
      console.warn(e)
      currentYearHolidayMap.value = {}
    }
  }

  watch(currentYear, (val) => {
    // console.log('[currentYear]', val)
    getHolidayData()
  })

  watch(dateRef, (val) => {
    currentYear.value = val.getFullYear()
  })

  onMounted(() => {
    currentYear.value = dateRef.value.getFullYear()
  })

  return {
    currentYearHolidayMap,
  }
}
