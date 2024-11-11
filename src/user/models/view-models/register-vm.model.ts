import { LoginVm } from './login-vm.model';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty } from 'class-validator';
import { UserRole } from '../user-role.enum';

export class RegisterVm extends LoginVm {
    @ApiProperty()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @ApiPropertyOptional()
    firstName?: string;

    @IsOptional()
    @ApiPropertyOptional()
    lastName?: string;

    @IsOptional()
    @ApiPropertyOptional()
    nick?: string;

    @IsOptional()
    @ApiPropertyOptional()
    avatarUrl?: string;

    @IsOptional()
    @ApiPropertyOptional()
    role?: UserRole;
}
