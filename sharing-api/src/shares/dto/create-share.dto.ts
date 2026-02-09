import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateShareDto {
  @IsOptional()
  @IsIn(['readonly', 'readwrite'])
  mode?: 'readonly' | 'readwrite';
}
