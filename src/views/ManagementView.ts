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

  // 1. Menu phong tro
  public async handleRoomMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('=========================================================');
      console.log('                   QUAN LY PHONG TRO                     ');
      console.log('=========================================================');
      console.log(' [1] Danh sach tat ca phong tro');
      console.log(' [2] Them phong tro moi');
      console.log(' [3] Cap nhat thong tin phong');
      console.log(' [4] Xoa phong tro');
      console.log(' [5] Tim kiem phong (so phong, ma phong)');
      console.log(' [6] Loc phong (theo trang thai, gia thue, dien tich)');
      console.log(' [7] Doi trang thai phong (AVAILABLE / RENTED / MAINTENANCE)');
      console.log(' [8] So sanh 2 phong');
      console.log(' [9] Quan ly thiet bi trong phong');
      console.log(' [0] Quay lai menu chinh');
      console.log('---------------------------------------------------------');

      const choice = await InputPrompt.ask('Nhap lua chon: ');
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
          console.log('[Loi] Lua chon khong hop le.');
          await InputPrompt.pause();
      }
    }
  }

  private displayRoomList(rooms: any[]): void {
    console.log(`\n--- DANH SACH PHONG TRO (${rooms.length} phong) ---`);
    const headers = ['Ma Phong', 'So Phong', 'Trang Thai', 'Dien Tich', 'Gia Thue / Thang', 'Mo Ta'];
    const rows = rooms.map(r => [
      r.id,
      r.roomNumber,
      Formatter.formatStatus(r.status),
      `${r.area} m2`,
      Formatter.formatCurrency(r.monthlyRent),
      r.description || '-'
    ]);
    Formatter.formatTable(headers, rows);
  }

  private async addRoom(): Promise<void> {
    console.log('\n--- THEM PHONG TRO MOI ---');
    const roomNumber = await InputPrompt.ask('So phong (VD: 101, 201): ');
    const area = await InputPrompt.askNumber('Dien tich (m2): ');
    const monthlyRent = await InputPrompt.askNumber('Gia thue thang (VND): ');
    const description = await InputPrompt.ask('Mo ta phong (tuy chon): ');

    const res = this.roomService.addRoom({ roomNumber, area, monthlyRent, description });
    if (res.success) {
      console.log(`[Thanh cong] ${res.message}`);
    } else {
      console.log(`[Loi] ${res.message}`);
      res.errors?.forEach(e => console.log(`   - ${e}`));
    }
    await InputPrompt.pause();
  }

  private async editRoom(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma phong can sua (VD: P001): ');
    const room = this.roomService.getRoomById(id);
    if (!room) {
      console.log('[Loi] Khong tim thay phong.');
      await InputPrompt.pause();
      return;
    }

    console.log(`Dang sua phong: ${room.roomNumber} (De trong neu giu nguyen)`);
    const roomNumber = await InputPrompt.ask(`So phong moi [${room.roomNumber}]: `);
    const areaStr = await InputPrompt.ask(`Dien tich moi [${room.area}]: `);
    const rentStr = await InputPrompt.ask(`Gia thue moi [${room.monthlyRent}]: `);
    const description = await InputPrompt.ask(`Mo ta moi [${room.description || ''}]: `);

    const updateData: any = {};
    if (roomNumber) updateData.roomNumber = roomNumber;
    if (areaStr) updateData.area = Number(areaStr);
    if (rentStr) updateData.monthlyRent = Number(rentStr);
    if (description) updateData.description = description;

    const res = this.roomService.updateRoom(id, updateData);
    if (res.success) {
      console.log(`[Thanh cong] ${res.message}`);
    } else {
      console.log(`[Loi] ${res.message}`);
    }
    await InputPrompt.pause();
  }

  private async deleteRoom(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma phong can xoa (VD: P001): ');
    const confirm = await InputPrompt.ask(`Ban co chac chan muon xoa phong "${id}"? (y/N): `);
    if (confirm.toLowerCase() === 'y') {
      const res = this.roomService.deleteRoom(id);
      if (res.success) {
        console.log(`[Thanh cong] ${res.message}`);
      } else {
        console.log(`[Loi] ${res.message}`);
      }
    }
    await InputPrompt.pause();
  }

  private async searchRoom(): Promise<void> {
    const kw = await InputPrompt.ask('\nNhap tu khoa tim kiem (So phong / Ma phong): ');
    const results = this.roomService.searchRooms(kw);
    this.displayRoomList(results);
    await InputPrompt.pause();
  }

  private async filterRoom(): Promise<void> {
    console.log('\n--- LOC PHONG TRO ---');
    console.log('Trang thai: 1. AVAILABLE | 2. RENTED | 3. MAINTENANCE | 0. Tat ca');
    const stChoice = await InputPrompt.ask('Chon trang thai: ');
    let status: RoomStatus | undefined;
    if (stChoice === '1') status = RoomStatus.AVAILABLE;
    if (stChoice === '2') status = RoomStatus.RENTED;
    if (stChoice === '3') status = RoomStatus.MAINTENANCE;

    const minPriceStr = await InputPrompt.ask('Gia thue toi thieu (de trong neu bo qua): ');
    const maxPriceStr = await InputPrompt.ask('Gia thue toi da (de trong neu bo qua): ');

    const results = this.roomService.filterRooms({
      status,
      minPrice: minPriceStr ? Number(minPriceStr) : undefined,
      maxPrice: maxPriceStr ? Number(maxPriceStr) : undefined
    });

    this.displayRoomList(results);
    await InputPrompt.pause();
  }

  private async changeRoomStatus(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma phong (VD: P001): ');
    console.log('1. AVAILABLE (Phong trong)');
    console.log('2. RENTED (Da thue)');
    console.log('3. MAINTENANCE (Bao tri)');
    const choice = await InputPrompt.ask('Chon trang thai (1-3): ');

    let status = RoomStatus.AVAILABLE;
    if (choice === '2') status = RoomStatus.RENTED;
    if (choice === '3') status = RoomStatus.MAINTENANCE;

    const res = this.roomService.updateStatus(id, status);
    if (res.success) {
      console.log(`[Thanh cong] ${res.message}`);
    } else {
      console.log(`[Loi] ${res.message}`);
    }
    await InputPrompt.pause();
  }

  private async compareRooms(): Promise<void> {
    const id1 = await InputPrompt.ask('\nNhap ma phong thu nhat (VD: P001): ');
    const id2 = await InputPrompt.ask('Nhap ma phong thu hai (VD: P002): ');

    const res = this.roomService.compareRooms(id1, id2);
    if (!res.success || !res.data) {
      console.log(`[Loi] ${res.message}`);
      await InputPrompt.pause();
      return;
    }

    const { room1, room2, priceDiff, areaDiff } = res.data;
    console.log('\n--- BANG SO SANH PHONG ---');
    const headers = ['Tieu Chi', `Phong ${room1.roomNumber} (${room1.id})`, `Phong ${room2.roomNumber} (${room2.id})`, 'Chenh Lech'];
    const rows = [
      ['Trang thai', Formatter.formatStatus(room1.status), Formatter.formatStatus(room2.status), '-'],
      ['Dien tich', `${room1.area} m2`, `${room2.area} m2`, `${areaDiff > 0 ? '+' : ''}${areaDiff} m2`],
      ['Gia thue / thang', Formatter.formatCurrency(room1.monthlyRent), Formatter.formatCurrency(room2.monthlyRent), `${priceDiff > 0 ? '+' : ''}${Formatter.formatCurrency(priceDiff)}`],
      ['So thiet bi', `${room1.equipment?.length || 0} mon`, `${room2.equipment?.length || 0} mon`, '-']
    ];
    Formatter.formatTable(headers, rows);
    await InputPrompt.pause();
  }

  private async manageRoomEquipment(): Promise<void> {
    const roomId = await InputPrompt.ask('\nNhap ma phong can xem thiet bi (VD: P001): ');
    const room = this.roomService.getRoomById(roomId);
    if (!room) {
      console.log('[Loi] Khong tim thay phong.');
      await InputPrompt.pause();
      return;
    }

    const equipmentList = this.equipmentService.getByRoomId(roomId);
    console.log(`\n--- DANH SACH THIET BI PHONG ${room.roomNumber} ---`);
    const headers = ['Ma TB', 'Ten Thiet Bi', 'Tinh Trang', 'Gia Tri (VND)'];
    const rows = equipmentList.map(e => [
      e.id,
      e.name,
      Formatter.formatStatus(e.condition),
      Formatter.formatCurrency(e.value)
    ]);
    Formatter.formatTable(headers, rows);

    console.log('\n[1] Them thiet bi');
    console.log('[2] Xoa thiet bi');
    console.log('[3] Cap nhat tinh trang');
    console.log('[0] Quay lai');
    const op = await InputPrompt.ask('Lua chon: ');

    if (op === '1') {
      const name = await InputPrompt.ask('Ten thiet bi: ');
      const value = await InputPrompt.askNumber('Gia tri uoc tinh (VND): ');
      const res = this.equipmentService.addEquipment({ roomId, name, value });
      if (res.success) {
        console.log(`[Thanh cong] ${res.message}`);
      } else {
        console.log(`[Loi] ${res.message}`);
      }
      await InputPrompt.pause();
    } else if (op === '2') {
      const tbId = await InputPrompt.ask('Ma thiet bi can xoa: ');
      const res = this.equipmentService.deleteEquipment(tbId);
      if (res.success) {
        console.log(`[Thanh cong] ${res.message}`);
      } else {
        console.log(`[Loi] ${res.message}`);
      }
      await InputPrompt.pause();
    } else if (op === '3') {
      const tbId = await InputPrompt.ask('Ma thiet bi: ');
      console.log('1. GOOD | 2. NEW | 3. DAMAGED | 4. MAINTENANCE');
      const c = await InputPrompt.ask('Chon tinh trang: ');
      let cond = EquipmentCondition.GOOD;
      if (c === '2') cond = EquipmentCondition.NEW;
      if (c === '3') cond = EquipmentCondition.DAMAGED;
      if (c === '4') cond = EquipmentCondition.MAINTENANCE;

      const res = this.equipmentService.updateCondition(tbId, cond);
      if (res.success) {
        console.log(`[Thanh cong] ${res.message}`);
      } else {
        console.log(`[Loi] ${res.message}`);
      }
      await InputPrompt.pause();
    }
  }

  // 2. Menu khach thue
  public async handleCustomerMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('=========================================================');
      console.log('                   QUAN LY KHACH THUE                    ');
      console.log('=========================================================');
      console.log(' [1] Danh sach khach thue');
      console.log(' [2] Them khach thue moi');
      console.log(' [3] Cap nhat thong tin khach');
      console.log(' [4] Xoa khach thue');
      console.log(' [5] Tim kiem khach thue');
      console.log(' [6] Khoa / Mo khoa trang thai khach');
      console.log(' [0] Quay lai menu chinh');
      console.log('---------------------------------------------------------');

      const choice = await InputPrompt.ask('Nhap lua chon: ');
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
          console.log('[Loi] Lua chon khong hop le.');
          await InputPrompt.pause();
      }
    }
  }

  private displayCustomerList(customers: any[]): void {
    console.log(`\n--- DANH SACH KHACH THUE (${customers.length} nguoi) ---`);
    const headers = ['Ma KH', 'Ho Va Ten', 'Ngay Sinh', 'So CCCD', 'So DT', 'Que Quan', 'Xe / Bien So', 'Trang Thai'];
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
    console.log('\n--- THEM KHACH THUE MOI ---');
    const fullName = await InputPrompt.ask('Ho va ten (VD: Nguyen Van A): ');
    const dateOfBirth = await InputPrompt.ask('Ngay sinh YYYY-MM-DD (VD: 2000-05-15): ');
    const cccd = await InputPrompt.ask('So CCCD (12 chu so): ');
    const phone = await InputPrompt.ask('So dien thoai (10 chu so): ');
    const hometown = await InputPrompt.ask('Que quan: ');
    const vehicle = await InputPrompt.ask('Phuong tien / Bien so xe (tuy chon): ');

    const res = this.customerService.addCustomer({ fullName, dateOfBirth, cccd, phone, hometown, vehicle });
    if (res.success) {
      console.log(`[Thanh cong] ${res.message}`);
    } else {
      console.log(`[Loi] ${res.message}`);
      res.errors?.forEach(e => console.log(`   - ${e}`));
    }
    await InputPrompt.pause();
  }

  private async editCustomer(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma khach hang can sua (VD: KH001): ');
    const c = this.customerService.getCustomerById(id);
    if (!c) {
      console.log('[Loi] Khong tim thay khach hang.');
      await InputPrompt.pause();
      return;
    }

    console.log(`Dang sua khach: ${c.fullName} (De trong neu giu nguyen)`);
    const fullName = await InputPrompt.ask(`Ho ten moi [${c.fullName}]: `);
    const phone = await InputPrompt.ask(`So DT moi [${c.phone}]: `);
    const cccd = await InputPrompt.ask(`CCCD moi [${c.cccd}]: `);
    const hometown = await InputPrompt.ask(`Que quan moi [${c.hometown}]: `);
    const vehicle = await InputPrompt.ask(`Xe moi [${c.vehicle || ''}]: `);

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (cccd) updateData.cccd = cccd;
    if (hometown) updateData.hometown = hometown;
    if (vehicle) updateData.vehicle = vehicle;

    const res = this.customerService.updateCustomer(id, updateData);
    if (res.success) {
      console.log(`[Thanh cong] ${res.message}`);
    } else {
      console.log(`[Loi] ${res.message}`);
    }
    await InputPrompt.pause();
  }

  private async deleteCustomer(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma khach hang can xoa (VD: KH001): ');
    const confirm = await InputPrompt.ask(`Ban co chac muon xoa khach hang "${id}"? (y/N): `);
    if (confirm.toLowerCase() === 'y') {
      const res = this.customerService.deleteCustomer(id);
      if (res.success) {
        console.log(`[Thanh cong] ${res.message}`);
      } else {
        console.log(`[Loi] ${res.message}`);
      }
    }
    await InputPrompt.pause();
  }

  private async searchCustomer(): Promise<void> {
    const kw = await InputPrompt.ask('\nNhap tu khoa tim kiem (Ho ten / CCCD / SDT / Que quan): ');
    const results = this.customerService.searchCustomers(kw);
    this.displayCustomerList(results);
    await InputPrompt.pause();
  }

  private async toggleCustomerStatus(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma khach hang: ');
    const c = this.customerService.getCustomerById(id);
    if (!c) {
      console.log('[Loi] Khong tim thay khach.');
      await InputPrompt.pause();
      return;
    }

    const newStatus = c.status === CustomerStatus.ACTIVE ? CustomerStatus.INACTIVE : CustomerStatus.ACTIVE;
    const res = this.customerService.updateStatus(id, newStatus);
    if (res.success) {
      console.log(`[Thanh cong] ${res.message}`);
    } else {
      console.log(`[Loi] ${res.message}`);
    }
    await InputPrompt.pause();
  }

  // 3. Menu dich vu
  public async handleServiceMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('=========================================================');
      console.log('                   QUAN LY BANG GIA DICH VU              ');
      console.log('=========================================================');
      console.log(' [1] Danh sach dich vu');
      console.log(' [2] Them dich vu moi');
      console.log(' [3] Cap nhat don gia dich vu');
      console.log(' [4] Bat / Tat trang thai dich vu');
      console.log(' [5] Xoa dich vu');
      console.log(' [6] Tim kiem dich vu');
      console.log(' [0] Quay lai menu chinh');
      console.log('---------------------------------------------------------');

      const choice = await InputPrompt.ask('Nhap lua chon: ');
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
          console.log('[Loi] Lua chon khong hop le.');
          await InputPrompt.pause();
      }
    }
  }

  private displayServiceList(services: any[]): void {
    console.log(`\n--- BANG GIA DICH VU (${services.length} dich vu) ---`);
    const headers = ['Ma DV', 'Ten Dich Vu', 'Don Vi', 'Don Gia (VND)', 'Trang Thai', 'Ghi Chu'];
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
    console.log('\n--- THEM DICH VU MOI ---');
    const name = await InputPrompt.ask('Ten dich vu: ');
    console.log('Don vi: 1. kWh | 2. m3 | 3. nguoi/thang | 4. phong/thang | 5. lan');
    const uChoice = await InputPrompt.ask('Chon don vi (1-5): ');
    const units: Record<string, ServiceUnit> = {
      '1': 'kWh',
      '2': 'm3',
      '3': 'người/tháng',
      '4': 'phòng/tháng',
      '5': 'lần'
    };
    const unit = units[uChoice] || 'phòng/tháng';
    const unitPrice = await InputPrompt.askNumber('Don gia (VND): ');
    const description = await InputPrompt.ask('Mo ta dich vu: ');

    const res = this.serviceService.addService({ name, unit, unitPrice, description });
    if (res.success) {
      console.log(`[Thanh cong] ${res.message}`);
    } else {
      console.log(`[Loi] ${res.message}`);
      res.errors?.forEach(e => console.log(`   - ${e}`));
    }
    await InputPrompt.pause();
  }

  private async updateServicePrice(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma dich vu can sua gia (VD: DV001): ');
    const s = this.serviceService.getServiceById(id);
    if (!s) {
      console.log('[Loi] Khong tim thay dich vu.');
      await InputPrompt.pause();
      return;
    }

    console.log(`Dich vu: "${s.name}" | Gia hien tai: ${Formatter.formatCurrency(s.unitPrice)}/${s.unit}`);
    const newPrice = await InputPrompt.askNumber('Nhap don gia moi (VND): ');
    const res = this.serviceService.updatePrice(id, newPrice);
    if (res.success) {
      console.log(`[Thanh cong] ${res.message}`);
    } else {
      console.log(`[Loi] ${res.message}`);
    }
    await InputPrompt.pause();
  }

  private async toggleServiceStatus(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma dich vu: ');
    const res = this.serviceService.toggleStatus(id);
    if (res.success) {
      console.log(`[Thanh cong] ${res.message}`);
    } else {
      console.log(`[Loi] ${res.message}`);
    }
    await InputPrompt.pause();
  }

  private async deleteService(): Promise<void> {
    const id = await InputPrompt.ask('\nNhap ma dich vu can xoa: ');
    const confirm = await InputPrompt.ask(`Ban co chac muon xoa dich vu "${id}"? (y/N): `);
    if (confirm.toLowerCase() === 'y') {
      const res = this.serviceService.deleteService(id);
      if (res.success) {
        console.log(`[Thanh cong] ${res.message}`);
      } else {
        console.log(`[Loi] ${res.message}`);
      }
    }
    await InputPrompt.pause();
  }

  private async searchService(): Promise<void> {
    const kw = await InputPrompt.ask('\nNhap tu khoa tim kiem: ');
    const results = this.serviceService.searchServices(kw);
    this.displayServiceList(results);
    await InputPrompt.pause();
  }

  // 4. Menu quan ly user
  public async handleUserMenu(): Promise<void> {
    while (true) {
      console.clear();
      console.log('=========================================================');
      console.log('                   QUAN LY TAI KHOAN                     ');
      console.log('=========================================================');
      console.log(' [1] Danh sach nguoi dung');
      console.log(' [2] Tao tai khoan moi');
      console.log(' [0] Quay lai menu chinh');
      console.log('---------------------------------------------------------');

      const choice = await InputPrompt.ask('Nhap lua chon: ');
      if (choice === '0') break;

      switch (choice) {
        case '1':
          const users = this.authService.getAllUsers();
          console.log(`\n--- DANH SACH TAI KHOAN (${users.length} tai khoan) ---`);
          const headers = ['Ma USR', 'Ten Dang Nhap', 'Ho Ten', 'Vai Tro', 'Trang Thai', 'Dang Nhap Gan Nhat'];
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
          console.log('\n--- TAO TAI KHOAN MOI ---');
          const username = await InputPrompt.ask('Ten dang nhap: ');
          const password = await InputPrompt.ask('Mat khau: ');
          const fullName = await InputPrompt.ask('Ho va ten hien thi: ');
          console.log('Vai tro: 1. ADMIN | 2. MANAGER | 3. STAFF');
          const r = await InputPrompt.ask('Chon vai tro (1-3): ');
          let role = UserRole.STAFF;
          if (r === '1') role = UserRole.ADMIN;
          if (r === '2') role = UserRole.MANAGER;

          const res = this.authService.createUser({ username, password, fullName, role });
          if (res.success) {
            console.log(`[Thanh cong] ${res.message}`);
          } else {
            console.log(`[Loi] ${res.message}`);
          }
          await InputPrompt.pause();
          break;
        default:
          console.log('[Loi] Lua chon khong hop le.');
          await InputPrompt.pause();
      }
    }
  }
}
