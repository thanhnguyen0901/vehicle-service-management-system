# Huong Dan Full Flow Su Dung He Thong VSMS

Tai lieu nay huong dan cach di qua he thong quan ly dich vu xe tu luc dang nhap, tao du lieu nen, tiep nhan xe, sua chua, xuat hoa don, thanh toan, den bao cao.

## 1. Nen bat dau bang account nao?

Neu ban moi dung he thong lan dau, nen dang nhap bang `admin` de thay du tat ca menu va tranh bi chan quyen.

### Account demo

Mat khau chung: `Demo@123`

| Username | Vai tro | Nen dung khi nao |
| --- | --- | --- |
| `admin` | Admin | Demo full flow, cau hinh du lieu, tao/sua/xoa moi module |
| `advisor` | Service Advisor | Tiep nhan khach, tao khach hang, xe, lich hen, phieu sua chua |
| `technician` | Technician | Xem va cap nhat nghiep vu ky thuat trong phieu sua chua |
| `inventory` | Inventory Clerk | Quan ly phu tung va giao dich kho |
| `cashier` | Cashier | Lap hoa don va ghi nhan thanh toan |
| `manager` | Manager | Xem bao cao, audit log, tong quan van hanh |

### Account E2E

Mat khau chung: `Admin@123`

| Username | Vai tro |
| --- | --- |
| `admin` | Admin |
| `advisor` | Service Advisor |
| `technician` | Technician |
| `inventory` | Inventory Clerk |
| `cashier` | Cashier |
| `manager` | Manager |

## 2. Chuan bi du lieu demo

Neu database chua co du lieu, chay seed demo:

```bash
DATABASE_URL='postgresql://vsms_user:vsms_password@localhost:5434/vsms_db?schema=public' npm run seed:demo --prefix apps/backend
```

Seed demo se tao san:

- Khach hang ca nhan va doanh nghiep.
- Xe gan voi khach hang.
- Lich hen o nhieu trang thai.
- Dich vu sua chua va bao duong.
- Phu tung, ton kho va giao dich nhap kho ban dau.
- Phieu sua chua mau.
- Hoa don da/chua thanh toan.
- Nhac bao duong.
- Audit log mau.

## 3. Ban do menu trong he thong

| Menu | Muc dich |
| --- | --- |
| Tong quan | Xem nhanh lich hen, xe dang sua, doanh thu |
| Khach hang | Quan ly ho so khach hang |
| Phuong tien | Quan ly xe cua khach hang |
| Lich hen | Tao/sua/huy lich hen dich vu |
| Phieu sua chua | Tiep nhan xe, them dich vu, them phu tung, cap nhat tien do |
| Dich vu | Danh muc dich vu va don gia chuan |
| Phu tung | Danh muc phu tung, gia, ton kho, muc can nhap |
| Giao dich kho | Nhap kho, xuat kho, dieu chinh ton |
| Hoa don | Lap hoa don tu phieu sua chua va ghi nhan thanh toan |
| Lich su bao duong | Tra cuu cac lan sua chua da hoan tat |
| Nhac bao duong | Tao va quan ly nhac khach quay lai bao duong |
| Bao cao | Xem doanh thu, top dich vu/phu tung, ton kho thap |
| Nhat ky | Xem audit log thao tac |
| Nguoi dung | Quan ly tai khoan va vai tro |

## 4. Flow ngan nhat de hieu he thong

Neu chi muon demo nhanh, di theo thu tu:

```text
Khach hang
-> Phuong tien
-> Dich vu
-> Phu tung
-> Giao dich kho
-> Phieu sua chua
-> Hoa don
-> Lich su bao duong
-> Bao cao
```

Y nghia:

1. Tao khach hang.
2. Tao xe cho khach hang.
3. Tao danh muc dich vu co don gia.
4. Tao phu tung va nhap ton kho.
5. Tao phieu sua chua cho xe.
6. Them dich vu/phu tung vao phieu.
7. Lap hoa don.
8. Ghi nhan thanh toan.
9. Xem lai lich su va bao cao.

## 5. Full flow A: Khach dat lich truoc

