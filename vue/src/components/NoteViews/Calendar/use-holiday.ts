import {useSettingsStore} from '@/store/settings'
import {useLocalStorageObject} from '@/hooks/use-local-storage'
import moment from 'moment'
import {Ref} from 'vue'

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

export const useCnHoliday = (dateRef: Ref<moment.Moment>) => {
  const currentYearHolidayMap = ref<HolidayMap>({})
  const currentYear = ref<number>(-1)
  const settingsStore = useSettingsStore()

  // 用于缓存节假日数据
  const holidayCnCache = useLocalStorageObject('holiday_cn_cache', {})

  const getHolidayData = async () => {
    try {
      if (!settingsStore.calendarShowLunar) {
        return
      }
      if (currentYear.value < 0) {
        return
      }
      const date = dateRef.value
      currentYear.value = date.year()

      const year = currentYear.value
      let holidayData = holidayCnCache.value[year]
      // 如果没有节假日缓存，则从cdn读取数据（确保最新）
      if (!holidayData) {
        // const res = await fetch(`${import.meta.env.BASE_URL}holiday-cn/${year}.json`)
        // https://github.com/NateScarlet/holiday-cn
        const res = await fetch(
          `https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master/${year}.json`
        )
        holidayData = await res.json()
        // 只缓存有数据的年份
        if (holidayData.days && holidayData.days.length > 0) {
          // 缓存
          holidayCnCache.value = {...holidayCnCache.value, [year]: holidayData}
        }
      }

      const {days} = holidayData

      const map: HolidayMap = {}
      days.forEach((item?: HolidayItem) => {
        if (!item) {
          return
        }
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
    currentYear.value = val.year()
  })

  onMounted(() => {
    currentYear.value = dateRef.value.year()
  })

  return {
    currentYearHolidayMap,
  }
}
