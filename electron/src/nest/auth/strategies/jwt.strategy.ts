import {ExtractJwt, Strategy} from 'passport-jwt'
import {PassportStrategy} from '@nestjs/passport'
import {Injectable} from '@nestjs/common'
import {APP_JWT_SECRET_FALLBACK} from '../../enum'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || APP_JWT_SECRET_FALLBACK,
    })
  }

  async validate(payload: any) {
    return {userId: payload.sub, username: payload.username}
  }
}
