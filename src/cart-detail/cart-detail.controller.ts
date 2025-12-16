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
import { CartDetailService } from 'src/cart-detail/cart-detail.service';
import { User } from 'src/user/entities/user.entity';
import { CreateCartDetailDto } from './dto/create-cart-detail.dto';
import { GetCartDetailsDto } from './dto/get-cart-detail.dto';
import { UpdateCartDetailDto } from './dto/update-cart-detail.dto';
@ApiTags('Cart Details')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard)
@Controller('cart-details')
export class CartDetailController {
  constructor(private readonly cartDetailService: CartDetailService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new cart detail' })
  @ApiResponse({ status: 201, description: 'Cart detail created successfully' })
  async create(
    @Body() createCartDetailDto: CreateCartDetailDto,
    @CurrentUser() user: User,
  ) {
    return await this.cartDetailService.create(createCartDetailDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cart details' })
  @ApiResponse({ status: 200, description: 'List of cart details' })
  async findAll(@Query() query: GetCartDetailsDto, @CurrentUser() user: User) {
    return await this.cartDetailService.findWithPagination({ ...query }, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cart detail by ID' })
  @ApiResponse({ status: 200, description: 'Cart detail' })
  @ApiResponse({ status: 404, description: 'Cart detail not found' })
  async findOne(@Param('id') id: string) {
    return await this.cartDetailService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cart detail by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateCartDetailDto: UpdateCartDetailDto,
    @CurrentUser() user: User,
  ) {
    return await this.cartDetailService.update(+id, updateCartDetailDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cart detail by ID' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    return await this.cartDetailService.remove(+id, user);
  }
}
