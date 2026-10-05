import { BaseEntity } from './BaseEntity';
import { ID } from '../types/common.types';
import { UserRole, UserStatus } from '../types/role.types';

/**
 * Interface biểu diễn người dùng trong hệ thống
 */
export interface IUser extends BaseEntity {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
}

/**
 * Lớp UserEntity triển khai các phương thức kiểm tra phân quyền và thông tin
 */
export class UserEntity implements IUser {
  public id: ID;
  public username: string;
  public password: string;
  public fullName: string;
  public role: UserRole;
  public status: UserStatus;
  public lastLoginAt?: Date;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(data: Partial<IUser> & { username: string; role: UserRole }) {
    this.id = data.id || '';
    this.username = data.username;
    this.password = data.password || '123456';
    this.fullName = data.fullName || data.username;
    this.role = data.role;
    this.status = data.status || UserStatus.ACTIVE;
    this.lastLoginAt = data.lastLoginAt ? new Date(data.lastLoginAt) : undefined;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
  }

  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  public isManager(): boolean {
    return this.role === UserRole.MANAGER || this.isAdmin();
  }

  public isStaff(): boolean {
    return this.role === UserRole.STAFF || this.isManager();
  }

  public hasPermission(requiredRole: UserRole): boolean {
    if (this.role === UserRole.ADMIN) return true;
    if (this.role === UserRole.MANAGER && requiredRole !== UserRole.ADMIN) return true;
    return this.role === requiredRole;
  }

  public isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  public toJSON(): Omit<IUser, 'password'> {
    return {
      id: this.id,
      username: this.username,
      fullName: this.fullName,
      role: this.role,
      status: this.status,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}
