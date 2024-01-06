export interface GroupItem {
  uuid: string
  icon: number
  title: string
  children: GroupItem[]
}

export type FieldsV2 = {
  Title: string
  UserName: string
  Password: string
  URL: string
  Notes: string
}

export interface EntryItem {
  uuid: string
  icon: number
  title: string
  bgColor: string
  fgColor: string
  creationTime: Date
  lastModTime: Date
  fieldsV2?: FieldsV2
  attachmentNames?: string[]
  _origin?: any
}
