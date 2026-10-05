#include <iostream>  // Dung de nhap/xuat du lieu (cin, cout)
#include <string>    // Dung de xu ly chuoi ky tu
#include <vector>    // Dung de luu tru danh sach (mang dong co the them/bot phan tu)
#include <limits>    // Dung de lay gia tri toi da cua kieu du lieu
#include <fstream>   // Dung de doc/ghi file
using namespace std;

// Ham dung man hinh de nguoi dung doc thong bao (doi nhan Enter moi tiep tuc)
void Dung() {
    cout << "\nNhan Enter de tiep tuc...";
    // Xoa bo nho dem de tranh loi, numeric_limits<streamsize>::max() la so ky tu toi da co the xoa
    cin.ignore(numeric_limits<streamsize>::max(), '\n'); 
    cin.get(); // Doi nguoi dung nhan Enter
}

// Ham xoa sach bo nho dem (can thiet khi chuyen tu nhap so sang nhap chuoi hoac nhap sai)
void XoaBuffer() {
    cin.clear(); // Xoa trang thai loi neu co
    cin.ignore(numeric_limits<streamsize>::max(), '\n'); // Xoa cac ky tu con lai trong buffer
}

// Ham kiem tra ten hop le (chi chua chu cai va khoang trang, khong rong, <= 50 ky tu)
bool KTraTen(const string& s) {
    if (s.empty() || s.length() > 50) return false;
    for (char c : s) {
        // isalpha(c) kiem tra chu cai, neu khong phai chu cai va cung khong phai khoang trang thi sai
        if (!isalpha(c) && c != ' ') return false;
    }
    return true;
}

// Ham kiem tra chuoi so (dung cho CCCD, SDT) - phai dung do dai va chi chua so
bool KTraSo(const string& s, int doDai) {
    if (s.length() != doDai) return false;
    for (char c : s)
        if (!isdigit(c)) return false; // isdigit(c) kiem tra chu so 0-9
    return true;
}

// Ham nhap so thuc an toan (lap lai cho den khi nhap dung)
// Tham so: msg - thong diep hien thi, Tra ve: so thuc > 0
double NhapSoThuc(const string& msg) {
    double x;
    while (true) {
        cout << msg << ": ";
        if (cin >> x) {
            if (x > 0) return x; // Gia tri phai > 0
            cout << "Loi! Gia tri phai > 0.\n";
        } else {
            cout << "Loi! Ban phai nhap so thuc (VD: 25.5).\n";
            XoaBuffer();
        }
    }
}

// Ham nhap so nguyen an toan
// Tham so: msg - thong diep hien thi
// Tra ve: mot so nguyen hop le (>= 0)
int NhapSo(const string& msg) {
    int x;
    while (true) {
        cout << msg << ": ";
        // Kiem tra vua nhap thanh cong vua >= 0 (so luong, thang, nam... khong the < 0)
        if (cin >> x && x >= 0) return x;
        cout << "Loi! So phai >= 0.\n";
        XoaBuffer(); // Xoa bo nho dem khi nhap sai
    }
}

// Ham nhap tien (so nguyen dai - long)
// Tham so: msg - thong diep hien thi
// Tra ve: mot so nguyen dai hop le (>= 0)
// Dung long vi tien co the la so rat lon (hang trieu, hang ty VND)
long NhapTien(const string& msg) {
    long x;
    while (true) {
        cout << msg << ": ";
        if (cin >> x && x >= 0) return x;
        cout << "Loi! Tien phai >= 0.\n";
        XoaBuffer();
    }
}

// Ham nhap ho ten chuan (co kiem tra)
// Tra ve: mot chuoi ho ten hop le
// getline() duoc dung de doc ca dong chuoi, ke ca khoang trang (khac cin >>)
string NhapHoTenChuan() {
    string s;
    XoaBuffer(); // Xoa dau Enter thua tu lenh truoc do (can thiet khi truoc do dung cin >>)
    while (true) {
        cout << "Ho ten (VD: Nguyen Van A): ";
        getline(cin, s); // Doc ca dong chuoi (co the co khoang trang o giua)
        // Kiem tra ho ten co hop le khong (chi chua chu cai va khoang trang)
        if (KTraTen(s)) return s;
        cout << "Loi! Ten khong duoc chua so hoac ky tu la.\n";
    }
}

// Ham nhap so dien thoai chuan
// Tra ve: mot chuoi SDT hop le (dung 10 chu so)
// SDT Viet Nam co dung 10 chu so (khong co khoang trang)
string NhapSDTChuan() {
    string s;
    while (true) {
        cout << "SDT (10 so): ";
        cin >> s; // Doc chuoi (khong co khoang trang, se dung lai khi gap khoang trang)
        // Kiem tra SDT co dung 10 chu so khong
        if (KTraSo(s, 10)) return s;
        cout << "Loi! SDT phai co dung 10 chu so.\n";
    }
}

// Ham kiem tra nam nhuan (chia het cho 4 nhung khong chia het cho 100, HOAC chia het cho 400)
bool LaNamNhuan(int nam) {
    return (nam % 4 == 0 && nam % 100 != 0) || (nam % 400 == 0);
}

// Ham kiem tra ngay thang hop le (format DD/MM/YYYY) - kiem tra dinh dang, gia tri, nam nhuan
bool KTraNgay(const string& ngay) {
    if (ngay.length() != 10 || ngay[2] != '/' || ngay[5] != '/') return false;
    for (int i = 0; i < 10; i++)
        if (i != 2 && i != 5 && !isdigit(ngay[i])) return false;
    int dd = stoi(ngay.substr(0, 2));   // Tach ngay
    int mm = stoi(ngay.substr(3, 2));   // Tach thang
    int yyyy = stoi(ngay.substr(6, 4)); // Tach nam
    if (yyyy < 1900 || yyyy > 2100 || mm < 1 || mm > 12) return false;
    // Tinh so ngay trong thang: thang 2 co 29 ngay neu nam nhuan, cac thang khac co 30 hoac 31
    int soNgayTrongThang = (mm == 2) ? (LaNamNhuan(yyyy) ? 29 : 28) :
                           (mm == 4 || mm == 6 || mm == 9 || mm == 11) ? 30 : 31;
    return dd >= 1 && dd <= soNgayTrongThang;
}

