<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {EntryItem} from '@/enum/kdbx'
import IconDisplay from '@/components/IconDisplay.vue'
import {formatDate} from '@/utils'
import {useMainStore} from '@/store/main-store'
import {Palette} from '@/enum'
import keepassIcons from '@/assets/icons'

export default defineComponent({
  name: 'DialogIconEdit',
  components: {
    IconDisplay,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    entryDetail: {
      type: Object as PropType<EntryItem>,
      default: null,
    },
  },
  setup(props, {emit}) {
    const {entryDetail} = toRefs(props)
    const mainStore = useMainStore()
    const mVisible = useModelWrapper(props, emit, 'visible')

    const isShowIconChooser = ref(false)

    return {
      mainStore,
      mVisible,
      formatDate,
      swatches: Palette.map((i) => i.color),
      isShowIconChooser,
      keepassIcons,
      handleIconClick(index) {
        entryDetail.value.icon = index
        isShowIconChooser.value = false
      },
    }
  },
})
</script>

<template>
  <n-modal
    class="global-settings"
    v-model:show="mVisible"
    preset="dialog"
    title="Edit Icon & Color"
  >
    <n-list>
      <n-list-item>
        <n-thing title="Icon" />
        <template #suffix>
          <n-button @click="isShowIconChooser = true">
            <IconDisplay
              :icon="entryDetail.icon"
              :bg-color="entryDetail.bgColor"
              :fg-color="entryDetail.fgColor"
            />
          </n-button>
        </template>
      </n-list-item>
      <n-list-item>
        <n-thing title="Background Color" />
        <template #suffix>
          <n-color-picker
            v-model:value="entryDetail.bgColor"
            style="width: 200px"
            :swatches="swatches"
          />
        </template>
      </n-list-item>
      <n-list-item>
        <n-thing title="Foreground Color" />
        <template #suffix>
          <n-color-picker
            v-model:value="entryDetail.fgColor"
            style="width: 200px"
            :swatches="swatches"
          />
        </template>
      </n-list-item>
    </n-list>

    <n-modal
      class="global-settings"
      v-model:show="isShowIconChooser"
      preset="dialog"
      title="Choose Icon"
    >
      <n-grid :x-gap="4" :y-gap="4" :cols="5">
        <n-grid-item v-for="(item, index) in keepassIcons" :key="index" style="text-align: center">
          <n-button @click="handleIconClick(index)">
            <IconDisplay :icon="Number(index)" />
          </n-button>
        </n-grid-item>
      </n-grid>
    </n-modal>
  </n-modal>
</template>
