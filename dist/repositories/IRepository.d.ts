import { BaseEntity } from '../models/BaseEntity';
import { ID } from '../types/common.types';
/**
 * Generic Repository Interface
 */
export interface IRepository<T extends BaseEntity> {
    getAll(): T[];
    getById(id: ID): T | undefined;
    create(item: T): T;
    update(id: ID, item: Partial<T>): T | undefined;
    delete(id: ID): boolean;
    exists(id: ID): boolean;
    count(): number;
    find(predicate: (item: T) => boolean): T[];
}
