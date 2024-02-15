import {Controller, Get, Post, Request, UseGuards} from '@nestjs/common'
import {AuthService} from './auth.service'
import {LocalAuthGuard} from './local-auth.guard'
import {JwtAuthGuard} from './jwt-auth.guard'
import {SkipAuth} from './skip-auth'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 注意！这里使用了Guard，因此数据会先在Guard里处理
  // 此处Guard对应的文件是：local.strategy.ts
  // curl -X POST http://localhost:3000/auth/login -d '{"username": "john", "password": "changeme"}' -H "Content-Type: application/json"
  @SkipAuth()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user)
  }

  /// curl http://localhost:3000/profile -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJzdWIiOjEsImlhdCI6MTY2MDM2NTcwNywiZXhwIjoxNjYwNDUyMTA3fQ.r840CJr-76OLIwNzmhLmk4ZKdwiFwlYD-Ax5if5GRko"
  @UseGuards(JwtAuthGuard)
  @Get('auth/profile')
  getProfile(@Request() req) {
    return req.user
  }
}
