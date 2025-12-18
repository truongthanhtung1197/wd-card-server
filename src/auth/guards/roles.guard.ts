import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { USER_ROLE } from 'src/role/role.constant';
import { UserRole } from 'src/user-role/entities/user-role.entity';
import { Repository } from 'typeorm';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.getAllAndOverride<USER_ROLE[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are specified, allow access
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user || !user.id) return false;

    // Fetch user roles from UserRole table with role relation
    const userRoles = await this.userRoleRepository.find({
      where: { userId: user.id },
      relations: ['role'],
    });

    if (!userRoles || userRoles.length === 0) return false;

    // Extract roleName values from Role entities
    const userRoleValues = userRoles
      .map((ur) => ur.role?.roleName)
      .filter((roleName): roleName is USER_ROLE => roleName !== undefined);

    // Super admin bypass - if user has SUPER_ADMIN role, allow access
    if (userRoleValues.includes(USER_ROLE.SUPER_ADMIN)) return true;

    // Check if user has any of the allowed roles
    return userRoleValues.some((role) => allowedRoles.includes(role));
  }
}