// Ham nhap ngay voi validation (lap lai cho den khi nhap ngay hop le)
string NhapNgayChuan(const string& msg) {
    string ngay;
    while (true) {
        cout << msg << " (DD/MM/YYYY): ";
        cin >> ngay;
        if (KTraNgay(ngay)) return ngay;
        cout << "Loi! Ngay khong hop le. Vui long nhap dung dinh dang DD/MM/YYYY (VD: 25/12/2024).\n";
    }
}

// Ham so sanh 2 ngay (tra ve true neu ngay1 < ngay2) - dung de kiem tra ngay ket thuc sau ngay bat dau
bool SoSanhNgay(const string& ngay1, const string& ngay2) {
    int yyyy1 = stoi(ngay1.substr(6, 4)), mm1 = stoi(ngay1.substr(3, 2)), dd1 = stoi(ngay1.substr(0, 2));
    int yyyy2 = stoi(ngay2.substr(6, 4)), mm2 = stoi(ngay2.substr(3, 2)), dd2 = stoi(ngay2.substr(0, 2));
    return (yyyy1 < yyyy2) || (yyyy1 == yyyy2 && mm1 < mm2) || (yyyy1 == yyyy2 && mm1 == mm2 && dd1 < dd2);
}

// Khai bao truoc (forward declaration) de tranh loi khi cac class tham chieu lan nhau
class KhachHang; 
class Phong;

// Class Nguoi: class cha chua thong tin co ban cua mot nguoi (ke thua cho KhachHang)
class Nguoi {
protected:
    // protected: class con co the truy cap truc tiep (khac private)
    string hoTen, ngaySinh, cccd, sdt, queQuan;
public:
    Nguoi() {}
    virtual ~Nguoi() {} // virtual: cho phep class con ghi de ham huy
    void SetCCCD(string id) { cccd = id; }
    string GetCCCD() const { return cccd; }
    string GetHoTen() const { return hoTen; }
    // virtual: cho phep class con ghi de ham nay
    virtual void NhapCoBan() {
        hoTen = NhapHoTenChuan();
        ngaySinh = NhapNgayChuan("Ngay sinh");
        sdt = NhapSDTChuan();
        XoaBuffer();
        cout << "Que quan: "; getline(cin, queQuan);
    }
    virtual void Xuat() const {
        cout << "Ho ten: " << hoTen << "\n";
        cout << "CCCD: " << cccd << "\n"; 
        cout << "Ngay sinh: " << ngaySinh << "\n";
        cout << "SDT: " << sdt << "\n";
        cout << "Que quan: " << queQuan << "\n";
    }
    // Friend function: dinh nghia lai phep toan nhap (cin >> nguoi) - dung de doc tu file
    friend istream& operator>>(istream& is, Nguoi& n) {
        getline(is, n.hoTen);
        getline(is, n.ngaySinh);
        getline(is, n.cccd);
        getline(is, n.sdt);
        getline(is, n.queQuan);
        return is;
    }
    // Friend function: dinh nghia lai phep toan xuat (cout << nguoi) - dung de ghi ra file
    friend ostream& operator<<(ostream& os, const Nguoi& n) {
        os << n.hoTen << "\n" << n.ngaySinh << "\n" << n.cccd << "\n" << n.sdt << "\n" << n.queQuan << "\n";
        return os;
    }
};

// Class KhachHang: ke thua tu class Nguoi, them maKH va xe
// ": public Nguoi" ke thua tat ca thuoc tinh va phuong thuc tu class Nguoi
class KhachHang : public Nguoi {
private:
    string maKH, xe;
public:
    // Nhap thong tin khach hang (kiem tra CCCD khong bi trung)
    void Nhap(const vector<KhachHang>& dsKhach) {
        cout << "Ma khach hang: "; cin >> maKH;
        string tempCCCD;
        while (true) {
            cout << "CCCD (12 so): "; cin >> tempCCCD;
            if (!KTraSo(tempCCCD, 12)) {
                cout << "Loi! CCCD phai du 12 so.\n";
                continue;
            }
            // Kiem tra CCCD co bi trung voi khach hang khac khong
            bool biTrung = false;
            for (const auto& k : dsKhach)
                if (k.GetCCCD() == tempCCCD) { biTrung = true; break; }
            if (biTrung) cout << "Loi! So CCCD nay da ton tai.\n";
            else { this->SetCCCD(tempCCCD); break; }
        }
        Nguoi::NhapCoBan(); // Goi ham nhap tu class cha
        cout << "Thong tin xe: "; getline(cin, xe);
    }
    void Xuat() const override { // override: ghi de ham Xuat() cua class cha
        cout << "\n--- KHACH HANG: " << maKH << " ---\n";
        Nguoi::Xuat();
        cout << "Xe: " << xe << "\n";
    }
    string GetMa() const { return maKH; }
    friend istream& operator>>(istream& is, KhachHang& kh) {
        getline(is, kh.maKH);
        is >> static_cast<Nguoi&>(kh); // Doc thong tin tu lop cha
        is.ignore();
        getline(is, kh.xe);
        return is;
    }
    friend ostream& operator<<(ostream& os, const KhachHang& kh) {
        os << kh.maKH << "\n" << static_cast<const Nguoi&>(kh) << kh.xe << "\n";
        return os;
    }
};

class ThietBi {
private:
    string ten, tinhTrang;
    long giaTri;
public:
    ThietBi() : giaTri(0), tinhTrang("Tot") {}
    void Nhap() {
        XoaBuffer();
        cout << "Ten thiet bi: "; getline(cin, ten);
        giaTri = NhapTien("Gia tri");
        tinhTrang = "Tot";
    }
    void Xuat() const {
        cout << "  - " << ten << " (" << giaTri << " VND)\n";
    }
    long GetGiaTri() const { return giaTri; } // Getter de lay gia tri thiet bi
    // Ham helper de doc tu file (cho friend functions cua Phong)
    void DocTuFile(istream& is) {
        getline(is, ten);
        is >> giaTri;
        is.ignore();
        getline(is, tinhTrang);
    }
    // Ham helper de ghi ra file (cho friend functions cua Phong)
    void GhiRaFile(ostream& os) const {
        os << ten << "\n";
        os << giaTri << "\n";
        os << tinhTrang << "\n";
    }
    friend class Phong;
};

