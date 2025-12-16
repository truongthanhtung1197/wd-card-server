import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Cart } from './entities/cart.entity';
@Injectable()
export class CartService {
  constructor() {}

  async create(userId: number, manager: EntityManager) {
    return await manager.save(Cart, {
      userId,
    });
  }
}
