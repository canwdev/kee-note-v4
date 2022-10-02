<script lang="ts">
import {defineComponent} from 'vue'
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import IconDisplay from '@/components/IconDisplay.vue'
import keepassIcons from '@/assets/icons'

export default defineComponent({
  name: 'DialogIconChooser',
  components: {
    IconDisplay,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: Number,
      default: null,
    },
  },
  setup(props, {emit}) {
    const mVisible = useModelWrapper(props, emit, 'visible')

    return {
      mVisible,
      keepassIcons,
      onSelectIcon(index) {
        emit('onSelectIcon', index)
      },
    }
  },
})
</script>

<template>
  <n-modal class="global-settings" v-model:show="mVisible" preset="dialog" title="Choose Icon">
    <n-grid :x-gap="4" :y-gap="4" :cols="5">
      <n-grid-item v-for="(item, index) in keepassIcons" :key="index" style="text-align: center">
        <n-button @click="onSelectIcon(index)">
          <IconDisplay :icon="Number(index)" />
        </n-button>
      </n-grid-item>
    </n-grid>
  </n-modal>
</template>
