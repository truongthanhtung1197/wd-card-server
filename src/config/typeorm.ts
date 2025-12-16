import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

const config = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'root@1234',
  database: 'crm',
  // Rely on autoLoadEntities + TypeOrmModule.forFeature instead of scanning all dist entities
  autoLoadEntities: true,
  // Tạm thời bật synchronize để TypeORM tự tạo / cập nhật schema
  synchronize: true,
};

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);
