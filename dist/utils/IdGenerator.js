"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdGenerator = void 0;
/**
 * Bộ sinh mã ID tự động có tiền tố theo chuẩn
 * VD: P001, KH001, DV001, TB001, USR001, HD001, INV001
 */
class IdGenerator {
    static counters = new Map();
    /**
     * Sinh ID mới với tiền tố prefix
     */
    static generate(prefix, padding = 3) {
        const current = (this.counters.get(prefix) || 0) + 1;
        this.counters.set(prefix, current);
        return `${prefix}${String(current).padStart(padding, '0')}`;
    }
    /**
     * Đồng bộ bộ đếm từ dữ liệu đã có trong DB
     */
    static syncFromExistingIds(prefix, ids) {
        let max = 0;
        const regex = new RegExp(`^${prefix}(\\d+)$`);
        for (const id of ids) {
            const match = id.match(regex);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num > max)
                    max = num;
            }
        }
        this.counters.set(prefix, max);
    }
    /**
     * Reset counter
     */
    static reset(prefix) {
        if (prefix) {
            this.counters.delete(prefix);
        }
        else {
            this.counters.clear();
        }
    }
}
exports.IdGenerator = IdGenerator;
//# sourceMappingURL=IdGenerator.js.map