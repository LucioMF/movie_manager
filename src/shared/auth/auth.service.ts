import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { SignOptions, sign } from 'jsonwebtoken';
import { UserService } from '../../user/user.service';
import { JwtPayload } from './jwt-payload';
import { User } from '../../user/models/user.model';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AuthService {
    private readonly jwtOptions: SignOptions;
    private readonly jwtPrivateKey: string;
    private readonly jwtPublicKey: string;

    constructor(
        @Inject(forwardRef(() => UserService))
        readonly userService: UserService,
    ) {
        this.jwtOptions = { expiresIn: '24h', algorithm: 'RS256' };
        this.jwtPrivateKey = fs.readFileSync(path.join(__dirname, '../../../keys/private.pem'), 'utf-8');
        this.jwtPublicKey = fs.readFileSync(path.join(__dirname, '../../../keys/public.pem'), 'utf-8');
    }

    async signPayload(payload: JwtPayload, jwtCustomOptions?: SignOptions): Promise<string> {
        if (jwtCustomOptions) {
            jwtCustomOptions.algorithm = 'RS256';;
            return sign(payload, this.jwtPrivateKey, jwtCustomOptions);
        } else {
            return sign(payload, this.jwtPrivateKey, this.jwtOptions);
        }
    }

    async validatePayload(payload: JwtPayload): Promise<User> {
        const user = this.userService.findOne({ username: payload.username.toLowerCase() });
        return user;
    }
}
