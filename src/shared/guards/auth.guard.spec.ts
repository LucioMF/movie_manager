import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import { SharedModule } from '../shared.module';
import { MongooseModule } from '@nestjs/mongoose';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [SharedModule, 
                MongooseModule.forRoot('mongodb://localhost:27017/movie-manager'),
            ],
            providers: [JwtAuthGuard],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    });

    it("should throw UnauthorizedException when token is not Bearer", async () => {
        const context = {
          getClass: jest.fn(),
          getHandler: jest.fn(),
          switchToHttp: jest.fn(() => ({
            getRequest: jest.fn().mockReturnValue({
              headers: {
                authorization: "providedToken"
              }
            }),
            getResponse: jest.fn().mockReturnValue({}),
          })),
        } as any;
      
        await expect(guard.canActivate(context)).rejects.toThrow(
          UnauthorizedException
        );
        expect(context.switchToHttp).toHaveBeenCalled();
      });
});