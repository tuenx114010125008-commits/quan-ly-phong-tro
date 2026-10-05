import { RoomRepository } from '../repositories/RoomRepository';
import { EquipmentRepository } from '../repositories/EquipmentRepository';
import { IRoom } from '../models/Room';
import { ApiResponse } from '../types/result.types';
import { RoomStatus, ID } from '../types/common.types';
export interface RoomFilterOptions {
    status?: RoomStatus;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
}
export declare class RoomService {
    private roomRepo;
    private equipmentRepo;
    constructor(roomRepo?: RoomRepository, equipmentRepo?: EquipmentRepository);
    getAllRooms(): IRoom[];
    getRoomById(id: ID): IRoom | undefined;
    getRoomByNumber(roomNumber: string): IRoom | undefined;
    addRoom(data: {
        roomNumber: string;
        area: number;
        monthlyRent: number;
        description?: string;
    }): ApiResponse<IRoom>;
    updateRoom(id: ID, data: Partial<IRoom>): ApiResponse<IRoom>;
    deleteRoom(id: ID): ApiResponse<boolean>;
    updateStatus(id: ID, status: RoomStatus): ApiResponse<IRoom>;
    searchRooms(keyword: string): IRoom[];
    filterRooms(options: RoomFilterOptions): IRoom[];
    compareRooms(roomId1: ID, roomId2: ID): ApiResponse<{
        room1: IRoom;
        room2: IRoom;
        priceDiff: number;
        areaDiff: number;
    }>;
}
