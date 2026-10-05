import { ServiceRepository } from '../repositories/ServiceRepository';
import { IService } from '../models/Service';
import { ApiResponse } from '../types/result.types';
import { ServiceUnit, ID } from '../types/common.types';
export declare class ServiceService {
    private serviceRepo;
    constructor(serviceRepo?: ServiceRepository);
    getAllServices(): IService[];
    getActiveServices(): IService[];
    getServiceById(id: ID): IService | undefined;
    getServiceByName(name: string): IService | undefined;
    addService(data: {
        name: string;
        unit: ServiceUnit;
        unitPrice: number;
        description?: string;
    }): ApiResponse<IService>;
    updatePrice(id: ID, newPrice: number): ApiResponse<IService>;
    updateService(id: ID, data: Partial<IService>): ApiResponse<IService>;
    toggleStatus(id: ID): ApiResponse<IService>;
    deleteService(id: ID): ApiResponse<boolean>;
    searchServices(keyword: string): IService[];
}
