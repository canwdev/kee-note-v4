import {Module} from '@nestjs/common'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {KeepassModule} from './keepass/keepass.module'

@Module({
  imports: [KeepassModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
