import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InMemoryStore } from '../store/in-memory.store';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly store: InMemoryStore) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'zsmart_jwt_secret_key_2026',
    });
  }

  async validate(payload: any) {
    const dbUser = this.store.getUserById(payload.sub);
    return {
      sub: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
      roleName: payload.roleName,
      name: dbUser ? dbUser.name : 'Unknown',
    };
  }
}
