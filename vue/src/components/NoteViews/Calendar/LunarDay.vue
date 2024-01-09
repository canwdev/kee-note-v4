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
  <span class="lunar-day" :class="{'is-term': lunarData.term}">
    <n-popover trigger="click">
      <template #trigger>
        <slot name="lunar" :data="lunarData">
          <span class="cursor-pointer">{{
            lunarData.term ? lunarData.term : lunarData.dayCn
          }}</span>
        </slot>
      </template>
      <textarea
        style="border: none; outline: none; resize: none"
        class="font-code"
        readonly
        :value="JSON.stringify(lunarData, null, 2)"
        rows="14"
        cols="24"
      ></textarea>
    </n-popover>
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
      background: rgba($primary, 0.2);
    }
  }
}
</style>
