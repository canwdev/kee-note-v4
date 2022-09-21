import {useRoute, useRouter} from 'vue-router'
import {useKeeStore} from '@/store/kee-store'
import {EntryItem} from '@/enum/kdbx'
import {kService} from '@/api'

export const useKeepassEntryList = (isCalendar = false) => {
  const route = useRoute()

  const keeStore = useKeeStore()
  const entryList = ref<EntryItem[]>([])

  const groupUuid = computed(() => {
    return route.query.groupUuid
  })

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

  watch(
    () => groupUuid.value,
    (val) => {
      getEntryList()
    }
  )

  const getEntryList = async () => {
    if (!groupUuid.value) {
      entryList.value = []
      return
    }
    // TODO: fix multiple request
    console.log('getEntryList', groupUuid.value)
    if (isCalendar) {
      entryList.value = await kService.getGroupEntriesDeep({
        groupUuid: groupUuid.value,
        isDayMapped: true,
      })
    } else {
      entryList.value = await kService.getGroupEntries({
        groupUuid: groupUuid.value,
      })
    }
  }

  return {
    entryList,
    getEntryList,
    keeStore,
    groupUuid,
  }
}
