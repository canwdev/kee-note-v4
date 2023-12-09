<script lang="ts">
import {defineComponent, PropType} from 'vue'
import RectSwitch from './Tools/RectSwitch.vue'
import {StOptionItem, StOptionType} from './enum'
import VueRender from './Tools/VueRender.vue'

export default defineComponent({
  name: 'ItemAction',
  components: {VueRender, RectSwitch},
  props: {
    item: {
      type: Object as PropType<StOptionItem>,
      required: true,
    },
  },
  setup(props, {emit}) {
    const {item} = toRefs(props)
    const dynamicValue = computed({
      get() {
        if (item.value.store) {
          return item.value.store[item.value.key]
        }
        return item.value.value
      },
      set(val) {
        if (item.value.store) {
          item.value.store[item.value.key] = val
          return
        }
        item.value.value = val
      },
    })
    return {
      StOptionType,
      dynamicValue,
    }
  },
})
</script>

<template>
  <n-space size="small" align="center">
    <n-switch v-if="item.type === StOptionType.SWITCH" v-model:value="dynamicValue" />

    <RectSwitch
      v-else-if="item.type === StOptionType.MULTIPLE_SWITCH"
      :options="item.selectOptions"
      v-model="dynamicValue"
    />

    <div class="option-slider-wrap" v-else-if="item.type === StOptionType.SLIDER">
      <n-slider class="option-slider" v-model:value="dynamicValue" />
    </div>

    <n-select
      class="option-select"
      v-else-if="item.type === StOptionType.SELECT"
      v-model:value="dynamicValue"
      :options="item.selectOptions"
      value-field="value"
      label-field="label"
      size="small"
    />

    <n-input
      class="option-input"
      v-else-if="item.type === StOptionType.INPUT"
      v-model:value="dynamicValue"
      size="small"
      type="text"
    />
    <VueRender v-if="item.actionRender" :render-fn="item.actionRender" />
  </n-space>
</template>

<style lang="scss">
.option-slider-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  .option-slider {
    width: 180px;
  }
  .number-input-wrap {
    width: 74px;
  }
}
.option-select {
  width: 180px;
  height: 24px;
}
</style>
