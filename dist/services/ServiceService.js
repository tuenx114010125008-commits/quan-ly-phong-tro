"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceService = void 0;
const ServiceRepository_1 = require("../repositories/ServiceRepository");
const Service_1 = require("../models/Service");
const result_types_1 = require("../types/result.types");
const common_types_1 = require("../types/common.types");
const IdGenerator_1 = require("../utils/IdGenerator");
const Validator_1 = require("../utils/Validator");
const Logger_1 = require("../utils/Logger");
class ServiceService {
    serviceRepo;
    constructor(serviceRepo) {
        this.serviceRepo = serviceRepo || new ServiceRepository_1.ServiceRepository();
    }
    getAllServices() {
        return this.serviceRepo.getAll();
    }
    getActiveServices() {
        return this.serviceRepo.find(s => s.status === common_types_1.ServiceStatus.ACTIVE);
    }
    getServiceById(id) {
        return this.serviceRepo.getById(id);
    }
    getServiceByName(name) {
        return this.serviceRepo.findByName(name.trim());
    }
    addService(data) {
        const rules = [
            { condition: Validator_1.Validator.isNotEmpty(data.name), message: 'Tên dịch vụ không được để trống.' },
            { condition: Validator_1.Validator.isNonNegativeNumber(data.unitPrice), message: 'Đơn giá dịch vụ phải >= 0 VNĐ.' },
            { condition: Validator_1.Validator.isNotEmpty(data.unit), message: 'Đơn vị tính không được để trống.' }
        ];
        const validation = Validator_1.Validator.validate(rules);
        if (!validation.isValid) {
            return (0, result_types_1.errorResponse)('Thông tin dịch vụ không hợp lệ.', validation.errors);
        }
        if (this.serviceRepo.findByName(data.name.trim())) {
            return (0, result_types_1.errorResponse)(`Dịch vụ "${data.name}" đã tồn tại trong hệ thống.`);
        }
        const newService = new Service_1.ServiceEntity({
            id: IdGenerator_1.IdGenerator.generate('DV'),
            name: data.name.trim(),
            unit: data.unit,
            unitPrice: data.unitPrice,
            status: common_types_1.ServiceStatus.ACTIVE,
            description: data.description?.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        });
        this.serviceRepo.create(newService);
        Logger_1.Logger.info(`Thêm dịch vụ mới: ${newService.name} (Đơn giá: ${newService.unitPrice}/${newService.unit}).`, 'ServiceService');
        return (0, result_types_1.successResponse)(newService, `Thêm dịch vụ "${newService.name}" thành công.`);
    }
    updatePrice(id, newPrice) {
        const existing = this.serviceRepo.getById(id);
        if (!existing) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy dịch vụ với mã ID: ${id}`);
        }
        if (!Validator_1.Validator.isNonNegativeNumber(newPrice)) {
            return (0, result_types_1.errorResponse)('Đơn giá dịch vụ phải >= 0 VNĐ.');
        }
        const oldPrice = existing.unitPrice;
        const updated = this.serviceRepo.update(id, { unitPrice: newPrice });
        Logger_1.Logger.info(`Cập nhật giá dịch vụ "${existing.name}" từ ${oldPrice} -> ${newPrice} VNĐ.`, 'ServiceService');
        return (0, result_types_1.successResponse)(updated, `Đã cập nhật giá dịch vụ "${existing.name}" thành ${newPrice} VNĐ.`);
    }
    updateService(id, data) {
        const existing = this.serviceRepo.getById(id);
        if (!existing) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy dịch vụ với mã ID: ${id}`);
        }
        if (data.name && data.name !== existing.name) {
            const duplicate = this.serviceRepo.findByName(data.name.trim());
            if (duplicate && duplicate.id !== id) {
                return (0, result_types_1.errorResponse)(`Tên dịch vụ "${data.name}" đã tồn tại.`);
            }
        }
        if (data.unitPrice !== undefined && !Validator_1.Validator.isNonNegativeNumber(data.unitPrice)) {
            return (0, result_types_1.errorResponse)('Đơn giá dịch vụ phải >= 0 VNĐ.');
        }
        const updated = this.serviceRepo.update(id, data);
        Logger_1.Logger.info(`Cập nhật thông tin dịch vụ ID: ${id}.`, 'ServiceService');
        return (0, result_types_1.successResponse)(updated, 'Cập nhật dịch vụ thành công.');
    }
    toggleStatus(id) {
        const existing = this.serviceRepo.getById(id);
        if (!existing) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy dịch vụ với mã ID: ${id}`);
        }
        const newStatus = existing.status === common_types_1.ServiceStatus.ACTIVE ? common_types_1.ServiceStatus.DISABLED : common_types_1.ServiceStatus.ACTIVE;
        const updated = this.serviceRepo.update(id, { status: newStatus });
        Logger_1.Logger.info(`Chuyển trạng thái dịch vụ "${existing.name}" sang ${newStatus}.`, 'ServiceService');
        return (0, result_types_1.successResponse)(updated, `Đã chuyển trạng thái dịch vụ sang ${newStatus}.`);
    }
    deleteService(id) {
        const existing = this.serviceRepo.getById(id);
        if (!existing) {
            return (0, result_types_1.errorResponse)(`Không tìm thấy dịch vụ với mã ID: ${id}`);
        }
        this.serviceRepo.delete(id);
        Logger_1.Logger.info(`Đã xóa dịch vụ "${existing.name}" (ID: ${id}).`, 'ServiceService');
        return (0, result_types_1.successResponse)(true, `Đã xóa dịch vụ "${existing.name}" thành công.`);
    }
    searchServices(keyword) {
        const term = keyword.trim().toLowerCase();
        if (!term)
            return this.getAllServices();
        return this.serviceRepo.find(s => s.name.toLowerCase().includes(term) ||
            s.id.toLowerCase().includes(term) ||
            Boolean(s.description?.toLowerCase().includes(term)));
    }
}
exports.ServiceService = ServiceService;
//# sourceMappingURL=ServiceService.js.map