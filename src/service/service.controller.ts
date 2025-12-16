import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetServiceDto } from 'src/service/dto/get-service.dto';
import { TYPE_PACK } from 'src/shared/constants/service.constant';
import { User } from 'src/user/entities/user.entity';
import { CreateServiceDto, ImportServiceDto } from './dto/create-service.dto';
import {
  UpdateMultipleServiceStatusDto,
  UpdateServiceDto,
} from './dto/update-service.dto';
import { ServiceService } from './service.service';

@ApiTags('Services')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service' })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @CurrentUser() user: User,
  ) {
    return await this.serviceService.create(createServiceDto, user.id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body() body: ImportServiceDto,
  ) {
    const userId = user.id;
    let services: any = [];
    if (body.typePack === TYPE_PACK.DOMAIN) {
      services = await this.serviceService.parseDomainExcel(file.buffer);
    }
    if (body.typePack === TYPE_PACK.PACK) {
      services = await this.serviceService.parsePackExcel(file.buffer);
    }

    return await this.serviceService.enqueueImportJob(services, userId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiResponse({ status: 200, description: 'List of services' })
  findAll(@Query() query: GetServiceDto, @CurrentUser() user: User) {
    return this.serviceService.findWithPagination({
      ...query,
      currentUser: user,
    });
  }

  @Get('/my-services')
  @ApiOperation({ summary: 'Get all my services' })
  @ApiResponse({ status: 200, description: 'List of my services' })
  findAllMyServices(@Query() query: GetServiceDto, @CurrentUser() user: User) {
    return this.serviceService.findWithPagination({
      ...query,
      currentUser: user,
      isMyService: true,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Service detail' })
  @ApiResponse({ status: 404, description: 'Service not found' })
  async findOne(@Param('id') id: string) {
    return await this.serviceService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    const data = await this.serviceService.update(+id, updateServiceDto);
    return { success: true, data };
  }

  @Patch('status/multiple')
  @ApiOperation({ summary: 'Update multiple service status' })
  async updateMultipleStatus(
    @Body() updateServiceDto: UpdateMultipleServiceStatusDto,
  ) {
    const data =
      await this.serviceService.updateMultipleStatus(updateServiceDto);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete service by ID' })
  async delete(@Param('id') id: string) {
    const data = await this.serviceService.remove(+id);
    return { success: true, data };
  }
}
