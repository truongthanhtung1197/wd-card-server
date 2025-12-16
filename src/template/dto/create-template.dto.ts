import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TEMPLATE_STATUS } from '../entities/template.entity';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Classic Wedding' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'https://cdn.example.com/templates/classic.png' })
  @IsString()
  @IsNotEmpty()
  previewImage: string;

  @ApiPropertyOptional({ enum: TEMPLATE_STATUS, example: TEMPLATE_STATUS.ACTIVE })
  @IsEnum(TEMPLATE_STATUS)
  @IsOptional()
  status?: TEMPLATE_STATUS;
}


