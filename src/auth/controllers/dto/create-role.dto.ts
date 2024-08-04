import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { Role } from './../../enums/roles.enum';

export class CreateRoleDto {
    @ApiPropertyOptional({ example: 'admin' })
    @IsNotEmpty()
    @MaxLength(40)
    @IsEnum(Role)
    role: string;
}

