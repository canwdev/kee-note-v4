import {Injectable} from '@nestjs/common'
import {KdbxHelper, KdbxOpenOptions} from './enum/kdbx'
import * as Path from 'path'
import * as Fs from 'fs-extra'

type JsonConfig = {
  isRelativeBase: boolean // 当前配置文件目录是否为数据库和密钥都相对根目录
  kdbxOpenOptions: KdbxOpenOptions
}

@Injectable()
export class KeepassService {
  private readonly kdbxHelper: KdbxHelper

  constructor() {
    this.kdbxHelper = new KdbxHelper()
    // this.autoOpenDatabase()
  }

  async loadDbConfig(): Promise<KdbxOpenOptions> {
    const configPath =
      process.env.DB_CONFIG_JSON || Path.join(__dirname, '../../test/db-config.json')
    const config: JsonConfig = JSON.parse(await Fs.readFile(configPath, 'utf8'))

    const kdbxOpenOptions = config.kdbxOpenOptions
    if (config.isRelativeBase) {
      const basePath = Path.dirname(configPath)
      kdbxOpenOptions.dbPath = Path.join(basePath, kdbxOpenOptions.dbPath)
      kdbxOpenOptions.keyPath = Path.join(basePath, kdbxOpenOptions.keyPath)
    }
    return kdbxOpenOptions
  }

  autoOpenDatabase(params: any) {
    return this.loadDbConfig().then((openOptions) => {
      if (params && params.password) {
        openOptions.password = params.password
      }
      return this.openDatabase(openOptions)
    })
  }

  openDatabase(options: KdbxOpenOptions) {
    return this.kdbxHelper.open(options)
  }

  getKdbxHelper() {
    return this.kdbxHelper
  }
}
