import { BaseModel } from '../../shared/base.model';
import { UserRole } from './user-role.enum';
import { prop, ReturnModelType, getModelForClass } from '@typegoose/typegoose';

export class User extends BaseModel<User> {
    @prop({ lowercase: true, trim: true, required: [true, 'username is required'], minlength: [6, 'Must be at least 6 characters'], unique: true })
    username: string;

    @prop({ required: [true, 'password is required'], minlength: [6, 'Must be at least 6 characters'] })
    password: string;

    @prop({ lowercase: true, trim: true, required: [true, 'email is required'], unique: true })
    email: string;

    @prop({ required: [true, 'nick is required'], minlength: [4, 'Must be at least 4 characters'], unique: true })
    nick: string;

    @prop({ enum: UserRole, default: UserRole.User })
    role?: UserRole;

    @prop()
    firstName?: string;

    @prop()
    lastName?: string;

    @prop()
    avatarUrl?: string;

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    static get model(): ReturnModelType<typeof User> {
        return getModelForClass(User);
    }

    static get modelName(): string {
        return 'User';
    }
}
