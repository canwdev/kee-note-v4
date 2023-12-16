import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module'

export async function bootstrapNestjs() {
  const app = await NestFactory.create(AppModule)
  const SERVER_PORT = process.env.PORT || 3000
  const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`
  await app.listen(SERVER_PORT)

  let logMessage = ''
  // console.log('[bootstrapNestjs env]', process.env)
  logMessage += `Server running at ${SERVER_URL}`
  console.log(logMessage)

  if (!process.env.JWT_SECRET) {
    const msg = 'Error! Must set JWT_SECRET'
    logMessage += '\n' + msg
    console.error(msg)
  }
  if (!process.env.AUTH_USERS) {
    const url = `${SERVER_URL}/#/gen`

    const msg = `Error! Must set AUTH_USERS, please add them in .env file!\nYou can generate .env file at WebUI: ${url}`
    logMessage += '\n' + msg
    console.error(msg)
  }

  return {
    app,
    logMessage,
  }
}