class Phong {
private:
    string soPhong, trangThai;
    double dienTich;
    long giaThue;
    vector<ThietBi> dsThietBi; // Danh sach thiet bi trong phong (Composition)
public:
    Phong() : dienTich(0), giaThue(0), trangThai("Trong") {}
    
    void Nhap(const vector<Phong>& dsPhong) {
        string tempSo;
        while (true) {
            cout << "So phong (VD: P101): "; cin >> tempSo;
            bool biTrung = false;
            for (const auto& p : dsPhong)
                if (p.GetSo() == tempSo) { biTrung = true; break; }
            if (biTrung) cout << "Loi! Phong nay da co roi.\n";
            else { soPhong = tempSo; break; }
        }
        dienTich = NhapSoThuc("Dien tich (m2)");
        giaThue = NhapTien("Gia thue");
        int n = NhapSo("So luong thiet bi");
        for (int i = 0; i < n; i++) {
            ThietBi tb;
            tb.Nhap();
            dsThietBi.push_back(tb);
        }
        trangThai = "Trong";
    }
    
    void Xuat() const {
        cout << "\n--- PHONG " << soPhong << " ---\n";
        cout << "Dien tich: " << dienTich << " m2\n";
        cout << "Gia thue: " << giaThue << " VND\n";
        cout << "Trang thai: " << trangThai << "\n";
        cout << "Thiet bi:";
        if (dsThietBi.empty()) {
            cout << " Khong co\n";
        } else {
            cout << "\n";
            for (const auto& tb : dsThietBi)
                tb.Xuat();
        }
    }
    
    string GetSo() const { return soPhong; }
    string GetTT() const { return trangThai; }
    void SetTT(string tt) { trangThai = tt; }
    long GetGia() const { return giaThue; }
    double GetDienTich() const { return dienTich; }
    // Ham tinh tong gia tri thiet bi trong phong
    // Duyet qua tat ca thiet bi va cong gia tri cua chung lai
    long TinhTongGiaTriThietBi() const {
        long tong = 0;
        for (const auto& tb : dsThietBi)
            tong += tb.GetGiaTri(); // Lay gia tri thiet bi qua getter
        return tong;
    }
    // Ham lay so luong thiet bi trong phong
    int GetSoLuongThietBi() const { return dsThietBi.size(); }
    
    friend istream& operator>>(istream& is, Phong& p) {
        getline(is, p.soPhong);
        is >> p.dienTich >> p.giaThue;
        is.ignore();
        getline(is, p.trangThai);
        int soThietBi;
        is >> soThietBi;
        is.ignore();
        p.dsThietBi.clear();
        for (int i = 0; i < soThietBi; i++) {
            ThietBi tb;
            tb.DocTuFile(is);
            p.dsThietBi.push_back(tb);
        }
        return is;
    }
    
    friend ostream& operator<<(ostream& os, const Phong& p) {
        os << p.soPhong << "\n";
        os << p.dienTich << " " << p.giaThue << "\n";
        os << p.trangThai << "\n";
        os << p.dsThietBi.size() << "\n";
        for (const auto& tb : p.dsThietBi)
            tb.GhiRaFile(os);
        return os;
    }
};

class HopDong {
private:
    string maHD, maPhong;
    vector<string> dsKhach; // Luu ma khach hang
    string ngayBD, ngayKT;
    long tienCoc;
    bool trangThai; // true = dang thue, false = da ket thuc
public:
    HopDong() : tienCoc(0), trangThai(true) {}
    
    void Tao(const vector<Phong>& dsPhong, const vector<KhachHang>& dsKhachHang) {
        cout << "Ma hop dong: "; cin >> maHD;
        while(true) {
            cout << "Ma phong: "; cin >> maPhong;
            bool timThay = false;
            for(const auto& p : dsPhong)
                if(p.GetSo() == maPhong) { timThay = true; break; }
            if(timThay) break;
            cout << "Loi! Phong khong ton tai trong he thong.\n";
        }
        int n = NhapSo("So luong khach o");
        dsKhach.clear(); // Xoa danh sach cu neu co
        for (int i = 0; i < n; i++) {
            string ma;
            while (true) {
                cout << "Ma khach hang thu " << (i+1) << ": "; cin >> ma;
                // Kiem tra khach hang co ton tai khong
                bool timThay = false;
                for (const auto& kh : dsKhachHang)
                    if (kh.GetMa() == ma) { timThay = true; break; }
                if (timThay) {
                    dsKhach.push_back(ma);
                    break;
                }
                cout << "Loi! Khach hang khong ton tai trong he thong.\n";
            }
        }
        ngayBD = NhapNgayChuan("Ngay bat dau");
        while (true) {
            ngayKT = NhapNgayChuan("Ngay ket thuc");
            if (SoSanhNgay(ngayBD, ngayKT)) break;
            cout << "Loi! Ngay ket thuc phai sau ngay bat dau.\n";
        }
        tienCoc = NhapTien("Tien coc");
    }
    
    void Xuat() const {
        cout << "\n--- HOP DONG " << maHD << " ---\n";
        cout << "Phong: " << maPhong << "\n";
        cout << "Thoi han: " << ngayBD << " - " << ngayKT << "\n";
        cout << "Coc: " << tienCoc << " VND\n";
        cout << "Trang thai: " << (trangThai ? "Hieu luc" : "Ket thuc") << "\n";
    }
    void KetThuc() { trangThai = false; }
    string GetMa() const { return maHD; }
    string GetPhong() const { return maPhong; }
    bool HieuLuc() const { return trangThai; }
    
