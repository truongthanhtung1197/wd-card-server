import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { USER_ROLE } from 'src/role/role.constant';
import { USER_STATUS } from 'src/shared/constants/user.constant';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    example: USER_STATUS.ACTIVE,
    enum: USER_STATUS,
  })
  @IsEnum(USER_STATUS)
  @IsOptional()
  status?: USER_STATUS;

  // Fields chỉ admin/manager mới update được
  @ApiPropertyOptional({
    example: 1,
    description: 'Role ID - Only SUPER_ADMIN and MANAGER can update',
  })
  @IsNumber()
  @IsOptional()
  role?: number; // roleId

  @ApiPropertyOptional({
    example: 10.5,
    description: 'Only SUPER_ADMIN and MANAGER can update',
  })
  @IsNumber()
  @IsOptional()
  commissionPercent?: number;

  @ApiPropertyOptional({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
    description: 'Only SUPER_ADMIN and MANAGER can update (SALES_STATUS)',
  })
  @IsEnum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
  @IsOptional()
  salesStatus?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Only SUPER_ADMIN and MANAGER can update (customer.saleId)',
  })
  @IsNumber()
  @IsOptional()
  customerSaleId?: number;
}
