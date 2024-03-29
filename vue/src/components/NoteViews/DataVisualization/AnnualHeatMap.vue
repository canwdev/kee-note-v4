<script lang="ts">
import {defineComponent, PropType} from 'vue'
import * as echarts from 'echarts'
import {CalendarData, useKeeNoteEntryList} from '@/hooks/use-keenote'
import moment from 'moment/moment'
import {EntryItem} from '@/enum/kdbx'
import {generateColorShades} from '@/utils/color'
import {useSettingsStore} from '@/store/settings'

// 把 CalendarData 拍平为数组
function flattenObject(obj: any, result: any[] = []) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      flattenObject(obj[key], result)
    } else {
      result.push(...obj[key])
    }
  }
  return result
}

export default defineComponent({
  name: 'AnnualHeatMap',
  props: {
    calendarData: {type: Object as PropType<CalendarData>},
  },
  setup(props, {emit}) {
    const {calendarData} = toRefs(props)
    const settingsStore = useSettingsStore()

    onMounted(async () => {
      initChart()
    })

    onBeforeUnmount(() => {
      echartsInstance.value?.dispose()
    })

    // 基础配置Echarts
    const echartsElRef = ref()
    const echartsInstance = shallowRef()
    function initChart() {
      let chart = echarts.init(echartsElRef.value)
      // 把配置和数据放这里
      chart.setOption({
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              show: true,
            },
            restore: {},
            // dataView: {},
          },
        },
        visualMap: {
          min: 0,
          max: 5,
          inRange: {
            // color: generateColorShades(settingsStore.themeColor),
            color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196027'],
          },
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          top: 0,
          // show: false,
        },
        tooltip: {
          formatter(params) {
            return params.name + ': ' + params.value[1]
          },
        },

        calendar: [
          // {
          //   range: '2013',
          //   cellSize: ['auto', 15],
          //   left: 70,
          //   right: 30,
          // },
        ],

        series: [
          // {
          //   type: 'heatmap',
          //   coordinateSystem: 'calendar',
          //   calendarIndex: 0,
          //   data: [
          //     ['2018-09-05', 13],
          //     ['2018-09-06', 7],
          //   ]
          // },
        ],
      })

      chart.on('click', 'series', (params) => {
        console.log('[series]', params)
        const {name, value} = params.data as any
        const [date, count] = value || []
        emit('onSeriesClick', {date, count})
      })

      echartsInstance.value = chart
    }

    const updateSeriesData = (infos = []) => {
      if (!echartsInstance.value) {
        return
      }
      // 单独更新 legend 值会导致数据更新异常，所以要获取原始值后重新设置
      const option = echartsInstance.value.getOption()
      // console.log(option)
      option.title = {
        top: 5,
        left: 'left',
        text: 'Heatmap of year2',
      }
      option.calendar = []
      option.series = []
      let height = 0

      const map = calendarData.value
      let index = 0
      for (const year in map) {
        height = 90 + index * 160
        const flatList = flattenObject(map[year])
        // console.log(year, flatList)
        option.calendar.push({
          top: height,
          range: year,
          left: 70,
          right: 30,
          cellSize: 14,
          splitLine: {
            show: false,
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 4,
          },
        })

        let visualMapMax = 0
        type DayCountMapType = {
          [key: string]: {count: number; items: EntryItem[]}
        }
        const dayCountMap: DayCountMapType = {}
        flatList.forEach((item: EntryItem) => {
          const day = moment(item.creationTime).format('YYYY-MM-DD')

          if (!dayCountMap[day]) {
            dayCountMap[day] = {count: 1, items: [item]}
          } else {
            dayCountMap[day].count++
            dayCountMap[day].items.push(item)
          }

          if (dayCountMap[day].count > visualMapMax) {
            visualMapMax = dayCountMap[day].count
          }
        })
        // option.visualMap[0].max = visualMapMax > 5 ? 5 : visualMapMax
        // console.log(dayCountMap)

        const seriesData: any[] = []
        // 提取日期范围
        let startDate = moment(`${year}-01-01`)
        const endDate = moment(`${year}-12-31`)

        // 生成完整的日期序列（填充0）
        while (startDate <= endDate) {
          // 打印当前日期的格式化字符串
          const day = startDate.format('YYYY-MM-DD')
          let count = 0
          if (dayCountMap[day]) {
            count = dayCountMap[day].count
          }

          seriesData.push({
            name: day,
            value: [day, count],
            items: dayCountMap[day]?.items,
          })

          // 增加一天，继续下一天的遍历
          startDate = startDate.add(1, 'day')
        }

        option.series.push({
          type: 'heatmap',
          coordinateSystem: 'calendar',
          calendarIndex: index,
          data: seriesData,
          tooltip: {
            formatter(params) {
              if (!params.data) return
              if (!params.data.items) return params.name
              let html = `<div class="text-overflow"><b>${params.name}</b></div>`
              params.data.items.forEach((item, index) => {
                html += `<div class="text-overflow">[${index + 1}] ${item.title}</div>`
              })
              return `<div class="heat-map-tooltip-titles">${html}</div>`
            },
          },
        })

        index++
      }

      // set option title like 2023 - 2024
      if (option.calendar.length > 1) {
        option.title.text = `${option.calendar[0].range} - ${
          option.calendar[option.calendar.length - 1].range
        }`
      } else if (option.calendar.length > 0) {
        option.title.text = option.calendar[0].range
      } else {
        option.title.text = 'No data'
      }

      // 传入true强制重新渲染
      echartsInstance.value.setOption(option, true)
      echartsInstance.value.resize({height: height + 160})
    }

    onMounted(async () => {
      updateSeriesData()
    })
    watch(calendarData, () => {
      updateSeriesData()
    })

    return {
      echartsElRef,
    }
  },
})
</script>

<template>
  <div ref="echartsElRef" class="annual-heat-map"></div>
</template>

<style lang="scss" scoped>
.annual-heat-map {
  width: 100%;
  max-width: 800px;
}
</style>

<style lang="scss">
.heat-map-tooltip-titles {
  max-width: 300px;
}
</style>
