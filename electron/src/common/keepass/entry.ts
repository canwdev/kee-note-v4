import * as kdbxweb from 'kdbxweb'
import {getFieldString, getMapValue} from '../utils'

export interface GroupItem {
  uuid: string
  icon: number
  title: string
  children: GroupItem[]
}

export class GroupItem {
  constructor(group, children?) {
    this.uuid = group.uuid.id
    this.icon = group.icon
    this.title = group.name
    this.children = children || null
  }
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
  attachmentNames?: string[]
  fieldsV2?: FieldsV2 | any
  _origin?: any
}

export class EntryItem {
  constructor(entry, isDetailed = false) {
    // console.log('[entry]', entry)

    this.uuid = entry.uuid.id
    this.icon = entry.icon
    this.title = getMapValue(entry.fields, 'Title')
    this.bgColor = entry.bgColor
    this.fgColor = entry.fgColor
    this.creationTime = entry.times.creationTime
    this.lastModTime = entry.times.lastModTime
    if (isDetailed) {
      this.attachmentNames = Array.from(entry.binaries.keys())

      this.fieldsV2 = {}

      for (const key of entry.fields.keys()) {
        this.fieldsV2[key] = getFieldString(entry, key)
      }

      // this._origin = entry
    }
  }

  _getPassword(entry) {
    const password = entry.fields.get('Password') || kdbxweb.ProtectedValue.fromString('')
    if (!password.isProtected) {
      return kdbxweb.ProtectedValue.fromString(password)
    }
    return password.getText()
  }
}

export interface CalendarData {
  // year
  [key: string]: {
    // month
    [key: string]: {
      // date
      [key: string]: EntryItem[]
    }
  }
}
