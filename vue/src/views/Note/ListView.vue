<script lang="ts" setup>
import {useKeeStore} from '@/store/kee-store'
import {DataTableColumns, NButton, NDataTable, NDropdown, TreeOption} from 'naive-ui'
import {EntryItem} from '@/enum/kdbx'
import {kService} from '@/api'
import keepassIcons from '@/assets/icons'
import {useRoute, useRouter} from 'vue-router'
import {formatDate} from '@/utils'
import globalEventBus, {GlobalEvents, saveDatabaseAsync} from '@/utils/bus'
import DialogGroupSelect from '@/components/DialogGroupSelect.vue'

const router = useRouter()
const route = useRoute()

const keeStore = useKeeStore()
const entryList = ref<EntryItem[]>([])

const groupUuid = computed(() => {
  return route.query.groupUuid
})

watch(
  () => groupUuid.value,
  (val) => {
    getEntryList()
  }
)
watch(
  () => keeStore.isDbOpened,
  (val) => {
    if (val) {
      getEntryList()
    } else {
      entryList.value = []
    }
  }
)

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
      title: 'Create Time',
      key: 'creationTime',
      render(row, index) {
        return h('span', {}, formatDate(new Date(row.creationTime)))
      },
    },
    {
      title: 'Update Time',
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
                label: '📁 Move to group',
                props: {
                  onClick: () => {
                    tempEditEntry.value = row
                    showGroupSelectModal.value = true
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
                        handleDeleteEntry(row.uuid)
                      },
                      onNegativeClick: () => {},
                    })
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
                  size: 'small',
                },
                {default: () => '⚙️'}
              ),
          }
        )
      },
    },
  ]
}

const getEntryList = async () => {
  if (!groupUuid.value) {
    entryList.value = []
    return
  }
  entryList.value = await kService.getGroupEntries({
    groupUuid: groupUuid.value,
  })
}

onMounted(() => {
  if (keeStore.isDbOpened) {
    getEntryList()
  }
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

const tempEditEntry = ref<EntryItem | null>(null)
const showGroupSelectModal = ref(false)
const handleSelectGroup = async (groupUuid: string) => {
  // console.log(groupUuid)
  if (!tempEditEntry.value) {
    return
  }
  await kService.moveEntry({
    groupUuid: groupUuid,
    uuid: tempEditEntry.value.uuid,
  })

  await saveDatabaseAsync()
  await getEntryList()
  tempEditEntry.value = null
}
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
        />
      </div>
    </n-scrollbar>
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
