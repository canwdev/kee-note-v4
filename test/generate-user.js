/* eslint-disable @typescript-eslint/no-var-requires */
const bcrypt = require('bcrypt')

function generateUser() {
  const user = {
    userId: Date.now(),
    username: 'test',
    password: '__REPLACE_ME__',
  }
  user.password = bcrypt.hashSync(user.password, 10)
  console.log(JSON.stringify([user]))
}

generateUser()
