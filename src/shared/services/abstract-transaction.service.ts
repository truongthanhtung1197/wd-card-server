import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export abstract class AbstractTransactionService {
  constructor(protected readonly dataSource: DataSource) {}

  protected async executeInTransaction<T>(
    operation: (queryRunner: QueryRunner, manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner, queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error?.message);
    } finally {
      await queryRunner.release();
    }
  }
}
