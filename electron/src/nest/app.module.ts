import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {KeepassModule} from './modules/keepass/keepass.module'
import {AuthModule} from './modules/auth/auth.module'
import {UsersModule} from './modules/users/users.module'
import {APP_GUARD, APP_INTERCEPTOR} from '@nestjs/core'
import {JwtAuthGuard} from './modules/auth/jwt-auth.guard'
import {CryptMiddleware} from './modules/crypt/crypt.middleware'
import {CryptInterceptor} from './modules/crypt/crypt.interceptor'
import {ServeStaticModule} from '@nestjs/serve-static'
import {join} from 'path'

@Module({
  imports: [
    //  静态资源（前端）目录
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../../dist-frontend', '/'),
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
    // 在当前 module 下都开启JwtAuth守卫
    // 若要开启一个路由无需登录即可访问的权限，请使用 @SkipAuth() 装饰器
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
