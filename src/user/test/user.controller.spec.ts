import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { AuthService } from '../../shared/auth/auth.service';
import { RegisterVm } from '../models/view-models/register-vm.model';
import { LoginVm } from '../models/view-models/login-vm.model';
import { LoginResponseVm } from '../models/view-models/login-response-vm.model';
import { UserVm } from '../models/view-models/user-vm.model';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { mock } from 'jest-mock-extended';
import { User } from '../models/user.model';
import { DocumentType } from '@typegoose/typegoose';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            findOne: jest.fn(),
            map: jest.fn().mockImplementation((user) => {
                // Simulate mapping to UserVm
                return Promise.resolve({
                  username: user.username,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  nick: user.nick,
                  avatarUrl: user.avatarUrl,
                  role: user.role,
                } as UserVm);
              }),
            },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const registerVm: RegisterVm = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const newUser = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        fullName: 'Test User',
        nick: 'testnick',
        avatarUrl: null,
      };

      // Mock the register method to return the new user object
      jest.spyOn(userService, 'register').mockResolvedValue(newUser);

      // Mock the response object
      const mockRes = {
        status: jest.fn().mockReturnThis(), // Ensures `res.status(400)` returns `res` itself
        send: jest.fn(),
      };
  
      await controller.register(registerVm, mockRes);

      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should throw an error if username already exists', async () => {
      const registerVm: RegisterVm = {
        username: 'existinguser',
        password: 'password123',
        email: 'test@example.com',
      };

      const existingUser = mock<DocumentType<User>>();
      existingUser.username = 'existinguser';

      jest.spyOn(userService, 'findOne').mockResolvedValueOnce(existingUser); // Simulate finding existing user

      // Mock the response object
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await controller.register(registerVm, mockRes as any);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining(`El usuario ${registerVm.username} ya existe.`)
      }));
    });

    it('should handle internal server error during registration', async () => {
      const registerVm: RegisterVm = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      };

      jest.spyOn(userService, 'register').mockImplementation(() => {
        throw new InternalServerErrorException();
      });

      await expect(controller.register(registerVm, {} as any)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('login', () => {
    it('should successfully log in a user', async () => {
      const loginVm: LoginVm = {
        username: 'testuser',
        password: 'password123',
      };

      const loginResponse: LoginResponseVm = { token: 'token123', user: new UserVm() };
      jest.spyOn(userService, 'login').mockResolvedValue(loginResponse);

      const result = await controller.login(loginVm);
      expect(result).toEqual(loginResponse);
    });

    it('should throw an error if login credentials are invalid', async () => {
      const loginVm: LoginVm = {
        username: 'invaliduser',
        password: 'wrongpassword',
      };

      jest.spyOn(userService, 'login').mockImplementation(() => {
        throw new BadRequestException();
      });

      await expect(controller.login(loginVm)).rejects.toThrow(BadRequestException);
    });
  });
});