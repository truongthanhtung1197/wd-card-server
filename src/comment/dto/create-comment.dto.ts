import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Content', nullable: false })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  parentId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  fileId: number;
}
