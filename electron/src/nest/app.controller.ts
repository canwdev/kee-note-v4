import {Controller, Get, Post, UseGuards, Request, Req, Body} from '@nestjs/common'
import {AppService} from './app.service'
import {AuthService} from './modules/auth/auth.service'
import {SkipAuth} from './modules/auth/skip-auth'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private authService: AuthService) {}

  @SkipAuth()
  @Get('hello')
  getHello() {
    return this.appService.getHello()
  }

  @SkipAuth()
  @Post('set-env')
  setEnv(@Body() params: any) {
    return this.appService.setEnv(params)
  }
}
