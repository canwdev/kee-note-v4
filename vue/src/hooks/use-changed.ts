export const useBeforeUnload = (checkIsChanged) => {
  const handleBeforeUnload = (e) => {
    if (checkIsChanged()) {
      e.preventDefault()
      e.returnValue = 'There is unsaved data.'
      window.$message.warning(e.returnValue)
      return true
    }
    return undefined
  }
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload)
  })
}

export const useUnSavedChanges = () => {
  const isChanged = ref(false)
  useBeforeUnload(() => isChanged.value)
  return {
    isChanged,
  }
}
