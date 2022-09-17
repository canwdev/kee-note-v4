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
  notes?: string
  _origin?: any
}
