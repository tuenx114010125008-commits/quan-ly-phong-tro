import { ID } from '../types/common.types';
/**
 * Interface thực thể cơ sở chứa các thuộc tính định danh và thời gian
 */
export interface BaseEntity {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
}
