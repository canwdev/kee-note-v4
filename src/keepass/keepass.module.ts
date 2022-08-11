import {Module} from '@nestjs/common'
import {KeepassController} from './keepass.controller'
import { KeepassService } from './keepass.service';

@Module({
  controllers: [KeepassController],
  providers: [KeepassService],
})
export class KeepassModule {}