Day la flow day du cho truong hop khach dat lich hen truoc khi den garage.

### Buoc 1: Tao khach hang

Account nen dung: `admin` hoac `advisor`

Menu: `Khach hang`

Thao tac:

1. Bam `Tao khach hang`.
2. Nhap ho ten, so dien thoai, email, dia chi.
3. Neu la doanh nghiep, chon loai `Doanh nghiep` va nhap ten cong ty, ma so thue.
4. Bam `Luu`.

Ket qua mong doi:

- Khach hang xuat hien trong bang.
- Co the tim bang ten, so dien thoai, email, cong ty.

### Buoc 2: Tao phuong tien

Account nen dung: `admin` hoac `advisor`

Menu: `Phuong tien`

Thao tac:

1. Bam `Tao xe`.
2. Chon khach hang.
3. Nhap bien so, hang xe, dong xe, nam san xuat.
4. Co the nhap mau, VIN, odo.
5. Bam `Luu`.

Ket qua mong doi:

- Xe duoc gan voi khach hang.
- Xe co the duoc dung o lich hen va phieu sua chua.

### Buoc 3: Tao lich hen

Account nen dung: `admin` hoac `advisor`

Menu: `Lich hen`

Thao tac:

1. Bam `Tao lich hen`.
2. Chon xe.
3. Chon thoi gian hen.
4. Nhap nhu cau dich vu, vi du: `Bao duong dinh ky 10.000km`.
5. Bam `Luu`.

Ket qua mong doi:

- Lich hen co trang thai `Da dat`.
- Co the loc/tim lich hen theo bien so, khach hang, trang thai.

### Buoc 4: Tao phieu sua chua tu lich hen

Account nen dung: `admin` hoac `advisor`

Menu: `Phieu sua chua`

Thao tac:

1. Bam `Tao phieu`.
2. Chon nguon la lich hen neu form co lua chon nguon.
3. Chon lich hen/xe tu danh sach.
4. Nhap chan doan ban dau.
5. Bam `Luu`.

Ket qua mong doi:

- Phieu sua chua duoc tao.
- Xe/khach hang trong phieu dung voi lich hen.

### Buoc 5: Them dich vu vao phieu sua chua

Account nen dung: `admin`, `advisor` hoac `technician`

Menu: `Phieu sua chua`

Thao tac:

1. Bam icon xem chi tiet phieu.
2. Trong phan hang muc/dich vu, chon dich vu tu danh muc.
3. Nhap so luong, don gia neu can.
4. Bam nut them/luu hang muc.

Ket qua mong doi:

- Phieu co it nhat mot hang muc dich vu.
- Tong tam tinh thay doi theo hang muc.

### Buoc 6: Them phu tung su dung

Account nen dung: `admin`, `advisor`, `technician` hoac `inventory`

Dieu kien:

- Phu tung da ton tai trong `Phu tung`.
- Ton kho du de xuat/consume.

Menu: `Phieu sua chua`

Thao tac:

1. Mo chi tiet phieu.
2. Chon hang muc can gan phu tung.
3. Chon phu tung.
4. Nhap so luong.
5. Luu phu tung su dung.

Ket qua mong doi:

- Phu tung xuat hien trong phieu.
- Ton kho phu tung duoc tru theo so luong su dung.

### Buoc 7: Cap nhat trang thai phieu

Account nen dung: `admin`, `advisor`, `technician`

Menu: `Phieu sua chua`

Trang thai thuong gap:

```text
Tiep nhan
-> Chan doan
-> Dang sua
-> Cho phu tung
-> San sang giao
-> Da giao
```

Thao tac:

1. Mo chi tiet phieu.
2. Cap nhat trang thai theo tien do thuc te.
3. Khi hoan tat sua chua, chuyen sang trang thai san sang giao/da giao tuy flow hien tai.

Ket qua mong doi:

- Phieu da du dieu kien de lap hoa don khi hoan tat ky thuat.

### Buoc 8: Lap hoa don

Account nen dung: `admin` hoac `cashier`

Menu: `Hoa don`

Thao tac:

