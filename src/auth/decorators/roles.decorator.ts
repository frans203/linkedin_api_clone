import { SetMetadata } from '@nestjs/common';
import { Role } from '../models/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...args: Role[]) => SetMetadata(ROLES_KEY, args);
