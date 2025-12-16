import { IntersectionType } from '@nestjs/swagger';
import { PaginationQueryDto } from 'src/shared/dto/paginationQueryDto.dto';

export class GetCartDetailsDto extends IntersectionType(PaginationQueryDto) {}
