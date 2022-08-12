import {Module} from '@nestjs/common'
import {KeepassController} from './keepass.controller'
import {KeepassService} from './keepass.service'
import {APP_GUARD} from '@nestjs/core'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'

@Module({
  controllers: [KeepassController],
  providers: [KeepassService],
})
export class KeepassModule {}
