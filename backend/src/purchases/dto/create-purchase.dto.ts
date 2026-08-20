import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum PackageType {
  ACTIVATION = 'ACTIVATION',
  PREMIUM = 'PREMIUM',
  INVESTMENT = 'INVESTMENT',
}

export class CreatePurchaseDto {
  @IsString()
  @IsNotEmpty()
  target_user_code: string;

  @IsEnum(PackageType)
  package_type: PackageType;

  @IsString()
  @IsOptional()
  investment_plan_id?: string;

  @IsString()
  @IsOptional()
  referrer_code?: string;
}
