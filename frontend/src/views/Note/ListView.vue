<script lang="ts" setup>
import {useKeeStore} from '@/store/kee-store'
import {DataTableColumns, NButton, NDataTable, NDropdown} from 'naive-ui'
import {EntryItem} from '@/enum/kdbx'
import {kService} from '@/api'
import {RowData} from 'naive-ui/es/data-table/src/interface'
import keepassIcons from '@/assets/icons'
import {useRoute, useRouter} from 'vue-router'
import {formatDate} from '@/utils'
import {saveDatabaseAsync} from '@/utils/bus'

const router = useRouter()
const route = useRoute()

const keeStore = useKeeStore()
const entryList = ref<EntryItem[]>([])

watch(
  () => route.query.groupUuid,
  (val) => {
    getEntryList()
  }
)

const handleDeleteEntry = async (uuid: string) => {
  await kService.removeEntry({
    uuid: uuid,
  })
  await saveDatabaseAsync()
  await getEntryList()
}

const createColumns = (): DataTableColumns<EntryItem> => {
  return [
    {
      title: 'Icon',
      key: 'icon',
      render(row, index) {
        return h('img', {
          onClick: (e: Event) => e.stopPropagation(),
          alt: String(row.icon),
          src: String(keepassIcons[row.icon]),
          style: {height: '24px', width: '24px'},
        })
      },
    },
    {
      title: 'Title',
      key: 'title',
    },
    {
      title: 'creationTime',
      key: 'creationTime',
      render(row, index) {
        return h('span', {}, formatDate(new Date(row.creationTime)))
      },
    },
    {
      title: 'lastModTime',
      key: 'lastModTime',
      render(row, index) {
        return h('span', {}, formatDate(new Date(row.lastModTime)))
      },
    },
    {
      title: 'Action',
      key: 'actions',
      render(row) {
        return h(
          NDropdown,
          {
            options: [
              {
                label: 'Delete Entry',
                props: {
                  onClick: () => {
                    window.$dialog.warning({
                      title: 'Confirm',
                      content:
                        "Delete selected items? If the item is in the recycle bin, it won't be deleted unless you clean the recycle bin.",
                      positiveText: 'OK',
                      negativeText: 'Cancel',
                      onPositiveClick: () => {
                        handleDeleteEntry(row.uuid)
                      },
                      onNegativeClick: () => {},
                    })
                  },
                },
              },
              {
                label: 'Move to group',
                props: {
                  onClick: () => {
                    window.$message.success('TBD!')
                  },
                },
              },
            ],
          },
          {
            default: () =>
              h(
                NButton,
                {
                  onClick: (e: Event) => {
                    e.stopPropagation()
                  },
                },
                {default: () => 'Options'}
              ),
          }
        )
      },
    },
  ]
}

const getEntryList = async () => {
  if (!route.query.groupUuid) {
    entryList.value = []
    return
  }
  const list = await kService.getGroupEntries({
    groupUuid: route.query.groupUuid,
  })

  entryList.value = list
}

onMounted(() => {
  getEntryList()
})

// onActivated(() => {
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
})

const columns = createColumns()
const rowProps = (row: RowData) => {
  return {
    style: 'cursor: pointer;',
    onClick: () => {
      // console.log(row)
      router.push({
        name: 'NoteDetailView',
        query: {uuid: row.uuid},
      })
    },
  }
}
</script>

<template>
  <div class="note-list-view content-padding">
    <n-data-table
      class="note-list-table"
      :columns="columns"
      :rowProps="rowProps"
      :data="entryList"
      :pagination="paginationReactive"
      :bordered="true"
    />
  </div>
</template>

<style lang="scss" scoped>
.note-list-view {
  overflow: auto;
  .note-list-table {
    min-width: 700px;
  }
}
</style>
