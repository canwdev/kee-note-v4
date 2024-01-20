<script lang="ts">
import {defineComponent, PropType} from 'vue'
import {useModelWrapper} from '@/hooks/use-model-wrapper'
import {EntryItem} from '@/enum/kdbx'
import IconDisplay from '@/components/NoteViews/IconDisplay.vue'
import {Palette} from '@/enum'
import DialogIconChooser from '@/components/NoteViews/Dialogs/DialogIconChooser.vue'
import {Icons20Regular} from '@vicons/fluent'

export default defineComponent({
  name: 'DialogEntryIconColor',
  components: {
    IconDisplay,
    DialogIconChooser,
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
    const mVisible = useModelWrapper(props, emit, 'visible')

    const isShowIconChooser = ref(false)

    return {
      mVisible,
      swatches: Palette.map((i) => i.color),
      isShowIconChooser,
      handleSelectIcon(index) {
        entryDetail.value.icon = index
        isShowIconChooser.value = false
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
    v-model:show="mVisible"
    preset="dialog"
    :icon="dialogIconRender"
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
            style="width: 150px; border-radius: 0"
            :swatches="swatches"
            :show-alpha="false"
            :actions="['clear']"
            :modes="['hex']"
          />
        </template>
      </n-list-item>
      <n-list-item>
        <n-thing title="Foreground Color" />
        <template #suffix>
          <n-color-picker
            v-model:value="entryDetail.fgColor"
            style="width: 150px; border-radius: 0"
            :swatches="swatches"
            :show-alpha="false"
            :actions="['clear']"
            :modes="['hex']"
          />
        </template>
      </n-list-item>
    </n-list>

    <DialogIconChooser v-model:visible="isShowIconChooser" @onSelectIcon="handleSelectIcon" />
  </n-modal>
</template>