    // Friend function: dinh nghia lai phep toan nhap (cin >> hopdong) - dung de doc tu file
    friend istream& operator>>(istream& is, HopDong& hd) {
        getline(is, hd.maHD);
        getline(is, hd.maPhong);
        int soKhach;
        is >> soKhach;
        is.ignore();
        hd.dsKhach.clear();
        for (int i = 0; i < soKhach; i++) {
            string ma;
            getline(is, ma);
            hd.dsKhach.push_back(ma);
        }
        getline(is, hd.ngayBD);
        getline(is, hd.ngayKT);
        is >> hd.tienCoc;
        is >> hd.trangThai;
        is.ignore();
        return is;
    }
    
    // Friend function: dinh nghia lai phep toan xuat (cout << hopdong) - dung de ghi ra file
    friend ostream& operator<<(ostream& os, const HopDong& hd) {
        os << hd.maHD << "\n";
        os << hd.maPhong << "\n";
        os << hd.dsKhach.size() << "\n";
        for (const auto& ma : hd.dsKhach)
            os << ma << "\n";
        os << hd.ngayBD << "\n";
        os << hd.ngayKT << "\n";
        os << hd.tienCoc << "\n";
        os << hd.trangThai << "\n";
        return os;
    }
};

class DichVu {
private:
    string ten, donVi;
    long donGia;
public:
    DichVu(string t, long g, string dv) : ten(t), donGia(g), donVi(dv) {}
    void Xuat() const { cout << "  " << ten << ": " << donGia << " VND/" << donVi << "\n"; }
    string GetTen() const { return ten; }
    long GetGia() const { return donGia; }
    void SetGia(long g) { donGia = g; }
};

long TinhTienDienBacThang(int soDien) {
    const int bac1 = 50, bac2 = 100, bac3 = 200, bac4 = 300, bac5 = 400;
    const long giaBac1 = 3000, giaBac2 = 3100, giaBac3 = 3200, 
               giaBac4 = 3300, giaBac5 = 3400, giaBac6 = 3500;
    const double thueVAT = 0.08;
    
    long tienDien = 0;
    
    if (soDien <= 0) return 0;
    if (soDien <= bac1) {
        tienDien = soDien * giaBac1;
    } else if (soDien <= bac2) {
        tienDien = soDien * giaBac2;
    } else if (soDien <= bac3) {
        tienDien = soDien * giaBac3;
    } else if (soDien <= bac4) {
        tienDien = soDien * giaBac4;
    } else if (soDien <= bac5) {
        tienDien = soDien * giaBac5;
    } else {
        tienDien = soDien * giaBac6;
    }
    
    long tienThue = (long)(tienDien * thueVAT);
    long tongTien = tienDien + tienThue;
    
    return tongTien;
}

// Class HoaDon: luu tru thong tin hoa don thue phong
class HoaDon {
private:
    string maHD, maHopDong, trangThai;
    int thang, nam;
    int dienCu, dienMoi, nuocCu, nuocMoi; // So dien/nuoc cu va moi de tinh tien
    long tienDien, tienNet, tienVS, phuPhi, giamGia, tongTien; // Them tienDien de luu tien dien theo bac thang
public:
    HoaDon() : thang(0), nam(0), dienCu(0), dienMoi(0), 
               nuocCu(0), nuocMoi(0), tienDien(0), tienNet(0), tienVS(0),
               phuPhi(0), giamGia(0), tongTien(0), trangThai("Chua TT") {}
    
    // Ham lap hoa don: nhap thong tin va tinh toan tong tien
    void Lap(const string& maHDInput, const string& maHDInput2, long giaThue, long giaDien, long giaNuoc) {
        maHD = maHDInput;
        maHopDong = maHDInput2;
        cout << "Ma hoa don: " << maHD << "\n";
        cout << "Ma hop dong: " << maHopDong << "\n";
        // Kiem tra thang hop le (1-12)
        while (true) {
            thang = NhapSo("Thang (1-12)");
            if (thang >= 1 && thang <= 12) break;
            cout << "Loi! Thang phai tu 1 den 12.\n";
        }
        // Kiem tra nam hop le (1900-2100)
        while (true) {
            nam = NhapSo("Nam");
            if (nam >= 1900 && nam <= 2100) break;
            cout << "Loi! Nam phai tu 1900 den 2100.\n";
        }
        dienCu = NhapSo("So dien cu");
        // Kiem tra so dien moi phai >= so dien cu (logic: so moi khong the nho hon so cu)
        while (true) {
            dienMoi = NhapSo("So dien moi");
            if (dienMoi >= dienCu) break;
            cout << "Loi! So dien moi phai lon hon hoac bang so cu.\n";
        }
        nuocCu = NhapSo("So nuoc cu");
        // Kiem tra so nuoc moi phai >= so nuoc cu
        while (true) {
            nuocMoi = NhapSo("So nuoc moi");
            if (nuocMoi >= nuocCu) break;
            cout << "Loi! So nuoc moi phai lon hon hoac bang so cu.\n";
        }
        tienNet = NhapTien("Tien Internet");
        tienVS = NhapTien("Tien ve sinh");
        phuPhi = NhapTien("Phu phi (neu co)");
        giamGia = NhapTien("Giam gia (neu co)");
        // Tinh tien dien theo bac thang (da bao gom VAT 8%)
        int soDienTieuThu = dienMoi - dienCu;
        tienDien = TinhTienDienBacThang(soDienTieuThu);
        // Tinh tien nuoc (tinh don gian theo so luong)
        long tienNuoc = (nuocMoi - nuocCu) * giaNuoc;
        // Tinh toan tong tien: tien phong + tien dien (theo bac thang) + tien nuoc + dich vu khac + phu phi - giam gia
        tongTien = giaThue + tienDien + tienNuoc + tienNet + tienVS + phuPhi - giamGia;
    }
    
    void Xuat(long giaDien, long giaNuoc, long giaThue) const {
        cout << "\n======= HOA DON " << maHD << " =======\n";
        cout << "Thoi gian: " << thang << "/" << nam << "\n";
        cout << "Tien phong: " << giaThue << " VND\n";
        int soDienTieuThu = dienMoi - dienCu;
        cout << "Dien: " << soDienTieuThu << " so (tinh theo bac thang, da bao gom VAT 8%) = " << tienDien << " VND\n";
        cout << "Nuoc: " << (nuocMoi-nuocCu) << " so x " << giaNuoc << " = " << (nuocMoi-nuocCu)*giaNuoc << " VND\n";
        cout << "Dich vu khac: " << tienNet + tienVS << " VND\n";
        cout << "Tong cong: " << tongTien << " VND\n";
        cout << "Trang thai: " << trangThai << "\n";
        cout << "==============================\n";
    }
    void ThanhToan() { trangThai = "Da TT"; }
    string GetMa() const { return maHD; }
    string GetTT() const { return trangThai; }
    int GetThang() const { return thang; }
    int GetNam() const { return nam; }
    long GetTong() const { return tongTien; }
    string GetMaHopDong() const { return maHopDong; }
    
