import { UserEntity } from '../models/User';
import { UserRole } from '../types/role.types';
import { Logger } from '../utils/Logger';

export enum ActionType {
  VIEW_ROOM = 'VIEW_ROOM',
  MANAGE_ROOM = 'MANAGE_ROOM',
  VIEW_CUSTOMER = 'VIEW_CUSTOMER',
  MANAGE_CUSTOMER = 'MANAGE_CUSTOMER',
  MANAGE_SERVICE = 'MANAGE_SERVICE',
  CREATE_CONTRACT = 'CREATE_CONTRACT',
  MANAGE_CONTRACT = 'MANAGE_CONTRACT',
  CREATE_INVOICE = 'CREATE_INVOICE',
  PAY_INVOICE = 'PAY_INVOICE',
  VIEW_REPORT = 'VIEW_REPORT',
  EXPORT_REPORT = 'EXPORT_REPORT',
  MANAGE_USER = 'MANAGE_USER'
}

/**
 * Service kiểm tra phân quyền người dùng theo chức năng
 */
export class PermissionService {
  public static canPerform(user: UserEntity | null, action: ActionType): boolean {
    if (!user) return false;

    switch (action) {
      case ActionType.MANAGE_USER:
      case ActionType.EXPORT_REPORT:
        return user.role === UserRole.ADMIN;

      case ActionType.MANAGE_ROOM:
      case ActionType.MANAGE_CUSTOMER:
      case ActionType.MANAGE_SERVICE:
      case ActionType.CREATE_CONTRACT:
      case ActionType.MANAGE_CONTRACT:
      case ActionType.VIEW_REPORT:
        return user.role === UserRole.ADMIN || user.role === UserRole.MANAGER;

      case ActionType.VIEW_ROOM:
      case ActionType.VIEW_CUSTOMER:
      case ActionType.CREATE_INVOICE:
      case ActionType.PAY_INVOICE:
        return true; // Tất cả ADMIN, MANAGER, STAFF đều được thao tác

      default:
        return false;
    }
  }

  public static checkPermission(user: UserEntity | null, action: ActionType): void {
    if (!this.canPerform(user, action)) {
      Logger.warn(`Quyền bị từ chối: Người dùng "${user?.username || 'Guest'}" không có quyền thực hiện [${action}].`, 'PermissionService');
      throw new Error(`Bạn không có quyền thực hiện thao tác này (${action}).`);
    }
  }
}
