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
    bgColor: {
      type: String,
      default: null,
    },
    fgColor: {
      type: String,
      default: null,
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
  <div
    class="icon-display"
    :style="{height: size + 'px', width: size + 'px', backgroundColor: bgColor}"
    :title="icon"
  >
    <span v-if="fgColor" class="color-fg" :style="[{background: fgColor}]"></span>
    <img :src="iconSrc" :class="{'is-pixel': isPixel}" :alt="icon" />
  </div>
</template>

<style lang="scss" scoped>
.icon-display {
  display: inline-block;
  position: relative;
  border-radius: 4px;
  vertical-align: bottom;

  .color-fg {
    position: absolute;
    top: -3px;
    right: -3px;
    display: block;
    border-radius: 50%;
    width: 8px;
    height: 8px;
    //border: 1px solid rgba(0, 0, 0, 0.3);
  }

  img {
    width: 100%;
    height: 100%;
    .is-pixel {
      image-rendering: pixelated;
    }
  }
}
</style>
