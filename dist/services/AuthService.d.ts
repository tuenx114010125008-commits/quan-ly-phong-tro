import { UserRepository } from '../repositories/UserRepository';
import { IUser, UserEntity } from '../models/User';
import { ApiResponse } from '../types/result.types';
import { UserRole } from '../types/role.types';
export declare class AuthService {
    private userRepo;
    private currentUser;
    constructor(userRepo?: UserRepository);
    getCurrentUser(): UserEntity | null;
    isLoggedIn(): boolean;
    login(username: string, password: string): ApiResponse<UserEntity>;
    logout(): ApiResponse<boolean>;
    createUser(data: {
        username: string;
        password?: string;
        fullName: string;
        role: UserRole;
    }): ApiResponse<IUser>;
    getAllUsers(): IUser[];
}
