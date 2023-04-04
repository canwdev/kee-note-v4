/* eslint-disable @typescript-eslint/no-var-requires */
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const inquirer = require('inquirer')
const Fs = require('fs')

function writeTextSync(pth, str) {
  return Fs.writeFileSync(pth, str, {
    encoding: 'utf8',
  })
}

async function inquireInputString(message = '请输入：', defaultResult = '') {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'string',
      message: message,
      default: defaultResult,
    },
  ])
  return answers.string
}

async function getUserInfoStr() {
  const username = await inquireInputString('Please input new username', 'test')
  const password = await inquireInputString('Please input new password', '__REPLACE_ME__')
  const user = {
    userId: Date.now(),
    username,
    password,
  }
  user.password = bcrypt.hashSync(user.password, 10)
  console.log('Salted password:', user.password)

  return JSON.stringify([user])
}

async function generateConfig() {
  const userInfoTxt = await getUserInfoStr()
  const JWT_EXPIRES_IN = await inquireInputString('[JWT_EXPIRES_IN]', '7d')

  const DB_CONFIG_JSON_TIP = `Kdbx configuration file path, the database will be loaded once the server starts`
  const DB_CONFIG_JSON = await inquireInputString(
    `[DB_CONFIG_JSON] ${DB_CONFIG_JSON_TIP}`,
    'test/db-config.json'
  )

  const MY_CRYPT_KEY_TIP = `Recommended enable in production mode, it can encrypt/decrypt request query/body and response body`
  const MY_CRYPT_KEY = await inquireInputString(
    `[MY_CRYPT_KEY] ${MY_CRYPT_KEY_TIP}`,
    crypto.randomBytes(16).toString('hex')
  )

  const txt = `JWT_SECRET=${crypto.randomBytes(16).toString('hex')}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
AUTH_USERS=${userInfoTxt}

# ${DB_CONFIG_JSON_TIP}
DB_CONFIG_JSON=${DB_CONFIG_JSON}

# ${MY_CRYPT_KEY_TIP}
MY_CRYPT_KEY=${MY_CRYPT_KEY}
`
  writeTextSync('.env.example', txt)
  console.log('\n.env.example generated\n\n')
  console.log(txt)
}

generateConfig()
