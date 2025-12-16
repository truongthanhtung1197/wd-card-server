import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Package } from 'src/package/entities/package.entity';
import { User } from 'src/user/entities/user.entity';
import { PackageFeature } from './entities/package-feature.entity';
import { PackageFeatureController } from './package-feature.controller';
import { PackageFeatureService } from './package-feature.service';

@Module({
  imports: [TypeOrmModule.forFeature([PackageFeature, Package, User])],
  controllers: [PackageFeatureController],
  providers: [PackageFeatureService, RolesGuard],
  exports: [PackageFeatureService],
})
export class PackageFeatureModule {}
