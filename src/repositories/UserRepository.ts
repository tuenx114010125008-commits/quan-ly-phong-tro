import { BaseRepository } from './BaseRepository';
import { IUser, UserEntity } from '../models/User';
import { UserRole, UserStatus } from '../types/role.types';
import { IdGenerator } from '../utils/IdGenerator';

export class UserRepository extends BaseRepository<IUser> {
  protected tableName: string = 'users';

  constructor() {
    super();
    this.syncIdGenerator();
  }

  private syncIdGenerator(): void {
    const users = this.getAll();
    IdGenerator.syncFromExistingIds('USR', users.map(u => u.id));
  }

  protected mapRowToEntity(row: any): IUser {
    return new UserEntity({
      id: row.id,
      username: row.username,
      password: row.password,
      fullName: row.full_name,
      role: row.role as UserRole,
      status: row.status as UserStatus,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }

  protected mapEntityToRow(entity: IUser): Record<string, any> {
    return {
      id: entity.id,
      username: entity.username,
      password: entity.password,
      full_name: entity.fullName,
      role: entity.role,
      status: entity.status,
      last_login_at: entity.lastLoginAt ? entity.lastLoginAt.toISOString() : null,
      created_at: entity.createdAt instanceof Date ? entity.createdAt.toISOString() : entity.createdAt,
      updated_at: entity.updatedAt instanceof Date ? entity.updatedAt.toISOString() : entity.updatedAt
    };
  }

  public findByUsername(username: string): IUser | undefined {
    const row = this.db.queryOne(`SELECT * FROM ${this.tableName} WHERE username = ?`, [username]);
    return row ? this.mapRowToEntity(row) : undefined;
  }
}
