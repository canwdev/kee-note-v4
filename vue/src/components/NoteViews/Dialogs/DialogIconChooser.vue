<script lang="ts">
import {defineComponent} from 'vue'
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import IconDisplay from '@/components/NoteViews/IconDisplay.vue'
import keepassIcons from '@/assets/icons'
import {Icons20Regular} from '@vicons/fluent'

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
      dialogIconRender() {
        return h(Icons20Regular)
      },
    }
  },
})
</script>

<template>
  <n-modal
    class="global-settings"
    :icon="dialogIconRender"
    v-model:show="mVisible"
    preset="dialog"
    title="Choose Icon"
  >
    <n-grid :y-gap="5" :cols="5">
      <n-grid-item v-for="(item, index) in keepassIcons" :key="index" style="text-align: center">
        <n-button size="large" quaternary @click="onSelectIcon(index)">
          <IconDisplay size="32" :icon="Number(index)" />
        </n-button>
      </n-grid-item>
    </n-grid>
  </n-modal>
</template>
