import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'overdev@example.com', description: 'User email address' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'OverdevStrongPassword123', description: 'Password with at least 8 characters' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ example: 'Overdev', description: 'First name of the user' })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiPropertyOptional({ example: 'Overdev', description: 'Last name of the user' })
  @IsOptional()
  @IsString()
  lastname?: string;
}
