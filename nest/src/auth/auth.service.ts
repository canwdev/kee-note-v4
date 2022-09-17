import {Injectable} from '@nestjs/common'
import {UsersService} from '../users/users.service'
import {JwtService} from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username)

    // bcrypt.compareSync hash匹配
    if (user && bcrypt.compareSync(pass, user.password)) {
      // strip password
      const {password, ...result} = user
      return result
    }
    return null
  }

  async login(user: any) {
    const payload = {username: user.username, sub: user.userId}
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
