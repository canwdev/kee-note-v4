import {Injectable} from '@nestjs/common'

export type User = {
  userId: number
  username: string
  password?: string
  password_salted: string
}

@Injectable()
export class UsersService {
  private readonly users: User[]

  constructor() {
    const usersJson = process.env.AUTH_USERS
    if (!usersJson) {
      console.warn(`Warning! No user set`)
    }
    this.users = JSON.parse(usersJson || '{}')
    // console.log('users', this.users)
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find((user) => user.username === username)
  }
}
