import {
    Controller,
    HttpStatus,
    Post,
    UsePipes,
    Res,
    Body,
    BadRequestException,
    InternalServerErrorException,
    UseInterceptors,
    Get,
    UploadedFile,
    Logger,
    UseGuards,
    Put,
    Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiResponse, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserVm } from './models/view-models/user-vm.model';
import { User } from './models/user.model';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { RegisterVm } from './models/view-models/register-vm.model';
import { ApiException } from '../shared/dto-models/api-exception.model';
import { GetOperationMetadata } from '../shared/utilities/get-operation-metadata';
import { LoginResponseVm } from './models/view-models/login-response-vm.model';
import { LoginVm } from './models/view-models/login-vm.model';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { UpdateUserVm } from './models/view-models/update-user-vm.model';
import { JwtAuthGuard } from '../shared/guards/auth.guard';

@Controller('user')
@ApiTags(User.modelName)
export class UserController {

    SERVER_URL: string;
    private readonly logger = new Logger(UserController.name);

    constructor(
        private readonly userService: UserService,
        ) {
            this.SERVER_URL = 'localhost:3000';
        }

    @Post('register')
    @UsePipes(ValidationPipe)
    @ApiResponse({ status: HttpStatus.CREATED, type: UserVm })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
    @ApiOperation(GetOperationMetadata(User.modelName, 'Register'))
    async register(
        @Body() registerVm: RegisterVm,
        @Res() res,
        ): Promise<UserVm> {
        const errorResp = new ApiException();
        const { username, email } = registerVm;

        let existUsername;
        let existEmail;
        try {
            existUsername = await this.userService.findOne({ username });
            existEmail = await this.userService.findOne({ email });
        } catch (e) {
            // Mongo Error
            throw new InternalServerErrorException(e);
        }

        if (existUsername || existEmail) {
            errorResp.message = existUsername ? `El usuario ${username} ya existe. ` : '';
            errorResp.message = errorResp.message + (existEmail ? `El email ${email} se encuentra en uso. ` : '');
            res.status(400).send(errorResp);
            return;
        }

        const newUser = await this.userService.register(registerVm);
        const userVm: UserVm = {
            username: newUser.username,
            nick: newUser.nick,
            avatarUrl: newUser.avatarUrl,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            fullName: newUser.fullName,
            role: newUser.role,
        };

        res.send(userVm);
    }

    @Post('login')
    @UsePipes(ValidationPipe)
    @ApiResponse({ status: HttpStatus.CREATED, type: LoginResponseVm })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
    @ApiOperation(GetOperationMetadata(User.modelName, 'Login'))
    async login(@Body() loginVm: LoginVm): Promise<LoginResponseVm> {
        const fields = Object.keys(loginVm);

        fields.forEach(field => {
            if (!field) {
                throw new BadRequestException(`${field} is required`);
            }
        });

        return this.userService.login(loginVm);
    }

    @Post('avatar')
    @UseGuards(JwtAuthGuard)
    @UsePipes(ValidationPipe)
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    @ApiResponse({ status: HttpStatus.OK })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
    @ApiOperation(GetOperationMetadata(User.modelName, 'UploadAvatar'))
    @UseInterceptors(FileInterceptor('file',
        {
            storage: diskStorage({
                destination: './upload/avatars',
                filename: (req, file, cb) => {
                    const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                    return cb(null, `${randomName}${extname(file.originalname)}`);
                },
            }),
        },
    ),
    )
    async uploadAvatar(@Req() req, @UploadedFile() file) {
        const user: User = req.user;
        this.userService.setAvatar(user.username, file.filename);
    }

    @Get('avatar')
    @UseGuards(JwtAuthGuard)
    @ApiResponse({ status: HttpStatus.OK }) //  type: File
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
    @ApiOperation(GetOperationMetadata(User.modelName, 'ServeAvatar', null, 'Serve the logged-in user\'s avatar'))
    async serveAvatar(@Req() req, @Res() res): Promise<any> {
        const user: User = req.user;
        const avatarFile = user.avatarUrl;
        res.sendFile(avatarFile, { root: 'upload/avatars' });
    }

    @UseGuards(JwtAuthGuard)
    @Put()
    @ApiResponse({ status: HttpStatus.CREATED, type: UserVm })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ApiException })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, type: ApiException })
    @ApiOperation(GetOperationMetadata(User.modelName, 'UpdateUser'))
    async updateUser(
        @Req() req,
        @Res() res,
        @Body() updateVm: UpdateUserVm,
    ): Promise<UserVm> {
        const user: User = req.user;
        try {
            const parcialUpdate = new User();
            parcialUpdate.firstName = updateVm.firstName;
            parcialUpdate.lastName = updateVm.lastName;
            parcialUpdate.nick = updateVm.nick;
            parcialUpdate.email = updateVm.email;
            parcialUpdate.role = updateVm.role;
            const result = await this.userService.update(user._id, parcialUpdate);
            return res.send(result);
        } catch (err) {
            this.logger.error(err);
            throw new InternalServerErrorException(err);
        }
    }

}