1. Bam `Lap hoa don`.
2. Chon phieu sua chua da du dieu kien lap hoa don.
3. Kiem tra thong tin tien dich vu/phu tung.
4. Nhap ghi chu neu can.
5. Bam xac nhan lap hoa don.

Ket qua mong doi:

- Hoa don duoc tao.
- Tong tien la snapshot tai thoi diem lap hoa don.

### Buoc 9: Ghi nhan thanh toan

Account nen dung: `admin` hoac `cashier`

Menu: `Hoa don`

Thao tac:

1. Mo chi tiet hoa don.
2. Chon phuong thuc thanh toan: tien mat, chuyen khoan, the.
3. Nhap so tien thanh toan.
4. Nhap ma giao dich neu co.
5. Bam ghi nhan thanh toan.

Ket qua mong doi:

- Neu thanh toan du, hoa don chuyen sang trang thai `Da thanh toan`.
- Neu thanh toan mot phan, hoa don van con so tien can thu.

### Buoc 10: Tra cuu lich su bao duong

Account nen dung: moi vai tro co quyen xem

Menu: `Lich su bao duong`

Thao tac:

1. Loc theo khach hang hoac phuong tien.
2. Tim theo bien so, ten khach hang, so dien thoai.
3. Mo chi tiet lich su neu can.

Ket qua mong doi:

- Thay cac lan sua chua da hoan tat.
- Xem duoc dich vu, phu tung, tong tien, thanh toan.

## 6. Full flow B: Khach den truc tiep khong dat lich

Dung flow nay khi khach mang xe den garage truc tiep.

```text
Khach hang
-> Phuong tien
-> Phieu sua chua
-> Them dich vu/phu tung
-> Hoa don
-> Thanh toan
-> Lich su bao duong
```

Khac voi flow A:

- Bo qua buoc `Lich hen`.
- Khi tao `Phieu sua chua`, chon nguon truc tiep tu xe/phuong tien.

## 7. Flow kho phu tung

Account nen dung: `admin` hoac `inventory`

### Tao phu tung

Menu: `Phu tung`

Thao tac:

1. Bam `Tao phu tung`.
2. Nhap ma phu tung, ten, don vi tinh.
3. Nhap gia von, gia ban.
4. Nhap ton kho ban dau va muc can nhap lai.
5. Bam `Luu`.

### Nhap kho

Menu: `Giao dich kho`

Thao tac:

1. Bam `Nhap kho`.
2. Chon phu tung.
3. Nhap so luong.
4. Nhap ghi chu.
5. Xac nhan.

### Xuat kho thu cong

Menu: `Giao dich kho`

Dung khi can xuat kho ngoai phieu sua chua.

Thao tac:

1. Bam `Xuat kho`.
2. Chon phu tung.
3. Nhap so luong.
4. Xac nhan.

### Dieu chinh ton

Menu: `Giao dich kho`

Dung khi ton thuc te lech voi he thong.

Thao tac:

1. Bam `Dieu chinh`.
2. Chon phu tung.
3. Nhap so duong de tang ton, so am de giam ton.
4. Bat buoc ghi chu ly do dieu chinh.
5. Xac nhan.

## 8. Flow nhac bao duong

Account nen dung: `admin` hoac `advisor`

Menu: `Nhac bao duong`

Thao tac:

1. Bam `Tao nhac`.
2. Chon khach hang.
3. Chon xe.
4. Chon ngay den han.
5. Nhap noi dung nhac.
6. Luu.
7. Khi da goi/SMS/email cho khach, bam danh dau da nhac.

Ket qua mong doi:

- Nhac co trang thai `Chua nhac`, `Den han` hoac `Da nhac`.

## 9. Flow quan ly nguoi dung

Account nen dung: `admin`

Menu: `Nguoi dung`

Thao tac:

1. Bam `Tao nguoi dung`.
2. Nhap username, mat khau, ho ten, email, so dien thoai.
3. Chon vai tro.
4. Luu.

Vai tro nen chon theo cong viec:

- Le tan/co van dich vu: `ServiceAdvisor`.
- Ky thuat vien: `Technician`.
- Thu kho: `InventoryClerk`.
- Thu ngan: `Cashier`.
- Quan ly: `Manager`.

