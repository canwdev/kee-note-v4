import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import {KeepassService} from './keepass.service'
import {SkipAuth} from '../auth/skip-auth'
import {ErrorInterceptor} from './error.interceptor'
import * as FileType from 'file-type'
import {AnyFilesInterceptor} from '@nestjs/platform-express'

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
  async openDatabase(@Body() params) {
    return this.keepassService.autoOpenDatabase(params)
  }

  @Post('close-database')
  closeDatabase() {
    return this.kdbxHelper.close()
  }

  @Post('save-database')
  saveDatabase() {
    return this.kdbxHelper.save()
  }

  @Post('check-is-open')
  checkIsOpen() {
    return this.kdbxHelper.isOpen
  }

  @Post('check-is-changed')
  getIsChanged() {
    return this.kdbxHelper.isChanged
  }

  @Post('get-meta')
  async getMeta() {
    return this.kdbxHelper.getMeta()
  }

  @Post('get-group-tree')
  getGroupTree(@Body('groupUuid') groupUuid) {
    return this.kdbxHelper.getGroupTree(groupUuid)
  }

  @Post('get-group-entries')
  getGroupEntries(@Body('groupUuid') groupUuid) {
    return this.kdbxHelper.getGroupEntries(groupUuid)
  }

  @Post('get-group-entries-deep')
  getGroupEntriesDeep(@Body() params) {
    return this.kdbxHelper.getGroupEntriesDeep(params)
  }

  @Post('get-entry-detail')
  getEntryDetail(@Body('uuid') uuid) {
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

  @Post('get-attachment')
  async getAttachment(@Body() params, @Res() res) {
    const {filename} = params || {}
    const arrayBufferData = this.kdbxHelper.getAttachment(params).value
    const buffer = Buffer.from(arrayBufferData)
    console.log('[arrayBufferData]', arrayBufferData)
    console.log('[buffer]', buffer)

    const type = await FileType.fromBuffer(buffer)

    console.log('[type]', type)

    res.writeHead(200, {
      'Content-Type': type?.mime || 'application/octet-stream',
      'Content-Disposition': `attachment; filename=${encodeURIComponent(filename)}`,
    })
    res.end(buffer)
  }

  @Post('remove-attachment')
  removeAttachment(@Body() params) {
    return this.kdbxHelper.removeAttachment(params)
  }

  @Post('upload-attachment')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadAttachment(@Query() query, @UploadedFiles() files: Array<Express.Multer.File>) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const {originalname, mimetype, buffer} = file
      await this.kdbxHelper.setAttachment({
        uuid: query.uuid,
        filename: decodeURIComponent(originalname),
        buffer,
      })
    }
  }

  @Post('rename-attachment')
  renameAttachment(@Body() params) {
    return this.kdbxHelper.renameAttachment(params)
  }
}
