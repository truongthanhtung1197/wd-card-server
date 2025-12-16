import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetStatisticDto } from 'src/statistic/dto/get-statistic.dto';
import { User } from 'src/user/entities/user.entity';
import { StatisticService } from './statistic.service';

@ApiTags('Statistical')
@Controller('statistic')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post()
  findAll(@Body() getStatisticDto: GetStatisticDto, @CurrentUser() user: User) {
    return this.statisticService.findAll(getStatisticDto, user?.id);
  }

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard)
  @Post('2')
  statistic2(
    @Body() getStatisticDto: GetStatisticDto,
    @CurrentUser() user: User,
  ) {
    return this.statisticService.statistic2(getStatisticDto, user?.id);
  }
}
