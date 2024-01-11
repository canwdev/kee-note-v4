interface IStore {
  editorFontSize: number
  isEditWYSIWYG: boolean
  editorFontFamily: string
  editorTheme: string
  isShowMore: boolean
  // whether to enable HyperMD editor
  isAdvancedEditor: boolean
}

export const useEditorSettingsStore = defineStore('editorSettingsStore', {
  state: (): IStore => {
    return {
      editorFontSize: 14,
      isEditWYSIWYG: true,
      editorFontFamily: 'inherit',
      editorTheme: '',
      isShowMore: false,
      isAdvancedEditor: true,
    }
  },
  actions: {},
  persist: {
    key: 'ls_key_keenote_editor_settings',
  },
})
