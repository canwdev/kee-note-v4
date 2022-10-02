import {DropdownOption} from 'naive-ui'

export const useContextMenu = (getOptions) => {
  const rightMenuOptions = ref<DropdownOption[]>([])
  const showRightMenu = ref(false)
  const xRef = ref(0)
  const yRef = ref(0)

  const editingNode = ref<any | null>(null)
  const nodeAction = (node: any | null, cb) => {
    // console.log(node)
    editingNode.value = node
    cb()
  }

  return {
    editingNode,
    nodeAction,
    rightMenuOptions,
    showRightMenu,
    xRef,
    yRef,
    handleSelect: () => {
      showRightMenu.value = false
    },
    handleClickOutside: () => {
      showRightMenu.value = false
      nodeAction(null, () => {})
    },
    handleContextmenu(event: MouseEvent, option: any): void {
      rightMenuOptions.value = getOptions(option, event)
      showRightMenu.value = true
      xRef.value = event.clientX
      yRef.value = event.clientY
      event.preventDefault()
    },
  }
}
