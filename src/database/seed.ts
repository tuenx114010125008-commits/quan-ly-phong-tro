import { DatabaseConnection } from './connection';
import { Logger } from '../utils/Logger';

function main() {
  Logger.info('Bắt đầu khởi tạo database và nạp dữ liệu mẫu...', 'Seed');
  const db = DatabaseConnection.getInstance();
  db.seedDatabase();
  Logger.info('Đã hoàn tất nạp dữ liệu mẫu vào SQLite Database!', 'Seed');
}

main();
