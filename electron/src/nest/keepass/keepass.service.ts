import {Injectable} from '@nestjs/common'
import {KdbxHelper, KdbxOpenOptions} from '../../common/keepass/kdbx'
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
    let config: JsonConfig
    let configPath: string

    // 优先读取
    if (process.env.KN_KDBX_CONFIG_JSON) {
      config = JSON.parse(process.env.KN_KDBX_CONFIG_JSON)
    } else if (process.env.KN_KDBX_CONFIG_PATH) {
      configPath = process.env.KN_KDBX_CONFIG_PATH

      // 读取开发demo配置
      if (configPath === '__demo__.json') {
        configPath = Path.join(process.cwd(), './test/db-config.json')
      }
      // 读取配置文件内容
      config = JSON.parse(await Fs.readFile(configPath, 'utf8'))
    } else {
      throw new Error('KN_KDBX_CONFIG_JSON or KN_KDBX_CONFIG_PATH is required')
    }

    const kdbxOpenOptions = config.kdbxOpenOptions
    if (config.isRelativeBase) {
      let basePath: string
      if (process.env.KN_KDBX_CONFIG_JSON) {
        // get process execute path
        basePath = Path.dirname(process.execPath)
      } else {
        basePath = Path.dirname(configPath)
      }

      console.log('[isRelativeBase basePath]', basePath)
      kdbxOpenOptions.dbPath = Path.join(basePath, kdbxOpenOptions.dbPath)
      if (kdbxOpenOptions.keyPath) {
        kdbxOpenOptions.keyPath = Path.join(basePath, kdbxOpenOptions.keyPath)
      }
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