    friend istream& operator>>(istream& is, HoaDon& hd) {
        getline(is, hd.maHD);
        getline(is, hd.maHopDong);
        is >> hd.thang >> hd.nam;
        is >> hd.dienCu >> hd.dienMoi >> hd.nuocCu >> hd.nuocMoi;
        is >> hd.tienDien >> hd.tienNet >> hd.tienVS >> hd.phuPhi >> hd.giamGia >> hd.tongTien;
        is.ignore();
        getline(is, hd.trangThai);
        return is;
    }
    
    friend ostream& operator<<(ostream& os, const HoaDon& hd) {
        os << hd.maHD << "\n";
        os << hd.maHopDong << "\n";
        os << hd.thang << " " << hd.nam << "\n";
        os << hd.dienCu << " " << hd.dienMoi << " " << hd.nuocCu << " " << hd.nuocMoi << "\n";
        os << hd.tienDien << " " << hd.tienNet << " " << hd.tienVS << " " << hd.phuPhi << " " << hd.giamGia << " " << hd.tongTien << "\n";
        os << hd.trangThai << "\n";
        return os;
    }
};

// Class QL: quan ly toan bo he thong
// Chua tat ca danh sach (phong, khach hang, hop dong, hoa don, dich vu) va cac chuc nang quan ly
class QL {
private:
    vector<Phong> dsPhong;      // Danh sach cac phong (vector la mang dong co the them/bot phan tu)
    vector<KhachHang> dsKhach;  // Danh sach cac khach hang
    vector<HopDong> dsHD;       // Danh sach cac hop dong thue phong
    vector<DichVu> dsDV;        // Danh sach cac dich vu (dien, nuoc, internet, ve sinh)
    vector<HoaDon> dsHoaDon;    // Danh sach cac hoa don da lap
public:
    // Ham tao: khoi tao gia tri ban dau cho cac dich vu mac dinh
    QL() {
        dsDV.push_back(DichVu("Dien", 3500, "kWh"));        // Dien: 3500 VND/kWh
        dsDV.push_back(DichVu("Nuoc", 5000, "m3"));         // Nuoc: 5000 VND/m3
        dsDV.push_back(DichVu("Internet", 100000, "thang")); // Internet: 100000 VND/thang
        dsDV.push_back(DichVu("Ve sinh", 50000, "thang"));  // Ve sinh: 50000 VND/thang
    }
    
    void ThemPhong() {
        cout << "\n=== THEM PHONG ===\n";
        Phong p;
        p.Nhap(dsPhong);
        dsPhong.push_back(p);
        cout << "=> Them thanh cong!\n";
        Dung();
    }
    
    void XemPhong() const {
        cout << "\n=== DANH SACH PHONG ===\n";
        if (dsPhong.empty()) cout << "Danh sach trong!\n";
        else
            for (const auto& p : dsPhong) p.Xuat();
        Dung();
    }
    
    void TimPhong() const {
        cout << "\n=== TIM PHONG ===\n";
        string so; cout << "Nhap so phong: "; cin >> so;
        for (const auto& p : dsPhong)
            if (p.GetSo() == so) { p.Xuat(); Dung(); return; }
        cout << "Khong tim thay phong " << so << "!\n"; Dung();
    }
    
    // Ham helper: tim phong theo so phong, tra ve con tro hoac nullptr neu khong tim thay
    const Phong* TimPhongTheoSo(const string& soPhong) const {
        for (const auto& p : dsPhong)
            if (p.GetSo() == soPhong) return &p;
        return nullptr;
    }
    
    // Ham so sanh 2 phong tro voi nhau
    // So sanh theo nhieu tieu chi: gia thue, dien tich, tong gia tri thiet bi
    void SoSanhPhong() const {
        cout << "\n=== SO SANH 2 PHONG ===\n";
        if (dsPhong.size() < 2) { cout << "Can it nhat 2 phong de so sanh!\n"; Dung(); return; }
        // Nhap va tim phong thu nhat
        string so1; cout << "Nhap so phong thu nhat: "; cin >> so1;
        const Phong* p1 = TimPhongTheoSo(so1);
        if (!p1) { cout << "Khong tim thay phong " << so1 << "!\n"; Dung(); return; }
        // Nhap va tim phong thu hai
        string so2; cout << "Nhap so phong thu hai: "; cin >> so2;
        const Phong* p2 = TimPhongTheoSo(so2);
        if (!p2) { cout << "Khong tim thay phong " << so2 << "!\n"; Dung(); return; }
        if (so1 == so2) { cout << "Loi! Khong the so sanh phong voi chinh no!\n"; Dung(); return; }
        // Hien thi thong tin va so sanh
        cout << "\n--- THONG TIN 2 PHONG ---\n";
        p1->Xuat();
        p2->Xuat();
        cout << "\n--- KET QUA SO SANH ---\n";
        // So sanh gia thue
        long gia1 = p1->GetGia(), gia2 = p2->GetGia();
        if (gia1 > gia2) cout << "Gia thue: Phong " << so1 << " dat hon " << (gia1 - gia2) << " VND\n";
        else if (gia2 > gia1) cout << "Gia thue: Phong " << so2 << " dat hon " << (gia2 - gia1) << " VND\n";
        else cout << "Gia thue: Hai phong bang nhau (" << gia1 << " VND)\n";
        // So sanh dien tich
        double dt1 = p1->GetDienTich(), dt2 = p2->GetDienTich();
        if (dt1 > dt2) cout << "Dien tich: Phong " << so1 << " rong hon " << (dt1 - dt2) << " m2\n";
        else if (dt2 > dt1) cout << "Dien tich: Phong " << so2 << " rong hon " << (dt2 - dt1) << " m2\n";
        else cout << "Dien tich: Hai phong bang nhau (" << dt1 << " m2)\n";
        // So sanh tong gia tri thiet bi
        long gt1 = p1->TinhTongGiaTriThietBi(), gt2 = p2->TinhTongGiaTriThietBi();
        if (gt1 > gt2) cout << "Tong gia tri thiet bi: Phong " << so1 << " cao hon " << (gt1 - gt2) << " VND\n";
        else if (gt2 > gt1) cout << "Tong gia tri thiet bi: Phong " << so2 << " cao hon " << (gt2 - gt1) << " VND\n";
        else cout << "Tong gia tri thiet bi: Hai phong bang nhau (" << gt1 << " VND)\n";
        Dung();
    }
    
