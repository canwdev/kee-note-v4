import {Injectable} from '@nestjs/common'
import {MyCrypt} from './utils/my-crypt'
import * as path from 'path'
import * as fs from 'fs'

@Injectable()
export class AppService {
  private readonly myCrypt: MyCrypt

  constructor() {
    if (process.env.KN_HTTP_CRYPT_KEY) {
      this.myCrypt = new MyCrypt(process.env.KN_HTTP_CRYPT_KEY)
    }
  }

  getHello() {
    return {
      has_env_file: Boolean(process.env.JWT_SECRET),
      message: 'Hello World!',
    }
  }

  setEnv(params: any) {
    const envStr = params?.env as string
    if (!envStr) {
      throw new Error('env is required')
    }
    // save to .env file
    const filePath = path.join(process.cwd(), '.env')
    fs.writeFileSync(filePath, envStr)

    return {
      message: 'Saved! Please restart the server manually.',
    }
  }

  getMyCrypt() {
    return this.myCrypt
  }
}
