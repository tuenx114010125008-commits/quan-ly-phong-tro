import { CustomerRepository } from '../repositories/CustomerRepository';
import { ICustomer, CustomerEntity } from '../models/Customer';
import { ApiResponse, successResponse, errorResponse } from '../types/result.types';
import { CustomerStatus, ID } from '../types/common.types';
import { IdGenerator } from '../utils/IdGenerator';
import { Validator } from '../utils/Validator';
import { Logger } from '../utils/Logger';

export class CustomerService {
  private customerRepo: CustomerRepository;

  constructor(customerRepo?: CustomerRepository) {
    this.customerRepo = customerRepo || new CustomerRepository();
  }

  public getAllCustomers(): ICustomer[] {
    return this.customerRepo.getAll();
  }

  public getCustomerById(id: ID): ICustomer | undefined {
    return this.customerRepo.getById(id);
  }

  public getCustomerByCCCD(cccd: string): ICustomer | undefined {
    return this.customerRepo.findByCCCD(cccd.trim());
  }

  public getCustomerByPhone(phone: string): ICustomer | undefined {
    return this.customerRepo.findByPhone(phone.trim());
  }

  public addCustomer(data: {
    fullName: string;
    dateOfBirth: string;
    cccd: string;
    phone: string;
    hometown: string;
    vehicle?: string;
  }): ApiResponse<ICustomer> {
    const rules = [
      { condition: Validator.isValidFullName(data.fullName), message: 'Họ tên chỉ được chứa chữ cái và tối đa 50 ký tự.' },
      { condition: Validator.isValidDate(data.dateOfBirth), message: 'Ngày sinh phải có định dạng YYYY-MM-DD hợp lệ.' },
      { condition: Validator.isDateInPast(data.dateOfBirth), message: 'Ngày sinh phải ở trong quá khứ.' },
      { condition: Validator.isValidCCCD(data.cccd), message: 'Số CCCD phải gồm đúng 12 chữ số.' },
      { condition: Validator.isValidPhone(data.phone), message: 'Số điện thoại phải gồm 10 chữ số (bắt đầu bằng 0).' },
      { condition: Validator.isNotEmpty(data.hometown), message: 'Quê quán không được để trống.' }
    ];

    const validation = Validator.validate(rules);
    if (!validation.isValid) {
      return errorResponse('Thông tin khách hàng không hợp lệ.', validation.errors);
    }

    // Kiểm tra trùng CCCD
    if (this.customerRepo.findByCCCD(data.cccd.trim())) {
      return errorResponse(`Số CCCD "${data.cccd}" đã tồn tại trong hệ thống.`);
    }

    const newCustomer = new CustomerEntity({
      id: IdGenerator.generate('KH'),
      fullName: data.fullName.trim(),
      dateOfBirth: data.dateOfBirth.trim(),
      cccd: data.cccd.trim(),
      phone: data.phone.trim(),
      hometown: data.hometown.trim(),
      vehicle: data.vehicle?.trim(),
      status: CustomerStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.customerRepo.create(newCustomer);
    Logger.info(`Thêm khách hàng: ${newCustomer.fullName} (CCCD: ${newCustomer.cccd}, ID: ${newCustomer.id}).`, 'CustomerService');
    return successResponse(newCustomer, `Thêm khách hàng "${newCustomer.fullName}" thành công.`);
  }

  public updateCustomer(id: ID, data: Partial<ICustomer>): ApiResponse<ICustomer> {
    const existing = this.customerRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy khách hàng với mã ID: ${id}`);
    }

    if (data.fullName && !Validator.isValidFullName(data.fullName)) {
      return errorResponse('Họ tên không hợp lệ.');
    }

    if (data.cccd && data.cccd !== existing.cccd) {
      if (!Validator.isValidCCCD(data.cccd)) {
        return errorResponse('Số CCCD phải gồm đúng 12 chữ số.');
      }
      const duplicate = this.customerRepo.findByCCCD(data.cccd.trim());
      if (duplicate && duplicate.id !== id) {
        return errorResponse(`Số CCCD "${data.cccd}" đã thuộc về khách hàng khác.`);
      }
    }

    if (data.phone && !Validator.isValidPhone(data.phone)) {
      return errorResponse('Số điện thoại phải gồm 10 chữ số hợp lệ.');
    }

    const updated = this.customerRepo.update(id, data);
    Logger.info(`Cập nhật thông tin khách hàng ID: ${id}.`, 'CustomerService');
    return successResponse(updated!, 'Cập nhật thông tin khách hàng thành công.');
  }

  public deleteCustomer(id: ID): ApiResponse<boolean> {
    const existing = this.customerRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy khách hàng với mã ID: ${id}`);
    }

    this.customerRepo.delete(id);
    Logger.info(`Đã xóa khách hàng: ${existing.fullName} (ID: ${id}).`, 'CustomerService');
    return successResponse(true, `Đã xóa khách hàng "${existing.fullName}" thành công.`);
  }

  public updateStatus(id: ID, status: CustomerStatus): ApiResponse<ICustomer> {
    const existing = this.customerRepo.getById(id);
    if (!existing) {
      return errorResponse(`Không tìm thấy khách hàng với mã ID: ${id}`);
    }

    const updated = this.customerRepo.update(id, { status });
    Logger.info(`Cập nhật trạng thái khách hàng ${existing.fullName} thành ${status}.`, 'CustomerService');
    return successResponse(updated!, `Đã cập nhật trạng thái khách hàng thành ${status}.`);
  }

  public searchCustomers(keyword: string): ICustomer[] {
    const term = keyword.trim().toLowerCase();
    if (!term) return this.getAllCustomers();

    return this.customerRepo.find(c => 
      c.fullName.toLowerCase().includes(term) ||
      c.cccd.includes(term) ||
      c.phone.includes(term) ||
      c.hometown.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term)
    );
  }

  public filterCustomers(status?: CustomerStatus): ICustomer[] {
    if (!status) return this.getAllCustomers();
    return this.customerRepo.find(c => c.status === status);
  }
}