    void ThemKhach() {
        cout << "\n=== THEM KHACH ===\n";
        KhachHang kh;
        kh.Nhap(dsKhach);
        dsKhach.push_back(kh);
        cout << "=> Them thanh cong!\n"; Dung();
    }
    
    void XemKhach() const {
        cout << "\n=== DANH SACH KHACH ===\n";
        if (dsKhach.empty()) cout << "Danh sach trong!\n";
        else
            for (const auto& k : dsKhach) k.Xuat();
        Dung();
    }
    
    // Ham kiem tra xem phong da co hop dong hieu luc chua
    // Tra ve: true neu phong da co hop dong dang hieu luc, false neu chua
    bool KiemTraPhongDaThue(const string& maPhong) const {
        for (const auto& hd : dsHD)
            if (hd.GetPhong() == maPhong && hd.HieuLuc())
                return true;
        return false;
    }
    
    // Ham tao hop dong thue phong
    // Kiem tra phong chua co hop dong hieu luc, sau do tao hop dong va cap nhat trang thai phong
    void TaoHD() {
        cout << "\n=== TAO HOP DONG ===\n";
        if (dsPhong.empty()) { cout << "Can phai co phong truoc!\n"; Dung(); return; }
        if (dsKhach.empty()) { cout << "Can phai co khach hang truoc!\n"; Dung(); return; }
        HopDong hd; hd.Tao(dsPhong, dsKhach);
        // Kiem tra phong da co hop dong hieu luc chua (moi phong chi co 1 hop dong tai 1 thoi diem)
        if (KiemTraPhongDaThue(hd.GetPhong())) {
            cout << "Loi! Phong nay da co hop dong hieu luc. Moi phong chi duoc co 1 hop dong tai thoi diem do.\n";
            Dung(); return;
        }
        dsHD.push_back(hd); // Them hop dong vao danh sach
        // Cap nhat trang thai phong thanh "Da thue"
        for (auto& p : dsPhong)
            if (p.GetSo() == hd.GetPhong()) { p.SetTT("Da thue"); break; }
        cout << "=> Tao hop dong thanh cong!\n"; Dung();
    }
    
    // Ham tra phong (ket thuc hop dong)
    // Tim hop dong theo ma, ket thuc hop dong va cap nhat trang thai phong thanh "Trong"
    void TraPhong() {
        cout << "\n=== TRA PHONG ===\n";
        string ma; cout << "Nhap ma hop dong: "; cin >> ma;
        for (auto& hd : dsHD) {
            if (hd.GetMa() == ma && hd.HieuLuc()) {
                hd.KetThuc(); // Dat trang thai hop dong thanh false (ket thuc)
                // Cap nhat trang thai phong thanh "Trong" de co the cho thue lai
                for (auto& p : dsPhong)
                    if (p.GetSo() == hd.GetPhong()) { p.SetTT("Trong"); break; }
                cout << "=> Tra phong thanh cong!\n"; Dung(); return;
            }
        }
        cout << "Khong tim thay hop dong hop le!\n"; Dung();
    }
    
    // Ham lap hoa don cho hop dong
    // Tim hop dong hop le, lay gia thue tu phong, sau do lap hoa don voi cac chi so dien/nuoc
    void LapHD() {
        cout << "\n=== LAP HOA DON ===\n";
        if (dsHD.empty()) { cout << "Can phai co hop dong truoc!\n"; Dung(); return; }
        string maHD; cout << "Ma hop dong: "; cin >> maHD;
        // Tim hop dong theo ma va kiem tra con hieu luc khong
        string maPhong = "";
        for (const auto& hd : dsHD)
            if (hd.GetMa() == maHD && hd.HieuLuc()) { maPhong = hd.GetPhong(); break; }
        if (maPhong.empty()) { cout << "Khong tim thay hop dong hop le!\n"; Dung(); return; }
        // Tim phong tuong ung de lay gia thue
        long giaThue = 0;
        for (const auto& p : dsPhong)
            if (p.GetSo() == maPhong) { giaThue = p.GetGia(); break; }
        if (!giaThue) { cout << "Khong tim thay phong!\n"; Dung(); return; }
        string maHoaDon; cout << "Ma hoa don: "; cin >> maHoaDon;
        HoaDon hd;
        // Lap hoa don voi gia thue, gia dien (dsDV[0]), gia nuoc (dsDV[1])
        hd.Lap(maHoaDon, maHD, giaThue, dsDV[0].GetGia(), dsDV[1].GetGia());
        dsHoaDon.push_back(hd);
        cout << "=> Lap hoa don thanh cong!\n"; Dung();
    }
    
    void XuatHD() const {
        cout << "\n=== XUAT HOA DON ===\n";
        string ma; cout << "Nhap ma hoa don: "; cin >> ma;
        for (const auto& hd : dsHoaDon)
            if (hd.GetMa() == ma) {
                string maPhong = "";
                for (const auto& h : dsHD)
                    if (h.GetMa() == hd.GetMaHopDong()) { maPhong = h.GetPhong(); break; }
                long giaThue = 0;
                if (!maPhong.empty())
                    for (const auto& p : dsPhong)
                        if (p.GetSo() == maPhong) { giaThue = p.GetGia(); break; }
                hd.Xuat(dsDV[0].GetGia(), dsDV[1].GetGia(), giaThue);
                Dung();
                return;
            }
        cout << "Khong tim thay!\n"; Dung();
    }
    
