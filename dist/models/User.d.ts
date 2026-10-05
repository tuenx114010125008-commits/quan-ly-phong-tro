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
export declare class UserEntity implements IUser {
    id: ID;
    username: string;
    password: string;
    fullName: string;
    role: UserRole;
    status: UserStatus;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    constructor(data: Partial<IUser> & {
        username: string;
        role: UserRole;
    });
    isAdmin(): boolean;
    isManager(): boolean;
    isStaff(): boolean;
    hasPermission(requiredRole: UserRole): boolean;
    isActive(): boolean;
    toJSON(): Omit<IUser, 'password'>;
}
