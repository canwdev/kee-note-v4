import {Controller, Get, HttpException, HttpStatus, Post, Query} from '@nestjs/common'
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

  @Post('close-database')
  closeDatabase() {
    return this.kdbxHelper.close()
  }

  @Post('save-database')
  saveDatabase() {
    return this.kdbxHelper.save()
  }

  @Get('check-is-open')
  checkIsOpen() {
    return this.kdbxHelper.isOpen
  }

  @Get('check-is-changed')
  getIsChanged() {
    return this.kdbxHelper.isChanged
  }

  @Get('get-meta')
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

  @Get('get-group-tree')
  getGroupTree(@Query('groupUuid') groupUuid) {
    return this.kdbxHelper.getGroupTree(groupUuid)
  }

  @Get('get-group-entries')
  getGroupEntries(@Query('groupUuid') groupUuid) {
    return this.kdbxHelper.getGroupEntries(groupUuid)
  }

  @Get('get-entry-detail')
  getEntryDetail(@Query('uuid') uuid) {
    try {
      return this.kdbxHelper.getEntryDetail(uuid)
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND)
    }
  }

  @Post('update-entry')
  updateEntry(params) {
    return this.kdbxHelper.updateEntry(params)
  }

  @Post('update-group')
  updateGroup(params) {
    return this.kdbxHelper.updateGroup(params)
  }

  @Post('create-entry')
  createEntry(params) {
    return this.kdbxHelper.createEntry(params)
  }

  @Post('create-group')
  createGroup(params) {
    return this.kdbxHelper.createGroup(params)
  }

  @Post('remove-group')
  removeGroup(params) {
    return this.kdbxHelper.removeGroup(params)
  }

  @Post('remove-entry')
  removeEntry(params) {
    this.kdbxHelper.removeEntry(params)
  }

  @Post('move-group')
  moveGroup(params) {
    return this.kdbxHelper.moveGroup(params)
  }

  @Post('move-entry')
  moveEntry(params) {
    return this.kdbxHelper.moveEntry(params)
  }
}
