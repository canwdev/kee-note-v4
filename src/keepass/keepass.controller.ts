import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import {KeepassService} from './keepass.service'
import {SkipAuth} from '../auth/skip-auth'
import {ErrorInterceptor} from './error.interceptor'

@UseInterceptors(ErrorInterceptor)
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

  @Post('open-database')
  async openDatabase() {
    return this.keepassService.autoOpenDatabase()
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
  updateEntry(@Body() params) {
    return this.kdbxHelper.updateEntry(params)
  }

  @Post('update-group')
  updateGroup(@Body() params) {
    return this.kdbxHelper.updateGroup(params)
  }

  @Post('create-entry')
  createEntry(@Body() params) {
    return this.kdbxHelper.createEntry(params)
  }

  @Post('create-group')
  createGroup(@Body() params) {
    return this.kdbxHelper.createGroup(params)
  }

  @Post('remove-group')
  removeGroup(@Body() params) {
    return this.kdbxHelper.removeGroup(params)
  }

  @Post('remove-entry')
  removeEntry(@Body() params) {
    this.kdbxHelper.removeEntry(params)
  }

  @Post('move-group')
  moveGroup(@Body() params) {
    return this.kdbxHelper.moveGroup(params)
  }

  @Post('move-entry')
  moveEntry(@Body() params) {
    return this.kdbxHelper.moveEntry(params)
  }
}
