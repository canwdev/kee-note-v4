import {Injectable} from '@nestjs/common'
import {KdbxHelper, KdbxOpenOptions} from './enum/kdbx'

@Injectable()
export class KeepassService {
  private readonly kdbxHelper: KdbxHelper

  constructor() {
    this.kdbxHelper = new KdbxHelper()
    this.openDatabase({
      dbPath: 'D:\\Work\\test\\keepass-temp\\test\\databases\\test[123456].kdbx',
      password: '123456',
      keyPath: 'D:\\Work\\test\\keepass-temp\\test\\databases\\test[123456].key',
    })
  }

  openDatabase(options: KdbxOpenOptions) {
    return this.kdbxHelper.open(options)
  }

  getKdbxHelper() {
    return this.kdbxHelper
  }
}
