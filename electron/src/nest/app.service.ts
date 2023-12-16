import {Injectable} from '@nestjs/common'
import {MyCrypt} from './utils/my-crypt'

@Injectable()
export class AppService {
  private readonly myCrypt: MyCrypt

  constructor() {
    if (process.env.KN_HTTP_CRYPT_KEY) {
      this.myCrypt = new MyCrypt(process.env.KN_HTTP_CRYPT_KEY)
    }
  }

  getHello(): string {
    return 'Hello World!'
  }

  getMyCrypt() {
    return this.myCrypt
  }
}
