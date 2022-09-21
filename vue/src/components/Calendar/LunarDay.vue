<script lang="ts">
import {defineComponent} from 'vue'
import solarLunar from 'solarlunar'

export default defineComponent({
  name: 'LunarDay',
  props: {
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    day: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const {year, month, day} = toRefs(props)
    const lunarData = computed(() => {
      return solarLunar.solar2lunar(year.value, month.value, day.value)
    })
    return {
      lunarData,
    }
  },
})
</script>

<template>
  <span :title="JSON.stringify(lunarData, null, 2)">
    {{ lunarData.dayCn }}
  </span>
</template>
