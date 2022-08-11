import {Controller, Get} from '@nestjs/common'

@Controller('keepass')
export class KeepassController {
  @Get()
  test() {
    return 'ok'
  }
}
