import { Role } from 'src/role/entities/role.entity';
import { USER_ROLE } from 'src/role/role.constant';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

export default class RoleSeeder implements Seeder {
  /**
   * Track seeder execution.
   *
   * Default: false
   */
  track = false;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const repository = dataSource.getRepository(Role);
    const roles = Object.values(USER_ROLE).map((role) => ({
      roleName: role,
    }));
    await repository.upsert(roles, ['roleName']);
  }
}
