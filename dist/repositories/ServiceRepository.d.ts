import { BaseRepository } from './BaseRepository';
import { IService } from '../models/Service';
export declare class ServiceRepository extends BaseRepository<IService> {
    protected tableName: string;
    constructor();
    private syncIdGenerator;
    protected mapRowToEntity(row: any): IService;
    protected mapEntityToRow(entity: IService): Record<string, any>;
    findByName(name: string): IService | undefined;
}
