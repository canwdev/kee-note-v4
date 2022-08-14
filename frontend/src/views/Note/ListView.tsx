import {useKeeStore} from '@/store/kee-store'
import {DataTableColumns, NDataTable} from 'naive-ui'
import {EntryItem} from '@/enum/kdbx'
import {kService} from '@/api'
import {RowData} from 'naive-ui/es/data-table/src/interface'
import keepassIcons from '@/assets/icons'
import {useRouter} from 'vue-router'

export default defineComponent({
  props: {
    selectedKey: {
      type: String,
      default: null,
    },
  },
  setup() {
    const router = useRouter()

    const keeStore = useKeeStore()
    const entryList = ref<EntryItem[]>([])

    watch(
      () => keeStore.currentGroupUuid,
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
            return (
              <img
                onClick={(e) => e.stopPropagation()}
                alt={String(row.icon)}
                src={String(keepassIcons[row.icon])}
                style={{height: '24px', width: '24px'}}
              />
            )
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
      if (!keeStore.currentGroupUuid) {
        entryList.value = []
        return
      }
      const list = await kService.getGroupEntries({
        groupUuid: keeStore.currentGroupUuid,
      })

      entryList.value = list
    }

    onMounted(() => {
      getEntryList()
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
    })

    const columns = createColumns()
    const rowProps = (row: RowData) => {
      return {
        style: 'cursor: pointer;',
        onClick: () => {
          console.log(row)
          router.push({
            name: 'NoteDetailView',
            query: {uuid: row.uuid},
          })
        },
      }
    }

    return () => (
      <div class="note-list-view">
        <NDataTable
          columns={columns}
          rowProps={rowProps}
          data={entryList.value}
          pagination={paginationReactive}
          bordered={false}
        />
      </div>
    )
  },
})
