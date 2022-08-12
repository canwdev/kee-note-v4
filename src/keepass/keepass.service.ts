import {Injectable} from '@nestjs/common'
import {KdbxHelper, KdbxOpenOptions} from './enum/kdbx'
import * as Path from 'path'

const testPath = Path.join(__dirname, '../../test/databases')

@Injectable()
export class KeepassService {
  private readonly kdbxHelper: KdbxHelper

  constructor() {
    this.kdbxHelper = new KdbxHelper()
    // this.openDatabase({
    //   dbPath: Path.join(testPath, 'test[123456].kdbx'),
    //   password: '123456',
    //   keyPath: Path.join(testPath, 'test[123456].key'),
    // })
  }

  openDatabase(options: KdbxOpenOptions) {
    return this.kdbxHelper.open(options)
  }

  getKdbxHelper() {
    return this.kdbxHelper
  }
}
