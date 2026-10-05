import { RoomService } from '../services/RoomService';
import { CustomerService } from '../services/CustomerService';
import { ServiceService } from '../services/ServiceService';
import { EquipmentService } from '../services/EquipmentService';
import { AuthService } from '../services/AuthService';
import { InputPrompt } from './InputPrompt';
import { Formatter } from '../utils/Formatter';
import { RoomStatus, CustomerStatus, EquipmentCondition, ServiceUnit } from '../types/common.types';
import { UserRole } from '../types/role.types';

export class ManagementView {
  constructor(
    private roomService: RoomService,
    private customerService: CustomerService,
    private serviceService: ServiceService,
    private equipmentService: EquipmentService,
    private authService: AuthService
  ) {}

  // ==========================================
  // 1. QUẢN LÝ PHÒNG TRỌ
  // ==========================================
  public async handleRoomMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log('\x1b[1;33m               🏢 QUẢN LÝ PHÒNG TRỌ                    \x1b[0m');
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log(' [1] Danh sách tất cả phòng trọ');
      console.log(' [2] Thêm phòng trọ mới');
      console.log(' [3] Cập nhật thông tin phòng');
      console.log(' [4] Xóa phòng');
      console.log(' [5] Tìm kiếm phòng (theo số phòng, ID)');
      console.log(' [6] Lọc phòng (theo trạng thái, giá thuê, diện tích)');
      console.log(' [7] Đổi trạng thái phòng (TRỐNG / ĐÃ THUÊ / BẢO TRÌ)');
      console.log(' [8] So sánh 2 phòng');
      console.log(' [9] Quản lý trang thiết bị trong phòng');
      console.log(' [0] Quay lại Menu chính');
      console.log('\x1b[36m---------------------------------------------------------\x1b[0m');

      const choice = await InputPrompt.ask('👉 Nhập lựa chọn của bạn: ');
      if (choice === '0') break;