    void ThanhToan() {
        cout << "\n=== THANH TOAN ===\n";
        string ma; cout << "Nhap ma hoa don: "; cin >> ma;
        for (auto& hd : dsHoaDon)
            if (hd.GetMa() == ma) {
                hd.ThanhToan();
                cout << "=> Da cap nhat thanh toan!\n";
                Dung();
                return;
            }
        cout << "Khong tim thay!\n"; Dung();
    }
    
    void QLDV() {
        cout << "\n=== QUAN LY GIA DICH VU ===\n";
        for (size_t i = 0; i < dsDV.size(); i++) {
            cout << (i+1) << ". ";
            dsDV[i].Xuat();
        }
        int chon = NhapSo("Chon dich vu muon sua (0=Huy)");
        if (chon > 0 && chon <= (int)dsDV.size()) {
            long gia = NhapTien("Nhap gia moi");
            dsDV[chon-1].SetGia(gia);
            cout << "=> Cap nhat xong!\n";
        }
        Dung();
    }
    
    void ThongKe() const {
        cout << "\n=== MENU THONG KE ===\n";
        cout << "1. Theo thang\n2. Theo quy\n3. Theo nam\n";
        int chon = NhapSo("Chon");
        long tong = 0; int nam;
        if (chon == 1) {
            int thang;
            while (true) {
                thang = NhapSo("Thang (1-12)");
                if (thang >= 1 && thang <= 12) break;
                cout << "Loi! Thang phai tu 1 den 12.\n";
            }
            while (true) {
                nam = NhapSo("Nam");
                if (nam >= 1900 && nam <= 2100) break;
                cout << "Loi! Nam phai tu 1900 den 2100.\n";
            }
            for (const auto& hd : dsHoaDon)
                if (hd.GetThang() == thang && hd.GetNam() == nam && hd.GetTT() == "Da TT")
                    tong += hd.GetTong();
            cout << "Doanh thu thang " << thang << "/" << nam << ": " << tong << " VND\n";
        } else if (chon == 2) {
            int quy;
            while (true) {
                quy = NhapSo("Quy (1-4)");
                if (quy >= 1 && quy <= 4) break;
                cout << "Loi! Quy phai tu 1 den 4.\n";
            }
            while (true) {
                nam = NhapSo("Nam");
                if (nam >= 1900 && nam <= 2100) break;
                cout << "Loi! Nam phai tu 1900 den 2100.\n";
            }
            int tStart = (quy-1)*3 + 1;
            for (const auto& hd : dsHoaDon)
                if (hd.GetNam() == nam && hd.GetThang() >= tStart && hd.GetThang() <= tStart+2 && hd.GetTT() == "Da TT")
                    tong += hd.GetTong();
            cout << "Doanh thu quy " << quy << "/" << nam << ": " << tong << " VND\n";
        } else if (chon == 3) {
            while (true) {
                nam = NhapSo("Nam");
                if (nam >= 1900 && nam <= 2100) break;
                cout << "Loi! Nam phai tu 1900 den 2100.\n";
            }
            for (const auto& hd : dsHoaDon)
                if (hd.GetNam() == nam && hd.GetTT() == "Da TT")
                    tong += hd.GetTong();
            cout << "Tong doanh thu nam " << nam << ": " << tong << " VND\n";
        }
        Dung();
    }
    
    // Ham doc du lieu tu file vao bo nho khi khoi dong chuong trinh
    // Doc cac file: phong.txt, khachhang.txt, hopdong.txt, hoadon.txt
    void DocDuLieu() {
        // Doc file phong.txt
        ifstream filePhong("phong.txt");
        if (filePhong.is_open()) {
            int n; filePhong >> n; filePhong.ignore(); // Doc so luong phong
            dsPhong.clear(); // Xoa du lieu cu neu co
            for (int i = 0; i < n; i++) {
                Phong p;
                filePhong >> p; // Doc thong tin phong (dung operator>>)
                dsPhong.push_back(p);
            }
            filePhong.close();
            cout << "=> Da doc " << dsPhong.size() << " phong tu file.\n";
        }
        // Doc file khachhang.txt
        ifstream fileKhach("khachhang.txt");
        if (fileKhach.is_open()) {
            int n; fileKhach >> n; fileKhach.ignore();
            dsKhach.clear();
            for (int i = 0; i < n; i++) {
                KhachHang kh;
                fileKhach >> kh;
                dsKhach.push_back(kh);
            }
            fileKhach.close();
            cout << "=> Da doc " << dsKhach.size() << " khach hang tu file.\n";
        }
        // Doc file hopdong.txt
        ifstream fileHopDong("hopdong.txt");
        if (fileHopDong.is_open()) {
            int n; fileHopDong >> n; fileHopDong.ignore();
            dsHD.clear();
            for (int i = 0; i < n; i++) {
                HopDong hd;
                fileHopDong >> hd;
                dsHD.push_back(hd);
            }
            fileHopDong.close();
            cout << "=> Da doc " << dsHD.size() << " hop dong tu file.\n";
        }
        // Doc file hoadon.txt
        ifstream fileHoaDon("hoadon.txt");
        if (fileHoaDon.is_open()) {
            int n; fileHoaDon >> n; fileHoaDon.ignore();
            dsHoaDon.clear();
            for (int i = 0; i < n; i++) {
                HoaDon hd;
                fileHoaDon >> hd;
                dsHoaDon.push_back(hd);
            }
            fileHoaDon.close();
            cout << "=> Da doc " << dsHoaDon.size() << " hoa don tu file.\n";
        }
    }
    
