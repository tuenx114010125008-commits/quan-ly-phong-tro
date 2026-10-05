"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const User_1 = require("../models/User");
const result_types_1 = require("../types/result.types");
const role_types_1 = require("../types/role.types");
const IdGenerator_1 = require("../utils/IdGenerator");
const Logger_1 = require("../utils/Logger");
class AuthService {
    userRepo;
    currentUser = null;
    constructor(userRepo) {
        this.userRepo = userRepo || new UserRepository_1.UserRepository();
    }
    getCurrentUser() {
        return this.currentUser;
    }
    isLoggedIn() {
        return this.currentUser !== null;
    }
    login(username, password) {
        if (!username || !password) {
            return (0, result_types_1.errorResponse)('Tên đăng nhập và mật khẩu không được để trống.');
        }
        const user = this.userRepo.findByUsername(username.trim());
        if (!user) {
            Logger_1.Logger.warn(`Đăng nhập thất bại: Tài khoản "${username}" không tồn tại.`, 'AuthService');
            return (0, result_types_1.errorResponse)('Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
        if (user.password !== password) {
            Logger_1.Logger.warn(`Đăng nhập thất bại: Sai mật khẩu cho tài khoản "${username}".`, 'AuthService');
            return (0, result_types_1.errorResponse)('Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
        if (user.status !== role_types_1.UserStatus.ACTIVE) {
            Logger_1.Logger.warn(`Đăng nhập thất bại: Tài khoản "${username}" đang bị khóa hoặc ngưng kích hoạt.`, 'AuthService');
            return (0, result_types_1.errorResponse)('Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
        }
        const userEntity = user instanceof User_1.UserEntity ? user : new User_1.UserEntity(user);
        userEntity.lastLoginAt = new Date();
        this.userRepo.update(userEntity.id, { lastLoginAt: userEntity.lastLoginAt });
        this.currentUser = userEntity;
        Logger_1.Logger.info(`Người dùng "${user.username}" (${user.role}) đăng nhập thành công.`, 'AuthService');
        return (0, result_types_1.successResponse)(userEntity, `Đăng nhập thành công. Chào mừng ${userEntity.fullName}!`);
    }
    logout() {
        if (this.currentUser) {
            Logger_1.Logger.info(`Người dùng "${this.currentUser.username}" đã đăng xuất.`, 'AuthService');
            this.currentUser = null;
        }
        return (0, result_types_1.successResponse)(true, 'Đã đăng xuất khỏi hệ thống.');
    }
    createUser(data) {
        if (!this.currentUser || !this.currentUser.isAdmin()) {
            return (0, result_types_1.errorResponse)('Chỉ Quản trị viên (ADMIN) mới có quyền tạo tài khoản mới.');
        }
        if (!data.username || data.username.trim().length < 3) {
            return (0, result_types_1.errorResponse)('Tên đăng nhập phải có ít nhất 3 ký tự.');
        }
        if (this.userRepo.findByUsername(data.username.trim())) {
            return (0, result_types_1.errorResponse)(`Tên đăng nhập "${data.username}" đã tồn tại trên hệ thống.`);
        }
        const newUser = new User_1.UserEntity({
            id: IdGenerator_1.IdGenerator.generate('USR'),
            username: data.username.trim(),
            password: data.password || '123456',
            fullName: data.fullName.trim(),
            role: data.role,
            status: role_types_1.UserStatus.ACTIVE,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        this.userRepo.create(newUser);
        Logger_1.Logger.info(`Đã tạo tài khoản mới: ${newUser.username} (${newUser.role}) bởi ${this.currentUser.username}.`, 'AuthService');
        return (0, result_types_1.successResponse)(newUser, 'Tạo tài khoản người dùng thành công.');
    }
    getAllUsers() {
        return this.userRepo.getAll();
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map