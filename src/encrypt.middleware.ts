import {Injectable, NestMiddleware} from '@nestjs/common'
import {AppService} from './app.service'

@Injectable()
export class EncryptMiddleware implements NestMiddleware {
  constructor(private readonly appService: AppService) {}

  use(req: any, res: any, next: () => void) {
    const myCrypt = this.appService.getMyCrypt()
    if (!myCrypt) {
      return next()
    }
    // 解密报文
    if (/post/gi.test(req.method) && req.body) {
      const {ie, main} = req.body
      if (ie && main) {
        // console.log('POST', req.body)
        req.body = JSON.parse(myCrypt.decrypt(main))
      }
    }
    if (/get/gi.test(req.method) && req.query) {
      const {ie, main} = req.query
      if (ie && main) {
        // console.log('GET', req.query)
        req.query = JSON.parse(myCrypt.decrypt(main))
      }
    }
    next()
  }
}
