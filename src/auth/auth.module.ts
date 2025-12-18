import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from 'src/customer/customer.module';
import { Role } from 'src/role/entities/role.entity';
import { SalesModule } from 'src/sales/sales.module';
import { User } from 'src/user/entities/user.entity';
import { UserRoleModule } from 'src/user-role/user-role.module';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { IsValidRoleIdConstraint } from './dto/validators/role-id.validator';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserRole]),
    UserModule,
    UserRoleModule,
    CustomerModule,
    SalesModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET_KEY'),
          signOptions: {
            expiresIn: config.get<any>('JWT_EXPIRATION_TIME') || '1d',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RolesGuard,
    IsValidRoleIdConstraint,
  ],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
