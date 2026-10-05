import { BaseRepository } from './BaseRepository';
import { ICustomer } from '../models/Customer';
export declare class CustomerRepository extends BaseRepository<ICustomer> {
    protected tableName: string;
    constructor();
    private syncIdGenerator;
    protected mapRowToEntity(row: any): ICustomer;
    protected mapEntityToRow(entity: ICustomer): Record<string, any>;
    findByCCCD(cccd: string): ICustomer | undefined;
    findByPhone(phone: string): ICustomer | undefined;
}
