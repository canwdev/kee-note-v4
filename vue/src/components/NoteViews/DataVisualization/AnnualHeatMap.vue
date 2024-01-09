<script lang="ts">
import {defineComponent} from 'vue'
import * as echarts from 'echarts'
import {useKeepassEntryList} from '@/hooks/use-keepass'
import moment from 'moment/moment'

// 把 CalendarData 拍平为数组
function flattenObject(obj: any, result = []) {
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
  setup() {
    const isLoading = ref(false)

    onMounted(async () => {
      initChart()
    })
    // 基础配置Echarts
    const echartsElRef = ref()
    const echartsInstance = shallowRef()
    function initChart() {
      let chart = echarts.init(echartsElRef.value)
      // 把配置和数据放这里
      chart.setOption({
        title: {
          top: 5,
          left: 'left', //'center',
          text: '',
        },
        tooltip: {
          position: 'top',
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {
              show: true,
            },
          },
        },
        visualMap: {
          min: 0,
          max: 5,
          inRange: {
            color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196027'],
          },
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          top: 'top',
        },
        tooltip: {
          position: 'top',
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
      echartsInstance.value = chart
    }

    const updateSeriesData = (infos = []) => {
      if (!echartsInstance.value) {
        return
      }
      // 单独更新 legend 值会导致数据更新异常，所以要获取原始值后重新设置
      const option = echartsInstance.value.getOption()
      // console.log(option)
      option.calendar = []
      option.series = []

      const map = calendarData.value
      let index = 0
      for (const year in map) {
        const flatList = flattenObject(map[year])
        // console.log(year, flatList)
        option.calendar.push({
          top: 90 + index * 160,
          range: year,
          cellSize: ['auto', 15],
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
        const dayCountMap = {}
        flatList.forEach((item) => {
          const day = moment(item.creationTime).format('YYYY-MM-DD')

          if (!dayCountMap[day]) {
            dayCountMap[day] = 1
          } else {
            dayCountMap[day]++
          }

          if (dayCountMap[day] > visualMapMax) {
            visualMapMax = dayCountMap[day]
          }
        })
        option.visualMap[0].max = visualMapMax
        // console.log(dayCountMap)

        const seriesData = []
        // 提取日期范围
        let startDate = moment(`${year}-01-01`)
        const endDate = moment(`${year}-12-31`)

        // 生成完整的日期序列（填充0）
        while (startDate <= endDate) {
          // 打印当前日期的格式化字符串
          const day = startDate.format('YYYY-MM-DD')
          let count = 0
          if (dayCountMap[day]) {
            count = dayCountMap[day]
          }

          seriesData.push({
            name: day,
            value: [day, count],
          })

          // 增加一天，继续下一天的遍历
          startDate = startDate.add(1, 'day')
        }

        option.series.push({
          type: 'heatmap',
          coordinateSystem: 'calendar',
          calendarIndex: index,
          data: seriesData,
        })
        index++
      }

      // 传入true强制重新渲染
      echartsInstance.value.setOption(option, true)
    }

    const {calendarData, getEntryList} = useKeepassEntryList({
      isCalendar: true,
    })

    onMounted(async () => {
      await getEntryList()
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
  height: 1200px;
}
</style>