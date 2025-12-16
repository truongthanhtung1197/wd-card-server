import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { ROLE } from 'src/role/role.constant';
import { Role } from 'src/role/entities/role.entity';

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
    const roles = Object.values(ROLE).map((role) => ({
      roleName: role,
    }));
    await repository.upsert(roles, ['roleName']);
  }
}
