import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { Role } from 'src/role/entities/role.entity';
import { ROLE } from 'src/role/role.constant';
import { User } from 'src/user/entities/user.entity';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

config();

export default class UserSeeder implements Seeder {
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
    const userRepo = dataSource.getRepository(User);

    const exists = await userRepo.findOneBy({
      email: 'superadmin@crm.69vn',
    });

    if (!exists) {
      const jwtSecretKey = process.env.JWT_SECRET_KEY;
      if (!jwtSecretKey) {
        throw new Error(
          'JWT_SECRET_KEY is not defined in environment variables',
        );
      }

      // Tạo password từ JWT_SECRET_KEY
      const plainPassword = `superAdmin`;
      const passwordHash = await bcrypt.hash(plainPassword, 10);

      await userRepo.insert({
        email: 'superadmin@crm.69vn',
        passwordHash,
        status: undefined,
      } as any);
    }
  }
}
