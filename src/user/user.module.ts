import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from './models/user.model';
import { getModelForClass } from '@typegoose/typegoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.modelName,
        schema: getModelForClass(User).schema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