    // Ham ghi du lieu tu bo nho ra file de luu tru
    // Ghi vao cac file: phong.txt, khachhang.txt, hopdong.txt, hoadon.txt
    void GhiDuLieu() const {
        // Ghi file phong.txt
        ofstream filePhong("phong.txt");
        if (filePhong.is_open()) {
            filePhong << dsPhong.size() << "\n"; // Ghi so luong phong
            for (const auto& p : dsPhong)
                filePhong << p; // Ghi thong tin phong (dung operator<<)
            filePhong.close();
            cout << "=> Da luu " << dsPhong.size() << " phong vao file.\n";
        }
        // Ghi file khachhang.txt
        ofstream fileKhach("khachhang.txt");
        if (fileKhach.is_open()) {
            fileKhach << dsKhach.size() << "\n";
            for (const auto& kh : dsKhach)
                fileKhach << kh;
            fileKhach.close();
            cout << "=> Da luu " << dsKhach.size() << " khach hang vao file.\n";
        }
        // Ghi file hopdong.txt
        ofstream fileHopDong("hopdong.txt");
        if (fileHopDong.is_open()) {
            fileHopDong << dsHD.size() << "\n";
            for (const auto& hd : dsHD)
                fileHopDong << hd;
            fileHopDong.close();
            cout << "=> Da luu " << dsHD.size() << " hop dong vao file.\n";
        }
        // Ghi file hoadon.txt
        ofstream fileHoaDon("hoadon.txt");
        if (fileHoaDon.is_open()) {
            fileHoaDon << dsHoaDon.size() << "\n";
            for (const auto& hd : dsHoaDon)
                fileHoaDon << hd;
            fileHoaDon.close();
            cout << "=> Da luu " << dsHoaDon.size() << " hoa don vao file.\n";
        }
    }
    
    // Ham xoa toan bo du lieu (canh bao: khong the hoan tac!)
    // Xoa tat ca: phong, khach hang, hop dong, hoa don trong bo nho va file
    void XoaDuLieu() {
        cout << "\n=== XOA TOAN BO DU LIEU ===\n";
        cout << "Canh bao: Thao tac nay se xoa TOAN BO du lieu!\n";
        cout << "Ban co chac chan muon tiep tuc? (1=Co, 0=Khong): ";
        int xacNhan;
        cin >> xacNhan;
        XoaBuffer();
        if (xacNhan != 1) {
            cout << "=> Da huy thao tac.\n";
            Dung();
            return;
        }
        // Xoa du lieu trong bo nho (clear() xoa tat ca phan tu trong vector)
        dsPhong.clear();
        dsKhach.clear();
        dsHD.clear();
        dsHoaDon.clear();
        // Xoa du lieu trong file (ios::trunc: xoa het noi dung cu, ghi "0\n" de danh dau khong co du lieu)
        ofstream filePhong("phong.txt", ios::trunc);
        if (filePhong.is_open()) { filePhong << "0\n"; filePhong.close(); }
        ofstream fileKhach("khachhang.txt", ios::trunc);
        if (fileKhach.is_open()) { fileKhach << "0\n"; fileKhach.close(); }
        ofstream fileHopDong("hopdong.txt", ios::trunc);
        if (fileHopDong.is_open()) { fileHopDong << "0\n"; fileHopDong.close(); }
        ofstream fileHoaDon("hoadon.txt", ios::trunc);
        if (fileHoaDon.is_open()) { fileHoaDon << "0\n"; fileHoaDon.close(); }
        cout << "=> Da xoa toan bo du lieu thanh cong!\n";
        Dung();
    }
};

// Ham Menu hien thi menu chinh cua chuong trinh
// Ham nay in ra man hinh cac chuc nang ma nguoi dung co the chon
void Menu() {
    cout << "\n========== QUAN LY PHONG TRO ==========\n";
    cout << "1. Them phong\n2. Xem phong\n3. Tim phong\n4. So sanh 2 phong\n";
    cout << "5. Them khach\n6. Xem khach\n";
    cout << "7. Tao hop dong\n8. Tra phong\n";
    cout << "9. Lap hoa don\n10. Xuat hoa don\n11. Thanh toan hoa don\n";
    cout << "12. Quan ly gia dich vu\n13. Thong ke doanh thu\n";
    cout << "14. Xoa toan bo du lieu\n0. Thoat\n";
    cout << "=======================================\n";
}

// Ham main: Ham chinh cua chuong trinh, day la noi chuong trinh bat dau chay
int main() {
    // Tao mot doi tuong QL (quan ly) de quan ly toan bo he thong
    QL ql;
    // Doc du lieu tu cac file vao bo nho khi khoi dong chuong trinh
    // Neu co file thi se doc lai du lieu da luu truoc do
    ql.DocDuLieu();
    int chon; // Bien luu lua chon cua nguoi dung
    // Vong lap vo han (while(true)) de chuong trinh chay lien tuc
    // Chi thoat khi nguoi dung chon 0 (Thoat) hoac co lenh return
    while (true) {
        Menu(); // Hien thi menu cho nguoi dung
        chon = NhapSo("Moi chon chuc nang"); // Yeu cau nguoi dung nhap lua chon
        // Cau lenh switch: kiem tra gia tri cua bien chon
        // Tuong ung voi moi gia tri se thuc hien chuc nang khac nhau
        switch (chon) {
            case 0: // Nguoi dung chon thoat
                cout << "\n=== DANG LUU DU LIEU ===\n";
                ql.GhiDuLieu(); // Luu tat ca du lieu vao file truoc khi thoat
                cout << "Tam biet!\n"; 
                return 0; // Thoat chuong trinh (ket thuc ham main)
            case 1: ql.ThemPhong(); break;
            case 2: ql.XemPhong(); break;
            case 3: ql.TimPhong(); break;
            case 4: ql.SoSanhPhong(); break; // Chuc nang so sanh 2 phong
            case 5: ql.ThemKhach(); break;
            case 6: ql.XemKhach(); break;
            case 7: ql.TaoHD(); break;
            case 8: ql.TraPhong(); break;
            case 9: ql.LapHD(); break;
            case 10: ql.XuatHD(); break;
            case 11: ql.ThanhToan(); break;
            case 12: ql.QLDV(); break;
            case 13: ql.ThongKe(); break;
            case 14: ql.XoaDuLieu(); break;
            // default: truong hop nguoi dung nhap so khong co trong menu
            default: cout << "Chuc nang khong ton tai!\n"; Dung();
        }
        // Sau khi thuc hien xong chuc nang, quay lai vong lap while
        // Hien thi menu lai cho nguoi dung chon tiep
    }
    return 0;
}
