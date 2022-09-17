import {Module} from '@nestjs/common'
import {AuthService} from './auth.service'
import {UsersModule} from '../users/users.module'
import {PassportModule} from '@nestjs/passport'
import {LocalStrategy} from './strategies/local.strategy'
import {JwtModule} from '@nestjs/jwt'
import {JwtStrategy} from './strategies/jwt.strategy'
import {ConfigModule} from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({
      // ignoreEnvFile: true,
      isGlobal: true,
      envFilePath: process.env.IS_DEV ? ['.env.development', '.env.development.local'] : ['.env'],
    }),
    UsersModule,
    PassportModule,
    // https://github.com/auth0/node-jsonwebtoken#usage
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {expiresIn: process.env.JWT_EXPIRES_IN || '1d'},
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
