import {Injectable} from '@nestjs/common'

export type User = {
  userId: number
  username: string
  password: string
}

@Injectable()
export class UsersService {
  private readonly users: User[]

  constructor() {
    const usersJson = process.env.AUTH_USERS
    if (!usersJson) {
      throw new Error(
        'Must have users, please add them in .env file!\nYou can generate users JSON by test/generate-user.js'
      )
    }
    this.users = JSON.parse(usersJson)
    // console.log('users', this.users)
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username)
  }
}
