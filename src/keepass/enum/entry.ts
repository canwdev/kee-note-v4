function getMapValue(obj, val) {
  if (obj instanceof Map) {
    return obj.get(val)
  }
  return obj[val]
}

export interface GroupItem {
  title: string
  children: GroupItem[]
  data: {
    uuid: string
    icon: number
  }
}

export class GroupItem {
  constructor(group, children?) {
    this.title = group.name
    this.children = children || null
    this.data = {
      uuid: group.uuid.id,
      icon: group.icon,
      // _origin: group
    }
  }
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

export class EntryItem {
  constructor(entry, isDetailed = false) {
    this.uuid = entry.uuid.id
    this.icon = entry.icon
    this.title = getMapValue(entry.fields, 'Title')
    this.bgColor = entry.bgColor
    this.fgColor = entry.fgColor
    this.creationTime = entry.times.creationTime
    this.lastModTime = entry.times.lastModTime
    if (isDetailed) {
      this.notes = getMapValue(entry.fields, 'Notes')
      this._origin = entry
    }
  }
}
