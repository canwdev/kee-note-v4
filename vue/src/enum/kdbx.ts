export interface GroupItem {
  uuid: string
  icon: number
  title: string
  children: GroupItem[]
}

export interface EntryItem {
  uuid: string
  icon: number
  title: string
  bgColor: string
  fgColor: string
  creationTime: Date
  lastModTime: Date
  fieldsV2?: string
  attachmentNames?: string
  _origin?: any
}
