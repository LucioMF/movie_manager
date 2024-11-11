import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Inject,
  forwardRef,
  HttpException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User } from './models/user.model';
import { BaseService } from '../shared/base.service';
import { ReturnModelType } from '@typegoose/typegoose';
import { RegisterVm } from './models/view-models/register-vm.model';
import { genSalt, hash, compare } from 'bcryptjs';
import { AuthService } from '../shared/auth/auth.service';
import { LoginVm } from './models/view-models/login-vm.model';
import { LoginResponseVm } from './models/view-models/login-response-vm.model';
import { JwtPayload } from '../shared/auth/jwt-payload';
import { UserVm } from './models/view-models/user-vm.model';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @InjectModel('User') private readonly userModel: ReturnModelType<typeof User>,
    @Inject(forwardRef(() => AuthService)) readonly authService: AuthService,
  ) {
    super();
    this.model = userModel;
  }

  async register(registerVm: RegisterVm): Promise<User> {
    const { username, password, email, firstName, lastName, nick, avatarUrl, role } = registerVm;

    const newUser = await this.model.create({
        username: username,
        firstName: firstName,
        lastName: lastName,
        nick: nick,
        avatarUrl: avatarUrl,
        email: email,
        role: role
      });

    const salt = await genSalt(10);
    newUser.password = await hash(password, salt);

    try {
      const result = await this.create(newUser);
      return result[0].toJSON() as User;
    } catch (e) {
      // Mongo Error
      throw new InternalServerErrorException(e);
    }
  }

  async login(loginVm: LoginVm): Promise<LoginResponseVm> {
    const { username, password } = loginVm;

    const user = await this.findOne({ username });
    if (!user) {
      throw new BadRequestException('Invalid Credentials');
    }

    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('Invalid Credentials');
    }

    const payload: JwtPayload = {
      username: user.username,
      role: user.role,
    };

    const token = await this.authService.signPayload(payload);

    const userVm: UserVm = {
        username: user.username,
        nick: user.nick,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
    };

    return {
      token,
      user: userVm,
    };
  }
  public async setAvatar(username: string, avatarUrl: string) {
    const user = await this.findOne({ username });

    if (!user) {
        throw new BadRequestException('Invalid Credentials');
    }

    const updatedUser = await this.update(user._id, { avatarUrl });

    if (!updatedUser) {
        throw new InternalServerErrorException('Failed to update avatar URL');
    }

    return updatedUser;
}

}
