<script lang="ts">
import {DataTableColumns, DataTableRowKey, NButton, NIcon, NDataTable, NDropdown} from 'naive-ui'
import {EntryItem} from '@/enum/kdbx'
import {useRouter} from 'vue-router'
import {formatDate} from '@/utils'
import DialogGroupSelect from '@/components/DialogGroupSelect.vue'
import {useKeepassEntryList} from '@/hooks/use-keepass'
import IconDisplay from '@/components/IconDisplay.vue'
import {useCommonActions} from '@/components/NoteViews/use-common-actions'
import DialogEntryPreview from '@/components/DialogEntryPreview.vue'
import {MoreHorizontal20Filled} from '@vicons/fluent'

export default defineComponent({
  components: {
    DialogGroupSelect,
    DialogEntryPreview,
  },
  setup() {
    const router = useRouter()
    const checkedRowKeys = ref<DataTableRowKey[]>([])
    const {entryList, getEntryList, keeStore, groupUuid} = useKeepassEntryList({
      cleanupFn: () => {
        checkedRowKeys.value = []
      },
    })

    const {
      editingNode,
      nodeAction,
      handleContextmenu,
      isShowGroupSelectModal,
      isShowPreviewModal,
      handleSelectGroup,
      getMenuOptions,
      ...contextMenuEtc
    } = useCommonActions({getEntryList, checkedRowKeys})

    const createColumns = (): DataTableColumns<EntryItem> => {
      return [
        {
          type: 'selection',
        },
        {
          title: '★', // 🌟
          key: 'icon',
          width: 80,
          render(row, index) {
            return h(IconDisplay, {
              onClick: (e: Event) => {
                e.stopPropagation()
                nodeAction(row, () => {
                  isShowPreviewModal.value = true
                })
              },
              icon: row.icon,
              bgColor: row.bgColor,
              fgColor: row.fgColor,
              size: 24,
            })
          },
          sorter: {
            compare: (a: any, b: any) => a.icon - b.icon,
            multiple: 4,
          },
        },
        {
          title: 'Title',
          key: 'title',
          sorter: {
            compare: (a: any, b: any) => {
              return a.title.localeCompare(b.title)
            },
            multiple: 3,
          },
          ellipsis: {
            tooltip: true,
          },
        },
        {
          title: 'Created',
          key: 'creationTime',
          render(row, index) {
            return h('span', {}, formatDate(new Date(row.creationTime)))
          },
          sorter: {
            compare: (a: any, b: any) => a.creationTime - b.creationTime,
            multiple: 1,
          },
        },
        {
          title: 'Updated',
          key: 'lastModTime',
          render(row, index) {
            return h('span', {}, formatDate(new Date(row.lastModTime)))
          },
          sorter: {
            compare: (a: any, b: any) => a.lastModTime - b.lastModTime,
            multiple: 2,
          },
        },
        {
          title: 'Action',
          key: 'actions',
          render(row) {
            return h(
              NDropdown,
              {
                options: getMenuOptions(row),
                showArrow: true,
                keyField: 'label',
              },
              {
                default: () =>
                  h(
                    NButton,
                    {
                      onClick: (e: Event) => {
                        e.stopPropagation()
                      },
                      quaternary: true,
                      size: 'small',
                    },
                    {default: () => h(NIcon, {size: 20}, () => h(MoreHorizontal20Filled))}
                  ),
              }
            )
          },
          // fixed: 'right',
          width: 100,
        },
      ]
    }

    onMounted(() => {
      if (keeStore.isDbOpened) {
        getEntryList()
      }
    })

    const paginationReactive = reactive({
      page: 1,
      pageSize: 10,
      showSizePicker: true,
      pageSizes: [5, 10, 20, 50, 100, 200],
      onChange: (page: number) => {
        paginationReactive.page = page
      },
      onUpdatePageSize: (pageSize: number) => {
        paginationReactive.pageSize = pageSize
        paginationReactive.page = 1
      },
      prefix: () => h('span', 'Total: ' + entryList.value.length),
    })

    const columns = createColumns()
    const rowProps = (row: EntryItem) => {
      return {
        style: 'cursor: pointer;',
        onClick: (e, a) => {
          if (e.target.closest('.n-checkbox-box-wrapper')) {
            return
          }
          router.push({
            name: 'NoteDetailView',
            query: {uuid: row.uuid},
          })
        },
        onContextmenu: (e: MouseEvent) => {
          handleContextmenu(e, row)
        },
      }
    }

    const tableRef = ref()

    return {
      tableRef,
      entryList,
      columns,
      rowProps,
      paginationReactive,
      groupUuid,
      editingNode,
      nodeAction,
      handleContextmenu,
      ...contextMenuEtc,
      isShowGroupSelectModal,
      isShowPreviewModal,
      handleSelectGroup,
      checkedRowKeys,
      handleCheck(rowKeys: DataTableRowKey[]) {
        console.log(tableRef)
        checkedRowKeys.value = rowKeys
      },
      getMenuOptions,
    }
  },
})
</script>

<template>
  <div class="note-list-view">
    <n-scrollbar trigger="none" x-scrollable>
      <div class="content-padding">
        <n-data-table
          size="small"
          ref="tableRef"
          class="note-list-table"
          :columns="columns"
          :rowProps="rowProps"
          :data="entryList"
          :pagination="paginationReactive"
          :bordered="false"
          max-height="72vh"
          :row-key="(row) => row.uuid"
          :checked-row-keys="checkedRowKeys"
          @update:checked-row-keys="handleCheck"
        />
      </div>
      <n-collapse-transition :show="Boolean(checkedRowKeys.length)">
        <n-dropdown :options="getMenuOptions(null)" key-field="label">
          <n-button
            secondary
            type="tertiary"
            size="small"
            style="position: absolute; top: 0; left: 50px; z-index: 10"
          >
            You selected {{ checkedRowKeys.length }} items
          </n-button>
        </n-dropdown>
      </n-collapse-transition>
    </n-scrollbar>
    <n-dropdown
      trigger="manual"
      placement="bottom-start"
      :show="showRightMenu"
      :options="rightMenuOptions"
      :x="xRef"
      :y="yRef"
      @select="handleSelect"
      key-field="label"
      :on-clickoutside="handleClickOutside"
    />

    <DialogGroupSelect
      v-model:visible="isShowGroupSelectModal"
      :value="groupUuid"
      @onSubmit="handleSelectGroup"
    />

    <DialogEntryPreview
      v-model:visible="isShowPreviewModal"
      :uuid="editingNode && editingNode.uuid"
    />
  </div>
</template>

<style lang="scss" scoped>
.note-list-view {
  position: relative;
  height: 100%;
  user-select: none;
  .note-list-table {
    min-width: 700px;
  }
}
</style>
