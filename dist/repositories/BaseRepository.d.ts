import { BaseEntity } from '../models/BaseEntity';
import { IRepository } from './IRepository';
import { ID } from '../types/common.types';
import { DatabaseConnection } from '../database/connection';
/**
 * Lớp trừu tượng BaseRepository triển khai IRepository kết hợp SQLite Database
 */
export declare abstract class BaseRepository<T extends BaseEntity> implements IRepository<T> {
    protected db: DatabaseConnection;
    protected abstract tableName: string;
    constructor(db?: DatabaseConnection);
    protected abstract mapRowToEntity(row: any): T;
    protected abstract mapEntityToRow(entity: T): Record<string, any>;
    getAll(): T[];
    getById(id: ID): T | undefined;
    create(item: T): T;
    update(id: ID, item: Partial<T>): T | undefined;
    delete(id: ID): boolean;
    exists(id: ID): boolean;
    count(): number;
    find(predicate: (item: T) => boolean): T[];
}
