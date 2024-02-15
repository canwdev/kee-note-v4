import {Module} from '@nestjs/common'
import {AuthService} from './auth.service'
import {UsersModule} from '../users/users.module'
import {PassportModule} from '@nestjs/passport'
import {LocalStrategy} from './local.strategy'
import {JwtModule} from '@nestjs/jwt'
import {JwtStrategy} from './jwt.strategy'
import {ConfigModule} from '@nestjs/config'
import {APP_JWT_SECRET_FALLBACK} from '../../enum'

import {isDev} from '../../../common/utils'
import {AuthController} from './auth.controller'
const envFilePath = isDev
  ? ['.env.development', '.env.development.local']
  : ['.env.production', '.env']

console.log('[envFilePath]', envFilePath)

@Module({
  imports: [
    ConfigModule.forRoot({
      // ignoreEnvFile: true,
      isGlobal: true,
      envFilePath,
    }),
    UsersModule,
    PassportModule,
    // https://github.com/auth0/node-jsonwebtoken#usage
    JwtModule.register({
      secret: process.env.JWT_SECRET || APP_JWT_SECRET_FALLBACK,
      signOptions: {expiresIn: process.env.JWT_EXPIRES_IN || '1d'},
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
