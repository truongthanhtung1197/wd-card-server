import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { Role } from 'src/role/entities/role.entity';
import { USER_ROLE } from 'src/role/role.constant';
import { UserRole } from 'src/user-role/entities/user-role.entity';
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
    const userRoleRepo = dataSource.getRepository(UserRole);
    const roleRepo = dataSource.getRepository(Role);

    const exists = await userRepo.findOneBy({
      email: 'truongthanhtung1197@gmail.com',
    });

    // Tìm role SUPER_ADMIN từ bảng roles
    const superAdminRole = await roleRepo.findOneBy({
      roleName: USER_ROLE.SUPER_ADMIN,
    });

    if (!superAdminRole) {
      throw new Error('SUPER_ADMIN role not found in roles table');
    }

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

      const result = await userRepo.insert({
        email: 'truongthanhtung1197@gmail.com',
        passwordHash,
        status: undefined,
      } as any);

      const userId = result.identifiers[0].id;

      // Tạo user role với SUPER_ADMIN roleId
      const userRoleExists = await userRoleRepo.findOneBy({
        userId,
        roleId: superAdminRole.id,
      });

      if (!userRoleExists) {
        await userRoleRepo.insert({
          userId,
          roleId: superAdminRole.id,
        });
      }
    } else {
      // Nếu user đã tồn tại, kiểm tra và tạo role nếu chưa có
      const userRoleExists = await userRoleRepo.findOneBy({
        userId: exists.id,
        roleId: superAdminRole.id,
      });

      if (!userRoleExists) {
        await userRoleRepo.insert({
          userId: exists.id,
          roleId: superAdminRole.id,
        });
      }
    }
  }
}
