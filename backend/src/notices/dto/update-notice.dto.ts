import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateNoticeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
