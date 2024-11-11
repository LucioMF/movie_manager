import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../shared/auth/auth.service';
import { UserService } from '../../user/user.service';
import { JwtPayload } from '../auth/jwt-payload'
import { sign } from 'jsonwebtoken';
import { UserRole } from '../../user/models/user-role.enum';

jest.mock('fs');
jest.mock('path');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let authService: AuthService;
    let userService: UserService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
    });

    describe('signPayload', () => {
        it('should sign the payload with default options', async () => {
            const payload: JwtPayload = { username: 'testuser', role: UserRole.User};
            const mockToken = 'mockedToken';
            (sign as jest.Mock).mockReturnValue(mockToken); // Mock sign function

            const result = await authService.signPayload(payload);

            expect(result).toEqual(mockToken);
            expect(sign).toHaveBeenCalledWith(payload, undefined, {
                expiresIn: '24h',
                algorithm: 'RS256',
            });
        });

        it('should sign the payload with custom options', async () => {
            const payload: JwtPayload = { username: 'testuser', role: UserRole.User};
            const customOptions = { expiresIn: '12h' };
            const mockToken = 'mockedToken';
            (sign as jest.Mock).mockReturnValue(mockToken); // Mock sign function

            const result = await authService.signPayload(payload, customOptions);

            expect(result).toEqual(mockToken);
            expect(sign).toHaveBeenCalledWith(payload, undefined, {
                algorithm: 'RS256',
                expiresIn: '12h',
            });
        });
    });

    describe('validatePayload', () => {
        it('should validate payload and return user', async () => {
            const payload: JwtPayload = { username: 'testuser', role: UserRole.User};
            const mockUser = { username: 'testuser' };
            (userService.findOne as jest.Mock).mockResolvedValueOnce(mockUser);

            const result = await authService.validatePayload(payload);

            expect(result).toEqual(mockUser);
            expect(userService.findOne).toHaveBeenCalledWith({ username: payload.username.toLowerCase() });
        });
    });
});