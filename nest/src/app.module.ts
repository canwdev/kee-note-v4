import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {KeepassModule} from './keepass/keepass.module'
import {AuthModule} from './auth/auth.module'
import {UsersModule} from './users/users.module'
import {APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core'
import {JwtAuthGuard} from './auth/guards/jwt-auth.guard'
import {CryptMiddleware} from './crypt.middleware'
import {CryptInterceptor} from './crypt.interceptor'
import {ServeStaticModule} from '@nestjs/serve-static'
import {join} from 'path'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../dist-frontend', '/'),
    }),
    UsersModule,
    AuthModule,
    KeepassModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CryptInterceptor,
    },
    // 在当前 module 下都开启路由守卫
    // 若要开启一个路由都访问权限，请使用 @SkipAuth() 装饰器
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CryptMiddleware).forRoutes('*')
  }
}
