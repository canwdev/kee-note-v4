import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'

console.log('[KeeNote Server] Starting...')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const SERVER_PORT = process.env.PORT || 3000
  const SERVER_URL = `http://localhost:${SERVER_PORT}`
  await app.listen(SERVER_PORT)
  // console.log('[env test]', process.env)
  console.log(`[KeeNote Server] running at ${SERVER_URL}`)

  if (!process.env.JWT_SECRET) {
    console.error('Error! Must set JWT_SECRET')
  }
  if (!process.env.AUTH_USERS) {
    const url = `${SERVER_URL}/#/gen`
    console.error(
      `Error! Must set AUTH_USERS, please add them in .env file!\nYou can generate .env file at WebUI: ${url}`
    )
  }
}
bootstrap()
