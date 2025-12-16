import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import {
  SERVICE_FIELD_TYPE,
  SERVICE_STATUS,
  SERVICE_TYPE,
  TYPE_PACK,
} from 'src/shared/constants/service.constant';

export class CreateServiceDto {
  @ApiProperty({ example: 'Service Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: SERVICE_TYPE.BACKLINK })
  @IsEnum(SERVICE_TYPE)
  @IsOptional()
  type: SERVICE_TYPE;

  @ApiProperty({ example: TYPE_PACK.DOMAIN })
  @IsEnum(TYPE_PACK)
  @IsNotEmpty()
  typePack: TYPE_PACK;

  @ApiProperty({ example: 100000, default: 0 })
  @IsOptional()
  @IsNumber()
  price: number;

  @ApiProperty({ example: 'Service Description', required: false })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 'Service Note',
    required: false,
    nullable: true,
    default: null,
  })
  @IsString()
  @IsOptional()
  note: string;

  @ApiProperty({ example: SERVICE_STATUS.PENDING })
  @IsEnum(SERVICE_STATUS)
  @IsOptional()
  status: SERVICE_STATUS;

  @ApiProperty({ example: SERVICE_FIELD_TYPE.GENERAL })
  @IsEnum(SERVICE_FIELD_TYPE)
  @IsOptional()
  fieldType: SERVICE_FIELD_TYPE;

  @ApiProperty({ example: 'https://example.com', required: false })
  @IsString()
  @IsOptional()
  urlDemo: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isIndex: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isShow: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isSaleTextLink: boolean;

  @ApiProperty({ example: 100000, required: false })
  @IsNumber()
  @IsOptional()
  textLinkPrice: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  textLinkDuration: number;

  @ApiProperty({ example: 'Text Link Note', required: false })
  @IsString()
  @IsOptional()
  textLinkNote: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isFollowTextLink: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isHomeTextLink: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isFooterTextLink: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isSaleGuestPost: boolean;

  @ApiProperty({ example: 100000, required: false })
  @IsNumber()
  @IsOptional()
  guestPostPrice: number;

  @ApiProperty({ example: 'Guest Post Note', required: false })
  @IsString()
  @IsOptional()
  guestPostNote: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isFollowGuestPost: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isIndexGuestPost: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isSaleBanner: boolean;

  @ApiProperty({ example: 100000, required: false })
  @IsNumber()
  @IsOptional()
  bannerPrice: number;

  @ApiProperty({ example: 100000, required: false })
  @IsNumber()
  @IsOptional()
  bannerDuration: number;

  @ApiProperty({
    example: ['Complimentary 1', 'Complimentary 2'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  complimentaries?: string[];

  @ApiPropertyOptional({ example: 100000, required: false })
  @IsNumber()
  @IsOptional()
  refDomain: number;

  @ApiPropertyOptional({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  dr: number;

  @ApiPropertyOptional({ example: 100000, required: false })
  @IsNumber()
  @IsOptional()
  organicTraffic: number;

  @ApiPropertyOptional({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  discountPackService: number;

  @ApiPropertyOptional({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  discountTextLinkService: number;

  @ApiPropertyOptional({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  discountGuestPostService: number;

  @ApiPropertyOptional({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  discountBannerService: number;
}

export class ImportServiceDto {
  @ApiProperty({
    description: 'PACK',
  })
  @IsEnum(TYPE_PACK)
  @IsNotEmpty()
  typePack: TYPE_PACK;
}
