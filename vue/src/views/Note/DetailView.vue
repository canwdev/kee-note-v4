<script lang="ts">
import {useRoute, useRouter} from 'vue-router'
import {kService} from '@/api'
import {EntryItem} from '@/enum/kdbx'
import keepassIcons from '@/assets/icons'
import {saveDatabaseAsync} from '@/utils/bus'
import {useUnSavedChanges} from '@/hooks/use-changed'
import {useLocalStorageBoolean} from '@/hooks/use-local-storage'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import {LsKeys} from '@/enum'
import DialogEntryIconColor from '@/components/DialogEntryIconColor.vue'
import IconDisplay from '@/components/IconDisplay.vue'
import DialogEntryPreview from '@/components/DialogEntryPreview.vue'
import {
  TextBoxSettings24Regular,
  ArrowLeft16Regular,
  Save20Regular,
  CalendarAdd20Regular,
  CalendarEdit16Regular,
} from '@vicons/fluent'
import AttachmentBox from '@/components/NoteViews/AttachmentBox.vue'

export default defineComponent({
  name: 'DetailView',
  components: {
    MarkdownEditor,
    DialogEntryIconColor,
    IconDisplay,
    DialogEntryPreview,
    TextBoxSettings24Regular,
    ArrowLeft16Regular,
    Save20Regular,
    CalendarAdd20Regular,
    CalendarEdit16Regular,
    AttachmentBox,
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const entryDetail = ref<EntryItem | null>(null)
    const times = reactive([0, 0])
    const isComplexEditor = useLocalStorageBoolean(LsKeys.LS_KEY_NO_COMPLEX_EDITOR, true)

    onMounted(() => {
      getEntryDetail(true)
      window.addEventListener('keydown', handleKeyDown)
    })
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', handleKeyDown)
    })

    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        const key = String.fromCharCode(event.which).toLowerCase()
        switch (key) {
          case 's':
            event.preventDefault()
            handleSave()
            break
          case '¿': // Keyboard symbol: "/"
            isShowPreviewModal.value = true
            event.preventDefault()
            break
          default:
            return
        }
      } else if (event.code === 'Escape') {
        if (isShowPreviewModal.value || isShowIconEdit.value) {
          return
        }
        handleBack()
      }
    }

    const getEntryDetail = async (isFocus = false) => {
      entryDetail.value = await kService.getEntryDetail({uuid: route.query.uuid})
      nextTick(() => {
        isChanged.value = false
        if (isFocus) {
          titleInputRef.value.focus()
        }
      })
    }

    const {isChanged} = useUnSavedChanges()

    watch(entryDetail, (val) => {
      if (!val) {
        return
      }
      const {creationTime, lastModTime} = val
      times[0] = new Date(creationTime).getTime()
      times[1] = new Date(lastModTime).getTime()
    })

    watch(
      entryDetail,
      () => {
        isChanged.value = true
      },
      {deep: true}
    )

    const handleSave = async () => {
      if (!entryDetail.value) {
        return
      }

      // generate update params
      const fieldsUpdates = []
      for (const key in entryDetail.value.fieldsV2) {
        fieldsUpdates.push({path: `fields.${key}`, value: entryDetail.value.fieldsV2[key]})
      }

      await kService.updateEntry({
        uuid: entryDetail.value.uuid,
        updates: [
          ...fieldsUpdates,
          {path: 'fgColor', value: entryDetail.value.fgColor},
          {path: 'bgColor', value: entryDetail.value.bgColor},
          {path: 'icon', value: entryDetail.value.icon},
          {path: 'times.creationTime', value: times[0]},
        ],
      })
      await syncAndSave()
    }

    const syncAndSave = async () => {
      await getEntryDetail()
      await saveDatabaseAsync()
    }

    const complexEditorRef = ref()
    const isShowIconEdit = ref(false)
    const isShowPreviewModal = ref(false)

    const menuOptions = computed(() => {
      return [
        {
          label: '🔰 Preview (Ctrl+/)',
          props: {
            onClick: async () => {
              isShowPreviewModal.value = true
            },
          },
        },
        !isComplexEditor.value && {
          label: '💫 Enable HyperMD Editor',
          props: {
            onClick: async () => {
              isComplexEditor.value = true
            },
          },
        },
      ].filter(Boolean)
    })

    const titleInputRef = ref()

    const handleBack = () => {
      if (isChanged.value) {
        window.$dialog.warning({
          title: 'Confirm',
          content: 'Discard Changes?',
          positiveText: 'OK',
          negativeText: 'Cancel',
          onPositiveClick: () => {
            router.back()
          },
          onNegativeClick: () => {},
        })
        return
      }
      router.back()
    }

    const isShowMore = useLocalStorageBoolean(LsKeys.LS_KEY_DETAIL_SHOW_MORE, false)

    return {
      entryDetail,
      handleBack,
      times,
      isChanged,
      handleSave,
      keepassIcons,
      isComplexEditor,
      complexEditorRef,
      showEditorSettings() {
        complexEditorRef.value.showSettings()
      },
      isShowIconEdit,
      menuOptions,
      isShowPreviewModal,
      titleInputRef,
      isShowMore,
      syncAndSave,
    }
  },
})
</script>

