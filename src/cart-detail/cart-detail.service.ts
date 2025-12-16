import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UpdateCartDetailDto } from 'src/cart-detail/dto/update-cart-detail.dto';
import { Cart } from 'src/cart/entities/cart.entity';
import { Service } from 'src/service/entities/service.entity';
import { AbstractTransactionService } from 'src/shared/services/abstract-transaction.service';
import { User } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateCartDetailDto } from './dto/create-cart-detail.dto';
import { GetCartDetailsDto } from './dto/get-cart-detail.dto';
import { CartDetail } from './entities/cart-detail.entity';
@Injectable()
export class CartDetailService extends AbstractTransactionService {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    @InjectRepository(CartDetail)
    private cartDetailRepository: Repository<CartDetail>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {
    super(dataSource);
  }

  async findWithPagination(
    { page = 1, limit = 10 }: GetCartDetailsDto,
    currentUser: User,
  ) {
    const queryBuilder = this.cartDetailRepository
      .createQueryBuilder('cart_details')
      .leftJoinAndSelect('cart_details.service', 'service')
      .leftJoinAndSelect('service.complimentaries', 'complimentaries')
      .leftJoinAndSelect('service.user', 'serviceUser') // đổi alias tránh trùng
      .leftJoinAndSelect('cart_details.cart', 'cart')
      .leftJoinAndSelect('cart.user', 'cartUser') // đổi alias tránh trùng
      .orderBy('cart_details.createdAt', 'DESC')
      .where('cart.userId = :userId', { userId: currentUser.id })
      .skip((Number(page) - 1) * Number(limit))
      .take(limit);

    const [carts, total] = await queryBuilder.getManyAndCount();

    return {
      data: carts,
      total,
      limit,
      page,
    };
  }

  async create(createCartDetailDto: CreateCartDetailDto, currentUser: User) {
    return this.executeInTransaction(async (queryRunner, manager) => {
      const { serviceId } = createCartDetailDto;

      const service = await manager.findOneBy(Service, {
        id: serviceId,
      });

      if (!service) {
        throw new NotFoundException('Dịch vụ không tồn tại');
      }

      let cart = await manager.findOneBy(Cart, {
        userId: currentUser.id,
      });
      if (!cart) {
        cart = await manager.save(Cart, {
          userId: currentUser.id,
        });
      }

      return await manager.save(CartDetail, {
        ...createCartDetailDto,
        cartId: cart.id,
      });
    });
  }

  async update(id: number, data: UpdateCartDetailDto, requester: User) {
    const cartDetail = await this.cartDetailRepository.findOne({
      where: { id },
      relations: ['cart'],
    });
    if (!cartDetail) {
      throw new NotFoundException('Thao tác không hợp lệ');
    }
    if (cartDetail.cart.userId !== requester.id) {
      throw new NotFoundException('Thao tác không hợp lệ');
    }
    const updated = this.cartDetailRepository.merge(cartDetail, data);
    return this.cartDetailRepository.save(updated);
  }

  async remove(id: number, requester: User) {
    const cartDetail = await this.cartDetailRepository.findOne({
      where: { id },
      relations: ['cart'],
    });
    if (!cartDetail) {
      throw new NotFoundException('Thao tác không hợp lệ');
    }
    if (cartDetail.cart.userId !== requester.id) {
      throw new NotFoundException('Thao tác không hợp lệ');
    }
    await this.cartDetailRepository.delete(id);
    return {
      status: true,
      id: cartDetail.id,
      message: 'Giỏ hàng đã được xóa thành công',
    };
  }

  async findOne(id: number) {
    const cartDetail = await this.cartDetailRepository.findOne({
      where: { id },
      relations: ['service', 'service.user', 'service.complimentaries'],
    });
    if (!cartDetail) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }
    return cartDetail;
  }
}
