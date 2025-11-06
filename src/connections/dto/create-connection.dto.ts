import { IsString, IsOptional } from 'class-validator';

export class CreateConnectionDto {
  @IsString()
  @IsOptional()
  institutionId?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;
}
