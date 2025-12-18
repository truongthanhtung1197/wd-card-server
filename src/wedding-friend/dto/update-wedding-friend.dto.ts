import { PartialType } from '@nestjs/swagger';
import { CreateWeddingFriendDto } from './create-wedding-friend.dto';

export class UpdateWeddingFriendDto extends PartialType(
  CreateWeddingFriendDto,
) {}

