<script lang="ts">
import {useKeeStore} from '@/store/kee-store'
import {
  DataTableColumns,
  DropdownOption,
  NButton,
  NDataTable,
  NDropdown,
  TreeOption,
} from 'naive-ui'
import {EntryItem} from '@/enum/kdbx'
import {useRouter} from 'vue-router'
import {formatDate} from '@/utils'
import DialogGroupSelect from '@/components/DialogGroupSelect.vue'
import {useKeepassEntryList} from '@/hooks/use-keepass'
import IconDisplay from '@/components/IconDisplay.vue'
import {useCommonActions} from '@/components/NoteViews/use-common-actions'

export default defineComponent({
  components: {
    DialogGroupSelect,
  },
  setup() {
    const router = useRouter()
    const {entryList, getEntryList, keeStore, groupUuid} = useKeepassEntryList()

    const {
      editingNode,
      nodeAction,
      handleContextmenu,
      showGroupSelectModal,
      handleSelectGroup,
      getMenuOptions,
      ...contextMenuEtc
    } = useCommonActions(getEntryList)

    const createColumns = (): DataTableColumns<EntryItem> => {
      return [
        {
          title: '🌟',
          key: 'icon',
          width: 80,
          render(row, index) {
            return h(IconDisplay, {
              onClick: (e: Event) => e.stopPropagation(),
              icon: row.icon,
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
        },
        {
          title: 'Create Time',
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
          title: 'Update Time',
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
              },
              {
                default: () =>
                  h(
                    NButton,
                    {
                      onClick: (e: Event) => {
                        e.stopPropagation()
                      },
                      size: 'small',
                    },
                    {default: () => '⚙️'}
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
        onClick: () => {
          // console.log(row)
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

    return {
      entryList,
      columns,
      rowProps,
      paginationReactive,
      groupUuid,
      editingNode,
      nodeAction,
      handleContextmenu,
      ...contextMenuEtc,
      showGroupSelectModal,
      handleSelectGroup,
    }
  },
})
</script>

<template>
  <div class="note-list-view">
    <n-scrollbar trigger="none" x-scrollable>
      <div class="content-padding">
        <n-data-table
          class="note-list-table"
          :columns="columns"
          :rowProps="rowProps"
          :data="entryList"
          :pagination="paginationReactive"
          :bordered="true"
          max-height="72vh"
        />
      </div>
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
      v-model:visible="showGroupSelectModal"
      :value="groupUuid"
      @onSubmit="handleSelectGroup"
    />
  </div>
</template>

<style lang="scss" scoped>
.note-list-view {
  height: 100%;
  .note-list-table {
    min-width: 700px;
  }
}
</style>
