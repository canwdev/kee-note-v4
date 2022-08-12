import {Controller, Get} from '@nestjs/common'
import {KeepassService} from './keepass.service'
import {SkipAuth} from '../auth/skip-auth'

@Controller('keepass')
export class KeepassController {
  constructor(private keepassService: KeepassService) {}

  @SkipAuth()
  @Get()
  test() {
    return 'ok'
  }

  get kdbxHelper() {
    return this.keepassService.getKdbxHelper()
  }

  @Get('open')
  async openDatabase() {
    return 'fake open'
  }

  closeDatabase() {
    return this.kdbxHelper.close()
  }

  saveDatabase() {
    return this.kdbxHelper.save()
  }

  @Get('check')
  checkIsOpen() {
    return this.kdbxHelper.isOpen
  }

  @Get('check-changed')
  getIsChanged() {
    return this.kdbxHelper.isChanged
  }

  @Get('meta')
  async getMeta() {
    const meta: any = (this.kdbxHelper.db && this.kdbxHelper.db.meta) || {}
    console.log('meta', meta)
    return {
      // header: kInstance.db.header,
      meta: {
        recycleBinEnabled: meta.recycleBinEnabled,
        recycleBinUuid: meta.recycleBinUuid,
      },
    }
  }

  getGroupTree(groupUuid) {
    return this.kdbxHelper.getGroupTree(groupUuid)
  }

  getGroupEntries(groupUuid) {
    return this.kdbxHelper.getGroupEntries(groupUuid)
  }

  getEntryDetail(uuid) {
    return this.kdbxHelper.getEntryDetail(uuid)
  }

  updateEntry(params) {
    return this.kdbxHelper.updateEntry(params)
  }

  updateGroup(params) {
    return this.kdbxHelper.updateGroup(params)
  }

  createEntry(params) {
    return this.kdbxHelper.createEntry(params)
  }

  createGroup(params) {
    return this.kdbxHelper.createGroup(params)
  }

  removeGroup(params) {
    return this.kdbxHelper.removeGroup(params)
  }

  removeEntry(params) {
    this.kdbxHelper.removeEntry(params)
  }

  moveGroup(params) {
    return this.kdbxHelper.moveGroup(params)
  }

  moveEntry(params) {
    return this.kdbxHelper.moveEntry(params)
  }
}
