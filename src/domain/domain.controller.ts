import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateDomainDto } from 'src/domain/dto/update-domain.dto';
import { User } from 'src/user/entities/user.entity';
import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { GetDomainsDto } from './dto/get-domains.dto';

@ApiTags('Domains')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('domains')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new domain' })
  @ApiResponse({ status: 201, description: 'Domain created successfully' })
  async create(
    @Body() createDomainDto: CreateDomainDto,
    @CurrentUser() user: User,
  ) {
    return await this.domainService.create(createDomainDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all domains' })
  @ApiResponse({ status: 200, description: 'List of domains' })
  async findAll(@Query() query: GetDomainsDto) {
    return await this.domainService.findWithPagination({ ...query });
  }

  @Get('/of-all-my-team')
  @ApiOperation({
    summary: 'Lấy tất cả domain thuộc những team mà tôi là leader',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách domain thuộc những team mà tôi là leader',
  })
  async findAllOfAllMyTeam(
    @Query() query: GetDomainsDto,
    @CurrentUser() user: User,
  ) {
    return await this.domainService.findAllOfMyTeam({
      ...query,
      userId: user.id,
    });
  }

  @Get('/assign-to-me')
  @ApiOperation({ summary: 'Get all domains assign to me' })
  @ApiResponse({ status: 200, description: 'List of domains assign to me' })
  async findDomainAssignToMeWithPagination(
    @Query() query: GetDomainsDto,
    @CurrentUser() user: User,
  ) {
    return await this.domainService.findDomainAssignToMeWithPagination(
      {
        ...query,
      },
      user,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get domain by ID' })
  @ApiResponse({ status: 200, description: 'Domain detail' })
  @ApiResponse({ status: 404, description: 'Domain not found' })
  async findOne(@Param('id') id: string) {
    return await this.domainService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update domain by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateDomainDto: UpdateDomainDto,
    @CurrentUser() user: User,
  ) {
    return await this.domainService.update(+id, updateDomainDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete domain by ID' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.domainService.remove(+id, user.id);
  }
}
