import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { getModelToken } from '@nestjs/mongoose';
import { AuthService } from '../../shared/auth/auth.service';
import { BadRequestException } from '@nestjs/common';
import { hash, compare } from 'bcryptjs';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UserService', () => {
    let service: UserService;
    let userModel;
  
    beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserService,
          {
            provide: getModelToken('User'),
            useValue: {
              create: jest.fn().mockImplementation((user) => Promise.resolve(user)),
              findOne: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null), 
              }),
              findById: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null), 
              }),
              findByIdAndUpdate: jest.fn().mockResolvedValue({}), 
              update: jest.fn(),
            },
          },
          {
            provide: AuthService,
            useValue: {
              signPayload: jest.fn().mockResolvedValue('mockToken'),
            },
          },
        ],
      }).compile();
  
      service = module.get<UserService>(UserService);
      userModel = module.get(getModelToken('User'));
    });
  
    describe('register', () => {
      it('should register a new user successfully', async () => {
        const hashedPassword = '$2a$10$LIxFU7keCm5Y6R7oWBDAOOJ1DtZE6FvMf9myclTRwirNrr0qjKv.S';
        bcrypt.hash = jest.fn().mockResolvedValue(hashedPassword);

        const registerVm = { username: 'testuser', password: 'password123', email: 'test@example.com'};
        const mockUser = { 
            ...registerVm, 
            password: hashedPassword, 
            toJSON: jest.fn().mockReturnValue({ 
                username: 'testuser', 
                password: hashedPassword, 
                email: 'test@example.com' 
            }),
        };

        userModel.create.mockResolvedValueOnce(mockUser);  
        const result = await service.register(registerVm);
        expect(result).toEqual(mockUser.toJSON());
      });

    });
  
    describe('login', () => {
      it('should throw BadRequestException if user does not exist', async () => {
        userModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
  
        await expect(service.login({ username: 'nonexistentuser', password: 'password' })).rejects.toThrow(
          BadRequestException,
        );
      });
  
      it('should return token and user if credentials are valid', async () => {
        const password = 'password123';
        const hashedPassword = await hash(password, 10); 
        const mockUser = { username: 'testuser', password: hashedPassword, _id: 'userId', toJSON: jest.fn() };

        // Mock toJSON
        jest.spyOn(mockUser, 'toJSON').mockReturnValue({ username: 'testuser', password: hashedPassword, _id: 'userId' });

        userModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockUser) });

        // mock bcrypt library
        (compare as jest.Mock).mockImplementation(async (plaintextPassword, hashedPassword) => {
            const isMatch = await hash(plaintextPassword, 10);
            return isMatch === hashedPassword;
        });

        const result = await service.login({ username: 'testuser', password });
        
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('user');
      });
    });
  });