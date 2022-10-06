import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'

console.log('[KeeNote Server] Starting...')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT || 3000
  await app.listen(port)
  // console.log('[env test]', process.env)
  console.log(`[KeeNote Server] started http://localhost:${port}`)
}
bootstrap()
