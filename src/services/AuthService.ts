import { UserRepository } from '../repositories/UserRepository';
import { IUser, UserEntity } from '../models/User';
import { ApiResponse, successResponse, errorResponse } from '../types/result.types';
import { UserRole, UserStatus } from '../types/role.types';
import { IdGenerator } from '../utils/IdGenerator';
import { Logger } from '../utils/Logger';

export class AuthService {
  private userRepo: UserRepository;
  private currentUser: UserEntity | null = null;

  constructor(userRepo?: UserRepository) {
    this.userRepo = userRepo || new UserRepository();
  }

  public getCurrentUser(): UserEntity | null {
    return this.currentUser;
  }

  public isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  public login(username: string, password: string): ApiResponse<UserEntity> {
    if (!username || !password) {
      return errorResponse('Tên đăng nhập và mật khẩu không được để trống.');
    }

    const user = this.userRepo.findByUsername(username.trim());
    if (!user) {
      Logger.warn(`Đăng nhập thất bại: Tài khoản "${username}" không tồn tại.`, 'AuthService');
      return errorResponse('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }

    if (user.password !== password) {
      Logger.warn(`Đăng nhập thất bại: Sai mật khẩu cho tài khoản "${username}".`, 'AuthService');
      return errorResponse('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }

    if (user.status !== UserStatus.ACTIVE) {
      Logger.warn(`Đăng nhập thất bại: Tài khoản "${username}" đang bị khóa hoặc ngưng kích hoạt.`, 'AuthService');
      return errorResponse('Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.');
    }

    const userEntity = user instanceof UserEntity ? user : new UserEntity(user);
    userEntity.lastLoginAt = new Date();
    this.userRepo.update(userEntity.id, { lastLoginAt: userEntity.lastLoginAt });

    this.currentUser = userEntity;
    Logger.info(`Người dùng "${user.username}" (${user.role}) đăng nhập thành công.`, 'AuthService');
    return successResponse(userEntity, `Đăng nhập thành công. Chào mừng ${userEntity.fullName}!`);
  }

  public logout(): ApiResponse<boolean> {
    if (this.currentUser) {
      Logger.info(`Người dùng "${this.currentUser.username}" đã đăng xuất.`, 'AuthService');
      this.currentUser = null;
    }
    return successResponse(true, 'Đã đăng xuất khỏi hệ thống.');
  }

  public createUser(data: {
    username: string;
    password?: string;
    fullName: string;
    role: UserRole;
  }): ApiResponse<IUser> {
    if (!this.currentUser || !this.currentUser.isAdmin()) {
      return errorResponse('Chỉ Quản trị viên (ADMIN) mới có quyền tạo tài khoản mới.');
    }

    if (!data.username || data.username.trim().length < 3) {
      return errorResponse('Tên đăng nhập phải có ít nhất 3 ký tự.');
    }

    if (this.userRepo.findByUsername(data.username.trim())) {
      return errorResponse(`Tên đăng nhập "${data.username}" đã tồn tại trên hệ thống.`);
    }

    const newUser = new UserEntity({
      id: IdGenerator.generate('USR'),
      username: data.username.trim(),
      password: data.password || '123456',
      fullName: data.fullName.trim(),
      role: data.role,
      status: UserStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.userRepo.create(newUser);
    Logger.info(`Đã tạo tài khoản mới: ${newUser.username} (${newUser.role}) bởi ${this.currentUser.username}.`, 'AuthService');
    return successResponse(newUser, 'Tạo tài khoản người dùng thành công.');
  }

  public getAllUsers(): IUser[] {
    return this.userRepo.getAll();
  }
}
