import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';

config();

export const dataSourceOptions = (): DataSourceOptions & SeederOptions => {
  const config = new ConfigService();
  return {
    type: 'mysql',
    host: config.get('DB_HOST'),
    port: config.get('DB_PORT'),
    username: config.get('DB_USERNAME'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    entities: ['dist/**/*.entity{.ts,.js}'],
    migrations: ['dist/db/migrations/*{.ts,.js}'],
    seeds: ['dist/db/seeds/**/*{.ts,.js}'],
    synchronize: false,
    seedTracking: false,
  };
};

export default new DataSource(dataSourceOptions());
