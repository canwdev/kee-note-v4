/* eslint-disable @typescript-eslint/no-var-requires */
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

function generateUserConfig() {
  const user = {
    userId: Date.now(),
    username: 'test',
    password: '__REPLACE_ME__',
  }
  user.password = bcrypt.hashSync(user.password, 10)

  return JSON.stringify([user])
}

function generateConfig() {
  return `
JWT_SECRET=${crypto.randomBytes(16).toString('hex')}
JWT_EXPIRES_IN=7d
AUTH_USERS=${generateUserConfig()}
# Kdbx configuration file path, the database will be loaded once the server starts
#DB_CONFIG_JSON=xxx.json
# Recommended to open in production mode, it can encrypt/decrypt request query/body and response body
MY_CRYPT_KEY=${crypto.randomBytes(16).toString('hex')}
`
}

console.log(generateConfig())
