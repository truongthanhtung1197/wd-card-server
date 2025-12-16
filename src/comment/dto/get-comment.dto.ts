import { IntersectionType } from '@nestjs/swagger';
import {
  BaseQueryDto,
  PaginationQueryDto,
} from 'src/shared/dto/paginationQueryDto.dto';
export class GetCommentsDto extends IntersectionType(
  PaginationQueryDto,
  BaseQueryDto,
) {}
