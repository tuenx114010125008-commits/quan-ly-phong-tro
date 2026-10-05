"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const CustomerRepository_1 = require("../repositories/CustomerRepository");
const Customer_1 = require("../models/Customer");
const result_types_1 = require("../types/result.types");
const common_types_1 = require("../types/common.types");
const IdGenerator_1 = require("../utils/IdGenerator");
const Validator_1 = require("../utils/Validator");
const Logger_1 = require("../utils/Logger");
class CustomerService {
    customerRepo;
    constructor(customerRepo) {
        this.customerRepo = customerRepo || new CustomerRepository_1.CustomerRepository();
    }
    getAllCustomers() {
        return this.customerRepo.getAll();
    }
    getCustomerById(id) {
        return this.customerRepo.getById(id);
    }
    getCustomerByCCCD(cccd) {
        return this.customerRepo.findByCCCD(cccd.trim());
    }
    getCustomerByPhone(phone) {
        return this.customerRepo.findByPhone(phone.trim());
    }
    addCustomer(data) {
        const rules = [
            { condition: Validator_1.Validator.isValidFullName(data.fullName), message: 'Họ tên chỉ được chứa chữ cái và tối đa 50 ký tự.' },
            { condition: Validator_1.Validator.isValidDate(data.dateOfBirth), message: 'Ngày sinh phải có định dạng YYYY-MM-DD hợp lệ.' },
            { condition: Validator_1.Validator.isDateInPast(data.dateOfBirth), message: 'Ngày sinh phải ở trong quá khứ.' },
            { condition: Validator_1.Validator.isValidCCCD(data.cccd), message: 'Số CCCD phải gồm đúng 12 chữ số.' },
            { condition: Validator_1.Validator.isValidPhone(data.phone), message: 'Số điện thoại phải gồm 10 chữ số (bắt đầu bằng 0).' },
            { condition: Validator_1.Validator.isNotEmpty(data.hometown), message: 'Quê quán không được để trống.' }
        ];
        const validation = Validator_1.Validator.validate(rules);
        if (!validation.isValid) {
            return (0, result_types_1.errorResponse)('Thông tin khách hàng không hợp lệ.', validation.errors);
        }
        // Kiểm tra trùng CCCD
        if (this.customerRepo.findByCCCD(data.cccd.trim())) {
            return (0, result_types_1.errorResponse)(`Số CCCD "${data.cccd}" đã tồn tại trong hệ thống.`);
        }
        const newCustomer = new Customer_1.CustomerEntity({
            id: IdGenerator_1.IdGenerator.generate('KH'),
            fullName: data.fullName.trim(),
            dateOfBirth: data.dateOfBirth.trim(),
            cccd: data.cccd.trim(),
            phone: data.phone.trim(),
            hometown: data.hometown.trim(),
            vehicle: data.vehicle?.trim(),
            status: common_types_1.CustomerStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        this.customerRepo.create(newCustomer);
        Logger_1.Logger.info(`Thêm khách hàng: ${newCustomer.fullName} (CCCD: ${newCustomer.cccd}, ID: ${newCustomer.id}).`, 'CustomerService');
        return (0, result_types_1.successResponse)(newCustomer, `Thêm khách hàng "${newCustomer.fullName}" thành công.`);
    }
    updateCustomer(id, data) {
        const existing = this.customerRepo.getById(id);
        if (!existing) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy khách hàng với mã ID: ${id}`);
        }
        if (data.fullName && !Validator_1.Validator.isValidFullName(data.fullName)) {
            return (0, result_types_1.errorResponse)('Họ tên không hợp lệ.');
        }
        if (data.cccd && data.cccd !== existing.cccd) {
            if (!Validator_1.Validator.isValidCCCD(data.cccd)) {
                return (0, result_types_1.errorResponse)('Số CCCD phải gồm đúng 12 chữ số.');
            }
            const duplicate = this.customerRepo.findByCCCD(data.cccd.trim());
            if (duplicate && duplicate.id !== id) {
                return (0, result_types_1.errorResponse)(`Số CCCD "${data.cccd}" đã thuộc về khách hàng khác.`);
            }
        }
        if (data.phone && !Validator_1.Validator.isValidPhone(data.phone)) {
            return (0, result_types_1.errorResponse)('Số điện thoại phải gồm 10 chữ số hợp lệ.');
        }
        const updated = this.customerRepo.update(id, data);
        Logger_1.Logger.info(`Cập nhật thông tin khách hàng ID: ${id}.`, 'CustomerService');
        return (0, result_types_1.successResponse)(updated, 'Cập nhật thông tin khách hàng thành công.');
    }
    deleteCustomer(id) {
        const existing = this.customerRepo.getById(id);
        if (!existing) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy khách hàng với mã ID: ${id}`);
        }
        this.customerRepo.delete(id);
        Logger_1.Logger.info(`Đã xóa khách hàng: ${existing.fullName} (ID: ${id}).`, 'CustomerService');
        return (0, result_types_1.successResponse)(true, `Đã xóa khách hàng "${existing.fullName}" thành công.`);
    }
    updateStatus(id, status) {
        const existing = this.customerRepo.getById(id);
        if (!existing) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy khách hàng với mã ID: ${id}`);
        }
        const updated = this.customerRepo.update(id, { status });
        Logger_1.Logger.info(`Cập nhật trạng thái khách hàng ${existing.fullName} thành ${status}.`, 'CustomerService');
        return (0, result_types_1.successResponse)(updated, `Đã cập nhật trạng thái khách hàng thành ${status}.`);
    }
    searchCustomers(keyword) {
        const term = keyword.trim().toLowerCase();
        if (!term)
            return this.getAllCustomers();
        return this.customerRepo.find(c => c.fullName.toLowerCase().includes(term) ||
            c.cccd.includes(term) ||
            c.phone.includes(term) ||
            c.hometown.toLowerCase().includes(term) ||
            c.id.toLowerCase().includes(term));
    }
    filterCustomers(status) {
        if (!status)
            return this.getAllCustomers();
        return this.customerRepo.find(c => c.status === status);
    }
}
exports.CustomerService = CustomerService;
//# sourceMappingURL=CustomerService.js.map