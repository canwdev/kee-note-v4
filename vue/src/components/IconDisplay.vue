<script lang="ts">
import {defineComponent} from 'vue'
import keepassIcons from '@/assets/icons'

export default defineComponent({
  name: 'IconDisplay',
  props: {
    icon: {
      type: Number,
      default: 0,
    },
    size: {
      type: Number,
      default: 24,
    },
    isPixel: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const {icon} = toRefs(props)
    const iconSrc = computed(() => {
      return String(keepassIcons[icon.value])
    })
    return {
      iconSrc,
    }
  },
})
</script>

<template>
  <img
    class="icon-display"
    :src="iconSrc"
    :class="{'is-pixel': isPixel}"
    :style="{height: size + 'px', width: size + 'px'}"
    :alt="icon"
  />
</template>

<style lang="scss" scoped>
.icon-display {
  .is-pixel {
    image-rendering: pixelated;
  }
}
</style>
