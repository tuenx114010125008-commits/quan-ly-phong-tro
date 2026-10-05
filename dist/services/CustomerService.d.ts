import { CustomerRepository } from '../repositories/CustomerRepository';
import { ICustomer } from '../models/Customer';
import { ApiResponse } from '../types/result.types';
import { CustomerStatus, ID } from '../types/common.types';
export declare class CustomerService {
    private customerRepo;
    constructor(customerRepo?: CustomerRepository);
    getAllCustomers(): ICustomer[];
    getCustomerById(id: ID): ICustomer | undefined;
    getCustomerByCCCD(cccd: string): ICustomer | undefined;
    getCustomerByPhone(phone: string): ICustomer | undefined;
    addCustomer(data: {
        fullName: string;
        dateOfBirth: string;
        cccd: string;
        phone: string;
        hometown: string;
        vehicle?: string;
    }): ApiResponse<ICustomer>;
    updateCustomer(id: ID, data: Partial<ICustomer>): ApiResponse<ICustomer>;
    deleteCustomer(id: ID): ApiResponse<boolean>;
    updateStatus(id: ID, status: CustomerStatus): ApiResponse<ICustomer>;
    searchCustomers(keyword: string): ICustomer[];
    filterCustomers(status?: CustomerStatus): ICustomer[];
}