## 10. Bao cao va audit log

### Bao cao

Account nen dung: `admin` hoac `manager`

Menu: `Bao cao`

Thao tac:

1. Chon tu ngay, den ngay.
2. Bam `Cap nhat`.
3. Xem doanh thu, so phieu, top dich vu, top phu tung, ton kho thap.

### Nhat ky

Account nen dung: `admin` hoac `manager`

Menu: `Nhat ky`

Thao tac:

1. Loc theo action, entity, khoang ngay.
2. Bam `Tim`.
3. Bam icon xem chi tiet log neu can.

## 11. Thu tu demo de tranh loi thieu du lieu

Neu ban demo tu database rong, nen tao theo thu tu nay:

1. `Dich vu`
2. `Phu tung`
3. `Giao dich kho`
4. `Khach hang`
5. `Phuong tien`
6. `Lich hen` neu muon demo dat lich
7. `Phieu sua chua`
8. Them dich vu/phu tung vao phieu
9. Cap nhat trang thai phieu
10. `Hoa don`
11. Thanh toan
12. `Lich su bao duong`
13. `Bao cao`
14. `Nhat ky`

## 12. Goi y demo theo tung vai tro

### Demo bang Admin

Dung khi can show full app:

1. Dang nhap `admin / Demo@123`.
2. Di qua tat ca menu.
3. Tao khach hang, xe, phieu sua chua, hoa don.
4. Xem bao cao, audit log, nguoi dung.

### Demo bang Service Advisor

Dung khi show nghiep vu tiep nhan:

1. Dang nhap `advisor / Demo@123`.
2. Tao khach hang.
3. Tao xe.
4. Tao lich hen.
5. Tao phieu sua chua.
6. Theo doi trang thai phieu.

### Demo bang Inventory Clerk

Dung khi show kho:

1. Dang nhap `inventory / Demo@123`.
2. Vao `Phu tung`.
3. Kiem tra ton thap.
4. Vao `Giao dich kho`.
5. Nhap kho/xuat kho/dieu chinh ton.

### Demo bang Cashier

Dung khi show thu ngan:

1. Dang nhap `cashier / Demo@123`.
2. Vao `Hoa don`.
3. Lap hoa don neu co phieu du dieu kien.
4. Ghi nhan thanh toan.

### Demo bang Manager

Dung khi show quan ly:

1. Dang nhap `manager / Demo@123`.
2. Vao `Tong quan`.
3. Vao `Bao cao`.
4. Vao `Nhat ky`.
5. Vao `Nguoi dung` de xem tai khoan noi bo.

## 13. Cac loi thuong gap khi thao tac

| Hien tuong | Nguyen nhan thuong gap | Cach xu ly |
| --- | --- | --- |
| Khong tao duoc xe | Chua co khach hang | Tao khach hang truoc |
| Khong tao duoc lich hen | Chua co xe | Tao phuong tien truoc |
| Khong them duoc phu tung vao phieu | Chua co phu tung hoac ton kho khong du | Tao phu tung va nhap kho |
| Khong lap duoc hoa don | Chua co phieu sua chua du dieu kien | Hoan tat/cap nhat trang thai phieu |
| Khong thay menu Bao cao/Nhat ky | Account khong co quyen | Dang nhap `admin` hoac `manager` |
| Khong thay menu Nguoi dung | Account khong co quyen quan tri | Dang nhap `admin` hoac `manager` |

## 14. Checklist demo nhanh

Dung checklist nay khi can trinh bay he thong:

- [ ] Dang nhap `admin / Demo@123`.
- [ ] Mo `Tong quan`.
- [ ] Tao khach hang moi.
- [ ] Tao xe cho khach hang.
- [ ] Tao lich hen cho xe.
- [ ] Tao phieu sua chua.
- [ ] Them dich vu.
- [ ] Them phu tung.
- [ ] Cap nhat trang thai phieu.
- [ ] Lap hoa don.
- [ ] Ghi nhan thanh toan.
- [ ] Tra cuu lich su bao duong.
- [ ] Xem bao cao.
- [ ] Xem nhat ky thao tac.
