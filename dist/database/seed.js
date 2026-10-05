"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("./connection");
const Logger_1 = require("../utils/Logger");
function main() {
    Logger_1.Logger.info('Bắt đầu khởi tạo database và nạp dữ liệu mẫu...', 'Seed');
    const db = connection_1.DatabaseConnection.getInstance();
    db.seedDatabase();
    Logger_1.Logger.info('Đã hoàn tất nạp dữ liệu mẫu vào SQLite Database!', 'Seed');
}
main();
//# sourceMappingURL=seed.js.map