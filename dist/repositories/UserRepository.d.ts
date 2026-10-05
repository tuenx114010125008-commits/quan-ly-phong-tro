import { BaseRepository } from './BaseRepository';
import { IUser } from '../models/User';
export declare class UserRepository extends BaseRepository<IUser> {
    protected tableName: string;
    constructor();
    private syncIdGenerator;
    protected mapRowToEntity(row: any): IUser;
    protected mapEntityToRow(entity: IUser): Record<string, any>;
    findByUsername(username: string): IUser | undefined;
}
