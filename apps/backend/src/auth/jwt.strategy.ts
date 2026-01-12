
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'SECRET_KEY_DEV', // In PROD use env vars
        });
    }

    async validate(payload: any) {
        // Payload should contain { sub: userId, email: ..., tenantId: ... }
        return { userId: payload.sub, email: payload.email, tenantId: payload.tenantId };
    }
}
