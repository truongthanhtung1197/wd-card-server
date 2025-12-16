import { PartialType } from '@nestjs/mapped-types';
import { CreateComplimentaryDto } from './create-complimentary.dto';

export class UpdateComplimentaryDto extends PartialType(
  CreateComplimentaryDto,
) {}
