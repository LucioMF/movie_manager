import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../../auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../jwt-payload';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class JwtStrategyService extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: fs.readFileSync(path.join(__dirname, '../../../../../keys/public.pem'), 'utf-8'),
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.authService.validatePayload(payload);
        
        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}
