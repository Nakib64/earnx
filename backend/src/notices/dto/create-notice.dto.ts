import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateNoticeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  link_url?: string;

  @IsInt()
  @IsOptional()
  serial_number?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
