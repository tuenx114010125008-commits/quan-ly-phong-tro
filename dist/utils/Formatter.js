"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formatter = void 0;
const common_types_1 = require("../types/common.types");
const role_types_1 = require("../types/role.types");
/**
 * Tiện ích định dạng dữ liệu cho Console
 */
class Formatter {
    /**
     * Định dạng tiền tệ Việt Nam (VD: 3.500.000 VNĐ)
     */
    static formatCurrency(amount) {
        if (isNaN(amount))
            return '0 VNĐ';
        return amount.toLocaleString('vi-VN') + ' VNĐ';
    }
    /**
     * Định dạng ngày tháng (VD: 05/10/2026)
     */
    static formatDate(date) {
        if (!date)
            return '-';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime()))
            return '-';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }
    /**
     * Định dạng ngày giờ chi tiết (VD: 05/10/2026 18:30:00)
     */
    static formatDateTime(date) {
        if (!date)
            return '-';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime()))
            return '-';
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
    /**
     * Định dạng trạng thái sang chuỗi tiếng Việt dễ hiểu
     */
    static formatStatus(status) {
        switch (status) {
            case common_types_1.RoomStatus.AVAILABLE:
                return '\x1b[32mTRỐNG (AVAILABLE)\x1b[0m';
            case common_types_1.RoomStatus.RENTED:
                return '\x1b[33mĐÃ THUÊ (RENTED)\x1b[0m';
            case common_types_1.RoomStatus.MAINTENANCE:
                return '\x1b[31mBẢO TRÌ (MAINTENANCE)\x1b[0m';
            case common_types_1.CustomerStatus.ACTIVE:
                return '\x1b[32mHOẠT ĐỘNG (ACTIVE)\x1b[0m';
            case common_types_1.CustomerStatus.INACTIVE:
                return '\x1b[90mNGỪNG HOẠT ĐỘNG\x1b[0m';
            case common_types_1.ServiceStatus.ACTIVE:
                return '\x1b[32mĐANG CUNG CẤP\x1b[0m';
            case common_types_1.ServiceStatus.DISABLED:
                return '\x1b[31mTẠM NGƯNG\x1b[0m';
            case common_types_1.EquipmentCondition.GOOD:
                return '\x1b[32mTỐT\x1b[0m';
            case common_types_1.EquipmentCondition.NEW:
                return '\x1b[36mMỚI\x1b[0m';
            case common_types_1.EquipmentCondition.DAMAGED:
                return '\x1b[31mHƯ HỎNG\x1b[0m';
            case common_types_1.EquipmentCondition.MAINTENANCE:
                return '\x1b[33mĐANG SỬA\x1b[0m';
            case role_types_1.UserRole.ADMIN:
                return '\x1b[35m[QUẢN TRỊ VIÊN - ADMIN]\x1b[0m';
            case role_types_1.UserRole.MANAGER:
                return '\x1b[34m[QUẢN LÝ - MANAGER]\x1b[0m';
            case role_types_1.UserRole.STAFF:
                return '\x1b[36m[NHÂN VIÊN - STAFF]\x1b[0m';
            default:
                return status;
        }
    }
    /**
     * Hiển thị bảng dạng Console Table đẹp mắt
     */
    static formatTable(headers, rows) {
        if (headers.length === 0)
            return;
        // Tính toán độ rộng của từng cột (loại bỏ mã màu ANSI khi đo độ dài)
        const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, '');
        const colWidths = headers.map((header, colIndex) => {
            let max = header.length;
            for (const row of rows) {
                const val = row[colIndex] !== undefined ? String(row[colIndex]) : '';
                const len = stripAnsi(val).length;
                if (len > max)
                    max = len;
            }
            return max + 2; // padding 2 bên
        });
        const createDivider = (left, mid, right, fill) => {
            return left + colWidths.map(w => fill.repeat(w)).join(mid) + right;
        };
        console.log(createDivider('┌', '┬', '┐', '─'));
        // Header
        const headerRow = '│' + headers.map((h, i) => ` ${h.padEnd(colWidths[i] - 1)}`).join('│') + '│';
        console.log(`\x1b[1m${headerRow}\x1b[0m`);
        console.log(createDivider('├', '┼', '┤', '─'));
        // Rows
        if (rows.length === 0) {
            const totalWidth = colWidths.reduce((a, b) => a + b, 0) + colWidths.length - 1;
            const noData = '(Không có dữ liệu)';
            const padLeft = Math.floor((totalWidth - noData.length) / 2);
            const padRight = totalWidth - noData.length - padLeft;
            console.log('│' + ' '.repeat(padLeft) + `\x1b[90m${noData}\x1b[0m` + ' '.repeat(padRight) + '│');
        }
        else {
            for (const row of rows) {
                const line = '│' + row.map((cell, i) => {
                    const val = cell !== undefined ? String(cell) : '';
                    const visibleLen = stripAnsi(val).length;
                    const spaces = ' '.repeat(Math.max(0, colWidths[i] - visibleLen - 1));
                    return ` ${val}${spaces}`;
                }).join('│') + '│';
                console.log(line);
            }
        }
        console.log(createDivider('└', '┴', '┘', '─'));
    }
}
exports.Formatter = Formatter;
//# sourceMappingURL=Formatter.js.map