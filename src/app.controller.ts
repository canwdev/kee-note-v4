import {Controller, Get, Post, UseGuards, Request, Req} from '@nestjs/common'
import {AppService} from './app.service'
import {LocalAuthGuard} from './auth/guards/local-auth.guard'
import {AuthService} from './auth/auth.service'
import {JwtAuthGuard} from './auth/guards/jwt-auth.guard'
import {SkipAuth} from './auth/skip-auth'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private authService: AuthService) {}

  @SkipAuth()
  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  // curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user)
  }

  /// curl http://localhost:3000/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJzdWIiOjEsImlhdCI6MTY2MDM2NTcwNywiZXhwIjoxNjYwNDUyMTA3fQ.r840CJr-76OLIwNzmhLmk4ZKdwiFwlYD-Ax5if5GRko"
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
