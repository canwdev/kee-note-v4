<script lang="ts" setup>
import {useKeeStore} from '@/store/kee-store'
import {DataTableColumns, NDataTable} from 'naive-ui'
import {EntryItem} from '@/enum/kdbx'
import {kService} from '@/api'
import {RowData} from 'naive-ui/es/data-table/src/interface'
import keepassIcons from '@/assets/icons'
import {useRoute, useRouter} from 'vue-router'

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
    },
    {
      title: 'lastModTime',
      key: 'lastModTime',
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