      switch (choice) {
        case '1':
          this.displayRoomList(this.roomService.getAllRooms());
          await InputPrompt.pause();
          break;
        case '2':
          await this.addRoom();
          break;
        case '3':
          await this.editRoom();
          break;
        case '4':
          await this.deleteRoom();
          break;
        case '5':
          await this.searchRoom();
          break;
        case '6':
          await this.filterRoom();
          break;
        case '7':
          await this.changeRoomStatus();
          break;
        case '8':
          await this.compareRooms();
          break;
        case '9':
          await this.manageRoomEquipment();
          break;
        default:
          console.log('\x1b[31m⚠️ Lựa chọn không hợp lệ!\x1b[0m');
          await InputPrompt.pause();
      }
    }
  }

  private displayRoomList(rooms: any[]): void {
    console.log(`\n\x1b[1m--- DANH SÁCH PHÒNG TRỌ (${rooms.length} phòng) ---\x1b[0m`);
    const headers = ['Mã Phòng', 'Số Phòng', 'Trạng Thái', 'Diện Tích', 'Giá Thuê / Tháng', 'Mô Tả'];
    const rows = rooms.map(r => [
      r.id,
      r.roomNumber,
      Formatter.formatStatus(r.status),
      `${r.area} m²`,
      Formatter.formatCurrency(r.monthlyRent),
      r.description || '-'
    ]);
    Formatter.formatTable(headers, rows);
  }

  private async addRoom(): Promise<void> {
    console.log('\n\x1b[1;32m--- THÊM PHÒNG TRỌ MỚI ---\x1b[0m');
    const roomNumber = await InputPrompt.ask('Số phòng (VD: 101, 201): ');
    const area = await InputPrompt.askNumber('Diện tích m² (VD: 25.5): ');
    const monthlyRent = await InputPrompt.askNumber('Giá thuê hàng tháng VNĐ (VD: 3500000): ');
    const description = await InputPrompt.ask('Mô tả phòng (tùy chọn): ');

    const res = this.roomService.addRoom({ roomNumber, area, monthlyRent, description });
    if (res.success) {
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      res.errors?.forEach(e => console.log(`   - ${e}`));
    }
    await InputPrompt.pause();
  }

  private async editRoom(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã phòng cần sửa (VD: P001): ');
    const room = this.roomService.getRoomById(id);
    if (!room) {
      console.log('\x1b[31m✖ Không tìm thấy phòng!\x1b[0m');
      await InputPrompt.pause();
      return;
    }

    console.log(`Đang sửa phòng: ${room.roomNumber} (Để trống nếu giữ nguyên)`);
    const roomNumber = await InputPrompt.ask(`Số phòng mới [${room.roomNumber}]: `);
    const areaStr = await InputPrompt.ask(`Diện tích mới [${room.area}]: `);
    const rentStr = await InputPrompt.ask(`Giá thuê mới [${room.monthlyRent}]: `);
    const description = await InputPrompt.ask(`Mô tả mới [${room.description || ''}]: `);

    const updateData: any = {};
    if (roomNumber) updateData.roomNumber = roomNumber;
    if (areaStr) updateData.area = Number(areaStr);
    if (rentStr) updateData.monthlyRent = Number(rentStr);
    if (description) updateData.description = description;

    const res = this.roomService.updateRoom(id, updateData);
    if (res.success) {
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
    }
    await InputPrompt.pause();
  }

  private async deleteRoom(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã phòng cần xóa (VD: P001): ');
    const confirm = await InputPrompt.ask(`Bạn có chắc chắn muốn xóa phòng "${id}"? (y/N): `);
    if (confirm.toLowerCase() === 'y') {
      const res = this.roomService.deleteRoom(id);
      if (res.success) {
        console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
      } else {
        console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      }
    } else {
      console.log('Đã hủy thao tác xóa.');
    }
    await InputPrompt.pause();
  }

  private async searchRoom(): Promise<void> {
    const kw = await InputPrompt.ask('\nNhập từ khóa tìm kiếm (Số phòng / Mã phòng): ');
    const results = this.roomService.searchRooms(kw);
    this.displayRoomList(results);
    await InputPrompt.pause();
  }

  private async filterRoom(): Promise<void> {
    console.log('\n--- LỌC PHÒNG TRỌ ---');
    console.log('Trạng thái: 1. AVAILABLE | 2. RENTED | 3. MAINTENANCE | 0. Tất cả');
    const stChoice = await InputPrompt.ask('Chọn trạng thái: ');
    let status: RoomStatus | undefined;
    if (stChoice === '1') status = RoomStatus.AVAILABLE;
    if (stChoice === '2') status = RoomStatus.RENTED;
    if (stChoice === '3') status = RoomStatus.MAINTENANCE;

    const minPriceStr = await InputPrompt.ask('Giá thuê tối thiểu VNĐ (để trống nếu không lọc): ');
    const maxPriceStr = await InputPrompt.ask('Giá thuê tối đa VNĐ (để trống nếu không lọc): ');

    const results = this.roomService.filterRooms({
      status,
      minPrice: minPriceStr ? Number(minPriceStr) : undefined,
      maxPrice: maxPriceStr ? Number(maxPriceStr) : undefined
    });

    this.displayRoomList(results);
    await InputPrompt.pause();
  }

  private async changeRoomStatus(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã phòng (VD: P001): ');
    console.log('Chọn trạng thái mới:');
    console.log('1. AVAILABLE (Phòng trống)');
    console.log('2. RENTED (Đã cho thuê)');
    console.log('3. MAINTENANCE (Đang sửa chữa / bảo trì)');
    const choice = await InputPrompt.ask('Lựa chọn (1-3): ');

    let status = RoomStatus.AVAILABLE;
    if (choice === '2') status = RoomStatus.RENTED;
    if (choice === '3') status = RoomStatus.MAINTENANCE;

    const res = this.roomService.updateStatus(id, status);
    if (res.success) {
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
    }
    await InputPrompt.pause();
  }

  private async compareRooms(): Promise<void> {
    const id1 = await InputPrompt.ask('\nNhập mã phòng thứ nhất (VD: P001): ');
    const id2 = await InputPrompt.ask('Nhập mã phòng thứ hai (VD: P002): ');

    const res = this.roomService.compareRooms(id1, id2);
    if (!res.success || !res.data) {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      await InputPrompt.pause();
      return;
    }

    const { room1, room2, priceDiff, areaDiff } = res.data;
    console.log('\n\x1b[1;33m--- BẢNG SO SÁNH PHÒNG ---\x1b[0m');
    const headers = ['Tiêu chí', `Phòng ${room1.roomNumber} (${room1.id})`, `Phòng ${room2.roomNumber} (${room2.id})`, 'Chênh lệch'];
    const rows = [
      ['Trạng thái', Formatter.formatStatus(room1.status), Formatter.formatStatus(room2.status), '-'],
      ['Diện tích', `${room1.area} m²`, `${room2.area} m²`, `${areaDiff > 0 ? '+' : ''}${areaDiff} m²`],
      ['Giá thuê / tháng', Formatter.formatCurrency(room1.monthlyRent), Formatter.formatCurrency(room2.monthlyRent), `${priceDiff > 0 ? '+' : ''}${Formatter.formatCurrency(priceDiff)}`],
      ['Số thiết bị', `${room1.equipment?.length || 0} món`, `${room2.equipment?.length || 0} món`, '-']
    ];
    Formatter.formatTable(headers, rows);
    await InputPrompt.pause();
  }

  private async manageRoomEquipment(): Promise<void> {
    const roomId = await InputPrompt.ask('\nNhập mã phòng cần xem/quản lý thiết bị (VD: P001): ');
    const room = this.roomService.getRoomById(roomId);
    if (!room) {
      console.log('\x1b[31m✖ Không tìm thấy phòng!\x1b[0m');
      await InputPrompt.pause();
      return;
    }

    const equipmentList = this.equipmentService.getByRoomId(roomId);
    console.log(`\n\x1b[1m--- DANH SÁCH THIẾT BỊ PHÒNG ${room.roomNumber} ---\x1b[0m`);
    const headers = ['Mã TB', 'Tên Thiết Bị', 'Tình Trạng', 'Giá Trị (VNĐ)'];
    const rows = equipmentList.map(e => [
      e.id,
      e.name,
      Formatter.formatStatus(e.condition),
      Formatter.formatCurrency(e.value)
    ]);
    Formatter.formatTable(headers, rows);

    console.log('\n[1] Thêm thiết bị mới vào phòng');
    console.log('[2] Xóa thiết bị khỏi phòng');
    console.log('[3] Cập nhật tình trạng thiết bị');
    console.log('[0] Quay lại');
    const op = await InputPrompt.ask('Lựa chọn: ');

    if (op === '1') {
      const name = await InputPrompt.ask('Tên thiết bị (VD: Máy lạnh, Tủ lạnh): ');
      const value = await InputPrompt.askNumber('Giá trị ước tính VNĐ: ');
      const res = this.equipmentService.addEquipment({ roomId, name, value });
      if (res.success) {
        console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
      } else {
        console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      }
      await InputPrompt.pause();
    } else if (op === '2') {
      const tbId = await InputPrompt.ask('Nhập mã thiết bị cần xóa (VD: TB001): ');
      const res = this.equipmentService.deleteEquipment(tbId);
      if (res.success) {
        console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
      } else {
        console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      }
      await InputPrompt.pause();
    } else if (op === '3') {
      const tbId = await InputPrompt.ask('Nhập mã thiết bị (VD: TB001): ');
      console.log('1. GOOD (Tốt) | 2. NEW (Mới) | 3. DAMAGED (Hư hỏng) | 4. MAINTENANCE (Đang sửa)');
      const c = await InputPrompt.ask('Chọn tình trạng: ');
      let cond = EquipmentCondition.GOOD;
      if (c === '2') cond = EquipmentCondition.NEW;
      if (c === '3') cond = EquipmentCondition.DAMAGED;
      if (c === '4') cond = EquipmentCondition.MAINTENANCE;

      const res = this.equipmentService.updateCondition(tbId, cond);
      if (res.success) {
        console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
      } else {
        console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      }
      await InputPrompt.pause();
    }
  }

  // ==========================================
  // 2. QUẢN LÝ KHÁCH THUÊ
  // ==========================================
  public async handleCustomerMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log('\x1b[1;33m               👥 QUẢN LÝ KHÁCH THUÊ                    \x1b[0m');
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log(' [1] Danh sách tất cả khách thuê');
      console.log(' [2] Thêm khách thuê mới');
      console.log(' [3] Cập nhật thông tin khách');
      console.log(' [4] Xóa khách thuê');
      console.log(' [5] Tìm kiếm khách thuê (Họ tên, CCCD, SĐT, Quê quán)');
      console.log(' [6] Khóa / Kích hoạt khách thuê');
      console.log(' [0] Quay lại Menu chính');
      console.log('\x1b[36m---------------------------------------------------------\x1b[0m');

      const choice = await InputPrompt.ask('👉 Nhập lựa chọn của bạn: ');
      if (choice === '0') break;

      switch (choice) {
        case '1':
          this.displayCustomerList(this.customerService.getAllCustomers());
          await InputPrompt.pause();
          break;
        case '2':
          await this.addCustomer();
          break;
        case '3':
          await this.editCustomer();
          break;
        case '4':
          await this.deleteCustomer();
          break;
        case '5':
          await this.searchCustomer();
          break;
        case '6':
          await this.toggleCustomerStatus();
          break;
        default:
          console.log('\x1b[31m⚠️ Lựa chọn không hợp lệ!\x1b[0m');
          await InputPrompt.pause();
      }
    }
  }

  private displayCustomerList(customers: any[]): void {
    console.log(`\n\x1b[1m--- DANH SÁCH KHÁCH THUÊ TRỌ (${customers.length} người) ---\x1b[0m`);
    const headers = ['Mã KH', 'Họ Và Tên', 'Ngày Sinh', 'Số CCCD', 'Số ĐT', 'Quê Quán', 'Xe / Biển Số', 'Trạng Thái'];
    const rows = customers.map(c => [
      c.id,
      c.fullName,
      Formatter.formatDate(c.dateOfBirth),
      c.cccd,
      c.phone,
      c.hometown,
      c.vehicle || '-',
      Formatter.formatStatus(c.status)
    ]);
    Formatter.formatTable(headers, rows);
  }

  private async addCustomer(): Promise<void> {
    console.log('\n\x1b[1;32m--- THÊM KHÁCH THUÊ MỚI ---\x1b[0m');
    const fullName = await InputPrompt.ask('Họ và tên (VD: Nguyen Van A): ');
    const dateOfBirth = await InputPrompt.ask('Ngày sinh YYYY-MM-DD (VD: 2000-05-15): ');
    const cccd = await InputPrompt.ask('Số CCCD (12 chữ số): ');
    const phone = await InputPrompt.ask('Số điện thoại (10 chữ số): ');
    const hometown = await InputPrompt.ask('Quê quán (Tỉnh / Thành phố): ');
    const vehicle = await InputPrompt.ask('Phương tiện / Biển số xe (tùy chọn): ');

    const res = this.customerService.addCustomer({ fullName, dateOfBirth, cccd, phone, hometown, vehicle });
    if (res.success) {
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      res.errors?.forEach(e => console.log(`   - ${e}`));
    }
    await InputPrompt.pause();
  }

  private async editCustomer(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã khách hàng cần sửa (VD: KH001): ');
    const c = this.customerService.getCustomerById(id);
    if (!c) {
      console.log('\x1b[31m✖ Không tìm thấy khách hàng!\x1b[0m');
      await InputPrompt.pause();
      return;
    }

    console.log(`Đang sửa khách: ${c.fullName} (Để trống nếu giữ nguyên)`);
    const fullName = await InputPrompt.ask(`Họ tên mới [${c.fullName}]: `);
    const phone = await InputPrompt.ask(`Số ĐT mới [${c.phone}]: `);
    const cccd = await InputPrompt.ask(`CCCD mới [${c.cccd}]: `);
    const hometown = await InputPrompt.ask(`Quê quán mới [${c.hometown}]: `);
    const vehicle = await InputPrompt.ask(`Xe mới [${c.vehicle || ''}]: `);

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (cccd) updateData.cccd = cccd;
    if (hometown) updateData.hometown = hometown;
    if (vehicle) updateData.vehicle = vehicle;

    const res = this.customerService.updateCustomer(id, updateData);
    if (res.success) {
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
    }
    await InputPrompt.pause();
  }

  private async deleteCustomer(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã khách hàng cần xóa (VD: KH001): ');
    const confirm = await InputPrompt.ask(`Bạn có chắc chắn muốn xóa khách hàng "${id}"? (y/N): `);
    if (confirm.toLowerCase() === 'y') {
      const res = this.customerService.deleteCustomer(id);
      if (res.success) {
        console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
      } else {
        console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      }
    }
    await InputPrompt.pause();
  }

  private async searchCustomer(): Promise<void> {
    const kw = await InputPrompt.ask('\nNhập từ khóa tìm kiếm (Họ tên / CCCD / SĐT / Quê quán): ');
    const results = this.customerService.searchCustomers(kw);
    this.displayCustomerList(results);
    await InputPrompt.pause();
  }

  private async toggleCustomerStatus(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã khách hàng (VD: KH001): ');
    const c = this.customerService.getCustomerById(id);
    if (!c) {
      console.log('\x1b[31m✖ Không tìm thấy khách hàng!\x1b[0m');
      await InputPrompt.pause();
      return;
    }

    const newStatus = c.status === CustomerStatus.ACTIVE ? CustomerStatus.INACTIVE : CustomerStatus.ACTIVE;
    const res = this.customerService.updateStatus(id, newStatus);
    if (res.success) {
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
    }
    await InputPrompt.pause();
  }

  // ==========================================
  // 3. QUẢN LÝ DỊCH VỤ
  // ==========================================
  public async handleServiceMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log('\x1b[1;33m               💡 QUẢN LÝ DỊCH VỤ                       \x1b[0m');
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log(' [1] Danh sách tất cả dịch vụ');
      console.log(' [2] Thêm dịch vụ mới');
      console.log(' [3] Cập nhật đơn giá dịch vụ');
      console.log(' [4] Bật / Tắt trạng thái cung cấp dịch vụ');
      console.log(' [5] Xóa dịch vụ');
      console.log(' [6] Tìm kiếm dịch vụ');
      console.log(' [0] Quay lại Menu chính');
      console.log('\x1b[36m---------------------------------------------------------\x1b[0m');

      const choice = await InputPrompt.ask('👉 Nhập lựa chọn của bạn: ');
      if (choice === '0') break;

      switch (choice) {
        case '1':
          this.displayServiceList(this.serviceService.getAllServices());
          await InputPrompt.pause();
          break;
        case '2':
          await this.addService();
          break;
        case '3':
          await this.updateServicePrice();
          break;
        case '4':
          await this.toggleServiceStatus();
          break;
        case '5':
          await this.deleteService();
          break;
        case '6':
          await this.searchService();
          break;
        default:
          console.log('\x1b[31m⚠️ Lựa chọn không hợp lệ!\x1b[0m');
          await InputPrompt.pause();
      }
    }
  }

  private displayServiceList(services: any[]): void {
    console.log(`\n\x1b[1m--- BẢNG GIÁ DỊCH VỤ HIỆN HÀNH (${services.length} dịch vụ) ---\x1b[0m`);
    const headers = ['Mã DV', 'Tên Dịch Vụ', 'Đơn Vị Tính', 'Đơn Giá (VNĐ)', 'Trạng Thái', 'Ghi Chú'];
    const rows = services.map(s => [
      s.id,
      s.name,
      s.unit,
      Formatter.formatCurrency(s.unitPrice),
      Formatter.formatStatus(s.status),
      s.description || '-'
    ]);
    Formatter.formatTable(headers, rows);
  }

  private async addService(): Promise<void> {
    console.log('\n\x1b[1;32m--- THÊM DỊCH VỤ MỚI ---\x1b[0m');
    const name = await InputPrompt.ask('Tên dịch vụ (VD: Giặt sấy tự động): ');
    console.log('Đơn vị tính: 1. kWh | 2. m3 | 3. người/tháng | 4. phòng/tháng | 5. lần');
    const uChoice = await InputPrompt.ask('Chọn đơn vị (1-5): ');
    const units: Record<string, ServiceUnit> = {
      '1': 'kWh',
      '2': 'm3',
      '3': 'người/tháng',
      '4': 'phòng/tháng',
      '5': 'lần'
    };
    const unit = units[uChoice] || 'phòng/tháng';
    const unitPrice = await InputPrompt.askNumber('Đơn giá VNĐ: ');
    const description = await InputPrompt.ask('Mô tả dịch vụ: ');

    const res = this.serviceService.addService({ name, unit, unitPrice, description });
    if (res.success) {
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      res.errors?.forEach(e => console.log(`   - ${e}`));
    }
    await InputPrompt.pause();
  }

  private async updateServicePrice(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã dịch vụ cần sửa giá (VD: DV001): ');
    const s = this.serviceService.getServiceById(id);
    if (!s) {
      console.log('\x1b[31m✖ Không tìm thấy dịch vụ!\x1b[0m');
      await InputPrompt.pause();
      return;
    }

    console.log(`Dịch vụ: "${s.name}" | Giá hiện tại: ${Formatter.formatCurrency(s.unitPrice)}/${s.unit}`);
    const newPrice = await InputPrompt.askNumber('Nhập đơn giá mới VNĐ: ');
    const res = this.serviceService.updatePrice(id, newPrice);
    if (res.success) {
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
    }
    await InputPrompt.pause();
  }

  private async toggleServiceStatus(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã dịch vụ (VD: DV001): ');
    const res = this.serviceService.toggleStatus(id);
    if (res.success) {
      console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
    } else {
      console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
    }
    await InputPrompt.pause();
  }

  private async deleteService(): Promise<void> {
    const id = await InputPrompt.ask('\nNhập mã dịch vụ cần xóa (VD: DV001): ');
    const confirm = await InputPrompt.ask(`Bạn có chắc muốn xóa dịch vụ "${id}"? (y/N): `);
    if (confirm.toLowerCase() === 'y') {
      const res = this.serviceService.deleteService(id);
      if (res.success) {
        console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
      } else {
        console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
      }
    }
    await InputPrompt.pause();
  }

  private async searchService(): Promise<void> {
    const kw = await InputPrompt.ask('\nNhập từ khóa tìm kiếm: ');
    const results = this.serviceService.searchServices(kw);
    this.displayServiceList(results);
    await InputPrompt.pause();
  }

  // ==========================================
  // 4. QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG (ADMIN)
  // ==========================================
  public async handleUserMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log('\x1b[1;33m               🔐 QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN        \x1b[0m');
      console.log('\x1b[36m=========================================================\x1b[0m');
      console.log(' [1] Danh sách người dùng hệ thống');
      console.log(' [2] Tạo tài khoản mới');
      console.log(' [0] Quay lại Menu chính');
      console.log('\x1b[36m---------------------------------------------------------\x1b[0m');

      const choice = await InputPrompt.ask('👉 Nhập lựa chọn của bạn: ');
      if (choice === '0') break;

      switch (choice) {
        case '1':
          const users = this.authService.getAllUsers();
          console.log(`\n\x1b[1m--- DANH SÁCH TÀI KHOẢN HỆ THỐNG (${users.length} tài khoản) ---\x1b[0m`);
          const headers = ['Mã USR', 'Tên Đăng Nhập', 'Họ Tên', 'Vai Trò (Role)', 'Trạng Thái', 'Đăng Nhập Gần Nhất'];
          const rows = users.map(u => [
            u.id,
            u.username,
            u.fullName,
            Formatter.formatStatus(u.role),
            Formatter.formatStatus(u.status),
            Formatter.formatDateTime(u.lastLoginAt)
          ]);
          Formatter.formatTable(headers, rows);
          await InputPrompt.pause();
          break;
        case '2':
          console.log('\n\x1b[1;32m--- TẠO TÀI KHOẢN MỚI ---\x1b[0m');
          const username = await InputPrompt.ask('Tên đăng nhập: ');
          const password = await InputPrompt.ask('Mật khẩu: ');
          const fullName = await InputPrompt.ask('Họ và tên hiển thị: ');
          console.log('Vai trò: 1. ADMIN | 2. MANAGER | 3. STAFF');
          const r = await InputPrompt.ask('Chọn vai trò (1-3): ');
          let role = UserRole.STAFF;
          if (r === '1') role = UserRole.ADMIN;
          if (r === '2') role = UserRole.MANAGER;

          const res = this.authService.createUser({ username, password, fullName, role });
          if (res.success) {
            console.log(`\x1b[32m✔ ${res.message}\x1b[0m`);
          } else {
            console.log(`\x1b[31m✖ ${res.message}\x1b[0m`);
          }
          await InputPrompt.pause();
          break;
        default:
          console.log('\x1b[31m⚠️ Lựa chọn không hợp lệ!\x1b[0m');
          await InputPrompt.pause();
      }
    }
  }
}
