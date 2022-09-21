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
import {EntryItem, GroupItem} from '@/enum/kdbx'
import {kService} from '@/api'
import keepassIcons from '@/assets/icons'
import {useRoute, useRouter} from 'vue-router'
import {formatDate} from '@/utils'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import DialogGroupSelect from '@/components/DialogGroupSelect.vue'
import {useContextMenu} from '@/hooks/use-context-menu'
import {useKeepassEntryList} from '@/hooks/use-keepass'

export default defineComponent({
  components: {
    DialogGroupSelect,
  },
  setup() {
    const router = useRouter()
    const {entryList, getEntryList, keeStore, groupUuid} = useKeepassEntryList()

    const handleDeleteEntry = async (uuid: string) => {
      await kService.removeEntry({
        uuid: uuid,
      })
      await saveDatabaseAsync()
      await getEntryList()
      globalEventBus.emit(GlobalEvents.REFRESH_GROUP_TREE)
    }

    const createColumns = (): DataTableColumns<EntryItem> => {
      return [
        {
          title: '🌟',
          key: 'icon',
          width: 80,
          render(row, index) {
            return h('img', {
              onClick: (e: Event) => e.stopPropagation(),
              alt: String(row.icon),
              src: String(keepassIcons[row.icon]),
              style: {height: '24px', width: '24px'},
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

    // onMounted(() => {
    //   if (keeStore.isDbOpened) {
    //     getEntryList()
    //   }
    // })

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

    const getMenuOptions = (option) => [
      {
        label: '📁 Move to group',
        props: {
          onClick: () => {
            nodeAction(option, () => {
              showGroupSelectModal.value = true
            })
          },
        },
      },
      {
        label: '🚮 Delete Entry',
        props: {
          onClick: () => {
            window.$dialog.warning({
              title: 'Confirm',
              content:
                "Delete selected items? If the item is in the recycle bin, it won't be deleted unless you clean the recycle bin.",
              positiveText: 'OK',
              negativeText: 'Cancel',
              onPositiveClick: () => {
                handleDeleteEntry(option.uuid)
              },
              onNegativeClick: () => {},
            })
          },
        },
      },
    ]

    const {editingNode, nodeAction, handleContextmenu, ...contextMenuEtc} =
      useContextMenu(getMenuOptions)

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

    const showGroupSelectModal = ref(false)
    const handleSelectGroup = async (groupUuid: string) => {
      // console.log(groupUuid)
      if (!editingNode.value) {
        return
      }
      await kService.moveEntry({
        groupUuid: groupUuid,
        uuid: editingNode.value.uuid,
      })

      await saveDatabaseAsync()
      await getEntryList()
      editingNode.value = null
    }

    return {
      entryList,
      columns,
      rowProps,
      paginationReactive,
      showGroupSelectModal,
      handleSelectGroup,
      ...contextMenuEtc,
      groupUuid,
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
