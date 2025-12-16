import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { ROLE } from 'src/role/role.constant';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowedRoles = this.reflector.getAllAndOverride<ROLE[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    // Resolve role name from different possible shapes
    let userRole: ROLE | undefined =
      user?.role?.roleName || user?.roleName || user?.role;

    // If role is missing on request, fetch from DB
    if (!userRole && user?.id) {
      const dbUser = await this.usersRepo.findOne({
        where: { id: Number(user.id) },
        relations: ['role'],
        select: ['id'],
      });
      userRole = (dbUser as any)?.role?.roleName as ROLE | undefined;
    }

    if (!userRole) return false;

    // Super admin bypass
    if (userRole === ROLE.SUPER_ADMIN) return true;

    return allowedRoles.includes(userRole as ROLE);
  }
}
