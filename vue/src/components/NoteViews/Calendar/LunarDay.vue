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
    debug: {
      type: Boolean,
      default: false,
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
  <span
    class="lunar-day"
    :class="{'is-term': lunarData.term}"
    :title="debug ? JSON.stringify(lunarData, null, 2) : ''"
  >
    <slot name="lunar" :data="lunarData"
      >{{ lunarData.term ? lunarData.term : lunarData.dayCn }}
    </slot>
  </span>
</template>

<style lang="scss">
.lunar-day {
  &.is-term {
    position: relative;
    &::after {
      content: ' ';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 5px;
      background: rgba($color_theme, 0.2);
    }
  }
}
</style>