<template>
  <div class="detail-view">
    <n-layout class="layout-inner-root">
      <n-layout-header bordered>
        <n-space align="center" justify="space-between" class="header-space">
          <n-button quaternary @click="handleBack">
            <n-icon size="18"> <ArrowLeft16Regular /> </n-icon>&nbsp;Back</n-button
          >

          <div class="entry-title" v-if="entryDetail">
            <n-dropdown
              :options="menuOptions"
              key-field="label"
              placement="bottom-start"
              trigger="hover"
            >
              <n-button size="small" quaternary @click="isShowIconEdit = true">
                <IconDisplay
                  :icon="entryDetail.icon"
                  :bg-color="entryDetail.bgColor"
                  :fg-color="entryDetail.fgColor"
                />
                <span v-if="isChanged">* </span>
              </n-button>
            </n-dropdown>
          </div>

          <n-button quaternary :disabled="!isChanged" @click="handleSave">
            <n-icon size="18"> <Save20Regular /> </n-icon>&nbsp;Save</n-button
          >
        </n-space>
      </n-layout-header>

      <div v-if="entryDetail" class="detail-card-wrap">
        <div class="detail-card">
          <n-space vertical>
            <n-space justify="space-between">
              <n-space align="center">
                <n-date-picker
                  size="small"
                  v-model:value="times[0]"
                  type="datetime"
                  @update:value="isChanged = true"
                  title="Create Time"
                >
                  <template #date-icon>
                    <n-icon size="18"> <CalendarAdd20Regular /> </n-icon>
                  </template>
                </n-date-picker>
                <n-date-picker
                  size="small"
                  v-model:value="times[1]"
                  type="datetime"
                  disabled
                  title="Update Time"
                >
                  <template #date-icon>
                    <n-icon size="18"> <CalendarEdit16Regular /> </n-icon>
                  </template>
                </n-date-picker>
              </n-space>

              <n-space align="center">
                <n-switch size="small" v-model:value="isShowMore" title="Toggle more details" />

                <n-button
                  size="small"
                  quaternary
                  v-if="isComplexEditor"
                  @click="showEditorSettings"
                  title="Editor Settings"
                >
                  <n-icon size="18">
                    <TextBoxSettings24Regular />
                  </n-icon>
                </n-button>
              </n-space>
            </n-space>

            <n-input-group>
              <n-input
                size="small"
                ref="titleInputRef"
                autofocus
                v-model:value="entryDetail.fieldsV2.Title"
                type="text"
                placeholder="Title"
              >
              </n-input>
            </n-input-group>

            <n-collapse-transition :show="entryDetail && isShowMore">
              <div class="extra-info">
                <div class="extra-item">
                  <label>Username</label>
                  <n-input
                    size="small"
                    v-model:value="entryDetail.fieldsV2.UserName"
                    placeholder=""
                  />
                </div>
                <div class="extra-item">
                  <label>Password</label>
                  <n-input
                    size="small"
                    v-model:value="entryDetail.fieldsV2.Password"
                    type="password"
                    show-password-on="click"
                    class="font-code"
                  />
                </div>
                <div class="extra-item">
                  <label>URL</label>
                  <n-input size="small" v-model:value="entryDetail.fieldsV2.URL" placeholder="" />
                </div>
              </div>

              <AttachmentBox :entry-detail="entryDetail" @dataUpdated="syncAndSave" />
            </n-collapse-transition>
            <MarkdownEditor
              ref="complexEditorRef"
              v-if="isComplexEditor"
              v-model="entryDetail.fieldsV2.Notes"
              @turnOff="isComplexEditor = false"
            />
            <n-input
              v-else
              v-model:value="entryDetail.fieldsV2.Notes"
              type="textarea"
              placeholder="Input your Note here."
              :autosize="{
                minRows: 20,
              }"
              style="background-color: inherit !important"
            />
          </n-space>
        </div>
      </div>

      <DialogEntryIconColor v-model:visible="isShowIconEdit" :entry-detail="entryDetail" />

      <DialogEntryPreview v-model:visible="isShowPreviewModal" :preview-detail="entryDetail" />
    </n-layout>
  </div>
</template>

<style lang="scss" scoped>
.detail-view {
  height: 100%;
  $min_width: 800px;

  .header-space {
    width: 100%;
    height: 100%;
    padding: 6px 24px;
    box-sizing: border-box;
    @media screen and (max-width: $min_width) {
      padding: 2px;
    }
  }

  .entry-title {
    max-width: 50vw;
    font-weight: 500;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .layout-inner-root {
    height: 100%;
    :deep(.n-layout-scroll-container) {
      display: flex;
      flex-direction: column;
    }

    .detail-card-wrap {
      flex: 1;
      overflow: auto;
      padding-top: 10px;
      padding-bottom: 5px;
    }

    .detail-card {
      margin-left: auto;
      margin-right: auto;
      width: $min_width;

      @media screen and (max-width: $min_width) {
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box;
      }

      @media screen and (max-width: 1200px) {
        margin-top: 10px;
      }
    }
  }

  .extra-info {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto;
    gap: 10px;
    margin-bottom: 10px;
    @media screen and (max-width: $min_width) {
      grid-template-columns: repeat(1, 1fr);
    }
    .extra-item {
      display: flex;
      align-items: center;
      label {
        margin-right: 5px;
        min-width: 70px;
        text-align: right;
      }
    }
  }
}
</style>
