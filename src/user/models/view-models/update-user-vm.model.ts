import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { UserRole } from '../user-role.enum';

export class UpdateUserVm {

    @ApiPropertyOptional()
    @IsOptional()
    nick?: string;

    @ApiPropertyOptional()
    @IsOptional()
    firstName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    lastName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    role?: UserRole;

}
