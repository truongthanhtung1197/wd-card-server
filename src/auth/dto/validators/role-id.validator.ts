import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from 'src/role/entities/role.entity';
import { USER_ROLE } from 'src/role/role.constant';

@ValidatorConstraint({ name: 'isValidRoleId', async: true })
@Injectable()
export class IsValidRoleIdConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async validate(roleId: any, args: ValidationArguments): Promise<boolean> {
    if (typeof roleId !== 'number') {
      return false;
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId },
    });

    if (!role) {
      return false;
    }

    // Store roleName in the object for ValidateIf to use
    const object = args.object as any;
    object._roleName = role.roleName;

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid roleId';
  }
}

export function IsValidRoleId(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidRoleIdConstraint,
    });
  };
}

