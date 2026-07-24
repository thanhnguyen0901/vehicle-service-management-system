# Huong Dan Team Demo Va Flow Nghiep Vu VSMS

Tai lieu nay dung cho team doc nhanh truoc khi demo project Vehicle Service Management System. Muc tieu la nam duoc:

- Cach chay backend, frontend va database.
- Dang nhap bang account nao.
- Role nao duoc lam viec gi.
- Flow nghiep vu garage: tao cai nao truoc, cai nao sau.
- Kich ban demo ngan gon de trinh bay voi giang vien.

## 1. Tong quan nghiep vu

He thong mo phong quy trinh van hanh cua mot garage/sua chua xe.

Khi khach hang mang xe den bao duong hoac sua chua, nhan vien tiep nhan se tao ho so khach hang, tao phuong tien cua khach, tao phieu sua chua, chon dich vu can lam, them phu tung neu co. Ky thuat vien cap nhat trang thai sua chua. Khi hoan tat, thu ngan lap hoa don va ghi nhan thanh toan. Sau do he thong luu lich su bao duong va cho quan ly xem bao cao, doanh thu, ton kho, audit log.

Flow tong quat:

```text
Khach hang den garage
-> Tao ho so khach hang
-> Tao phuong tien cua khach
-> Tao lich hen neu khach dat truoc, hoac tao phieu sua chua truc tiep
-> Chon dich vu bao duong/sua chua
-> Them phu tung su dung neu co
-> Cap nhat trang thai phieu sua chua
-> Lap hoa don
-> Ghi nhan thanh toan
-> Luu lich su bao duong
-> Xem bao cao va nhat ky thao tac
```

## 2. Cach chay project local

Mo terminal tai thu muc goc project:

```bash
cd /Users/ThanhNguyen/Projects/SV/ThucTapCoSo/vehicle-service-management-system
```

### 2.1. Cai dependencies neu chua cai

```bash
npm install --prefix apps/backend
npm install --prefix apps/frontend
```

### 2.2. Chay database

Project dung PostgreSQL qua Docker Compose.

```bash
docker compose -f apps/backend/docker-compose.yml up -d
```

Database local se chay o port `5434`.

### 2.3. Tao schema va seed du lieu demo

Neu database moi hoac muon reset lai du lieu demo sach:

```bash
cd apps/backend
DATABASE_URL='postgresql://vsms_user:vsms_password@localhost:5434/vsms_db?schema=public' npx prisma db push
DATABASE_URL='postgresql://vsms_user:vsms_password@localhost:5434/vsms_db?schema=public' npm run seed:demo
cd ../..
```

Luu y: `seed:demo` se xoa du lieu cu va tao lai bo du lieu demo.

### 2.4. Chay backend

Mo terminal thu nhat:

```bash
cd /Users/ThanhNguyen/Projects/SV/ThucTapCoSo/vehicle-service-management-system
DATABASE_URL='postgresql://vsms_user:vsms_password@localhost:5434/vsms_db?schema=public' FRONTEND_URL='http://localhost:5173,http://127.0.0.1:5173' npm run dev:backend
```

Backend chay tai:

```text
http://localhost:3000/api/v1
```

### 2.5. Chay frontend

Mo terminal thu hai:

```bash
cd /Users/ThanhNguyen/Projects/SV/ThucTapCoSo/vehicle-service-management-system
VITE_API_URL='http://localhost:3000/api/v1' npm run dev:frontend
```

Frontend chay tai:

```text
http://localhost:5173
```

## 3. Account demo

Mat khau chung cho account demo:

```text
Demo@123
```

| Username | Vai tro | Ten hien thi | Nen dung khi nao |
| --- | --- | --- | --- |
| `admin` | Admin | Nguyen Minh Quan | Demo full he thong, co quyen cao nhat |
| `advisor` | Service Advisor | Tran Thi Mai | Demo tiep nhan khach, xe, lich hen, phieu sua chua |
| `technician` | Technician | Le Van Hung | Demo xu ly ky thuat va cap nhat tien do sua chua |
| `inventory` | Inventory Clerk | Pham Quoc Bao | Demo phu tung, ton kho, nhap/xuat/dieu chinh kho |
| `cashier` | Cashier | Vo Thi Lan | Demo lap hoa don va thanh toan |
| `manager` | Manager | Dang Hoang Nam | Demo tong quan, bao cao, audit log, xem nguoi dung |

Khi demo tong quat nen dang nhap:

```text
admin / Demo@123
```

Ly do: admin thay duoc gan nhu toan bo menu, tranh bi chan quyen trong luc trinh bay.

## 4. Role nao lam duoc gi?

### Admin

Admin dai dien cho chu he thong hoac nguoi quan tri.

Co the demo:

- Xem tat ca menu.
- Tao, sua, xoa du lieu nghiep vu.
- Tao khach hang, phuong tien, lich hen, phieu sua chua.
- Quan ly dich vu, phu tung, giao dich kho.
- Lap hoa don, ghi nhan thanh toan.
- Xem bao cao, audit log.
- Quan ly nguoi dung va vai tro.

### Service Advisor

Service Advisor la nhan vien tiep nhan/co van dich vu.

Co the demo:

- Tiep nhan khach hang.
- Tao ho so khach hang.
- Tao phuong tien cho khach.
- Tao lich hen.
- Tao phieu sua chua.
- Theo doi va cap nhat trang thai phieu o cac buoc tiep nhan/dich vu.

Khong nen demo:

- Quan ly nguoi dung.
- Lap bao cao quan tri chuyen sau.
- Quan ly kho theo vai tro thu kho.

### Technician

Technician la ky thuat vien sua chua.

Co the demo:

- Xem danh sach phieu sua chua.
- Xem chi tiet cong viec can lam.
- Them/cap nhat hang muc sua chua theo quyen duoc cap.
- Cap nhat trang thai sua chua, vi du dang sua, cho phu tung, san sang giao.
- Ghi nhan phu tung su dung trong qua trinh sua chua neu flow cho phep.

Khong nen demo:

- Tao nguoi dung.
- Lap hoa don/thanh toan.
- Xem bao cao quan ly neu bi gioi han quyen.

### Inventory Clerk

Inventory Clerk la thu kho.

Co the demo:

- Xem danh muc phu tung.
- Tao/cap nhat phu tung.
- Nhap kho.
- Xuat kho.
- Dieu chinh ton kho.
- Kiem tra phu tung ton kho thap.

Khong nen demo:

- Tiep nhan khach hang chinh.
- Lap hoa don.
- Quan ly nguoi dung.

### Cashier

Cashier la thu ngan.

Co the demo:

- Xem hoa don.
- Lap hoa don tu phieu sua chua du dieu kien.
- Ghi nhan thanh toan.
- Theo doi hoa don da thanh toan, chua thanh toan, thanh toan mot phan.

Khong nen demo:

- Tao phieu sua chua tu dau.
- Quan ly kho.
- Quan ly nguoi dung.

### Manager

Manager la quan ly garage.

Co the demo:

- Xem tong quan van hanh.
- Xem bao cao doanh thu.
- Xem so luong phieu sua chua.
- Xem top dich vu, top phu tung.
- Xem phu tung ton kho thap.
- Xem audit log/nhat ky thao tac.
- Xem danh sach nguoi dung noi bo.

Khong nen demo:

- Lam thay toan bo thao tac van hanh hang ngay neu muon the hien dung phan quyen.

## 5. Thu tu tao du lieu dung nghiep vu

Neu database rong, phai tao theo thu tu sau de tranh loi thieu du lieu.

### Buoc 1: Tao danh muc dich vu

Menu:

```text
Dich vu
```

Vi du dich vu:

- Bao duong dinh ky 10.000 km.
- Thay dau dong co.
- Kiem tra he thong phanh.
- Ve sinh dieu hoa.
- Can chinh thuoc lai.

Ly do phai tao truoc:

- Phieu sua chua can chon dich vu.
- Hoa don tinh tien tu dich vu da chon.

Role nen dung:

```text
admin hoac manager
```

### Buoc 2: Tao phu tung

Menu:

```text
Phu tung
```

Vi du phu tung:

- Dau dong co 5W-30.
- Loc dau.
- Loc gio dong co.
- Bo ma phanh truoc.
- Bugi.

Ly do phai tao truoc:

- Phieu sua chua chi them duoc phu tung da ton tai.
- Kho can co ma phu tung de nhap/xuat.

Role nen dung:

```text
admin hoac inventory
```

### Buoc 3: Nhap kho phu tung

Menu:

```text
Giao dich kho
```

Ly do phai tao truoc:

- Neu ton kho khong du, khi them phu tung vao phieu sua chua co the bi loi.
- He thong can tru ton kho khi phu tung duoc su dung.

Role nen dung:

```text
admin hoac inventory
```

### Buoc 4: Tao khach hang

Menu:

```text
Khach hang
```

Thong tin can co:

- Ho ten.
- So dien thoai.
- Email.
- Dia chi.
- Loai khach hang: ca nhan hoac doanh nghiep.

Ly do phai tao truoc:

- Phuong tien phai gan voi mot khach hang.
- Lich su bao duong can truy ve chu xe.

Role nen dung:

```text
admin hoac advisor
```

### Buoc 5: Tao phuong tien

Menu:

```text
Phuong tien
```

Thong tin can co:

- Khach hang so huu xe.
- Bien so.
- Hang xe.
- Dong xe.
- Nam san xuat.
- So km hien tai.
- VIN neu co.

Ly do phai tao truoc:

- Lich hen va phieu sua chua deu phai gan voi xe.

Role nen dung:

```text
admin hoac advisor
```

### Buoc 6: Tao lich hen neu khach dat truoc

Menu:

```text
Lich hen
```

Dung khi:

- Khach goi dien/dat lich truoc.
- Garage muon quan ly thoi gian tiep nhan.

Thong tin can co:

- Xe can sua/bao duong.
- Thoi gian hen.
- Nhu cau dich vu.
- Ghi chu.

Role nen dung:

```text
admin hoac advisor
```

Neu khach den truc tiep, co the bo qua buoc nay va tao phieu sua chua luon.

### Buoc 7: Tao phieu sua chua

Menu:

```text
Phieu sua chua
```

Dung khi:

- Xe da vao garage.
- Nhan vien bat dau ghi nhan qua trinh sua chua/bao duong.

Thong tin can co:

- Xe.
- Lich hen neu co.
- Chan doan/tinh trang ban dau.
- Ghi chu tiep nhan.

Role nen dung:

```text
admin hoac advisor
```

### Buoc 8: Them dich vu vao phieu sua chua

Menu:

```text
Phieu sua chua -> Chi tiet phieu -> Hang muc/dich vu
```

Vi du:

- Thay dau dong co.
- Kiem tra phanh.
- Ve sinh dieu hoa.

Ket qua:

- Phieu sua chua co hang muc dich vu.
- Tong tien tam tinh duoc cap nhat.

Role nen dung:

```text
admin, advisor hoac technician
```

### Buoc 9: Them phu tung su dung

Menu:

```text
Phieu sua chua -> Chi tiet phieu -> Phu tung su dung
```

Dieu kien:

- Phu tung da duoc tao.
- Ton kho con du.

Ket qua:

- Phu tung duoc gan vao phieu sua chua.
- Ton kho bi tru theo so luong su dung.
- Giao dich xuat kho duoc ghi nhan.

Role nen dung:

```text
admin, advisor, technician hoac inventory
```

### Buoc 10: Cap nhat trang thai phieu sua chua

Menu:

```text
Phieu sua chua
```

Trang thai co the trinh bay:

```text
Tiep nhan
-> Chan doan
-> Dang sua
-> Cho phu tung
-> San sang giao
-> Da giao
```

Y nghia:

- The hien tien do sua chua thuc te cua xe.
- Khi phieu du dieu kien, bo phan thu ngan co the lap hoa don.

Role nen dung:

```text
admin, advisor hoac technician
```

### Buoc 11: Lap hoa don

Menu:

```text
Hoa don
```

Nguon du lieu hoa don:

- Dich vu da them vao phieu sua chua.
- Phu tung da su dung.
- Don gia tai thoi diem lap hoa don.

Ket qua:

- Hoa don duoc tao.
- Tong tien duoc tinh tu dich vu va phu tung.

Role nen dung:

```text
admin hoac cashier
```

### Buoc 12: Ghi nhan thanh toan

Menu:

```text
Hoa don -> Chi tiet hoa don -> Thanh toan
```

Phuong thuc thanh toan co the demo:

- Tien mat.
- Chuyen khoan.
- The.

Ket qua:

- Neu thanh toan du, hoa don chuyen sang da thanh toan.
- Neu thanh toan mot phan, hoa don van con so tien can thu.

Role nen dung:

```text
admin hoac cashier
```

### Buoc 13: Xem lich su bao duong

Menu:

```text
Lich su bao duong
```

Y nghia:

- Khi khach quay lai, garage xem duoc xe da tung sua gi.
- Co the tra cuu theo khach hang, bien so, so dien thoai.

Role nen dung:

```text
admin, advisor, technician, cashier, inventory hoac manager
```

### Buoc 14: Xem bao cao va nhat ky

Menu:

```text
Bao cao
Nhat ky
```

Bao cao dung de xem:

- Doanh thu.
- So phieu sua chua.
- Top dich vu.
- Top phu tung.
- Phu tung ton kho thap.

Nhat ky dung de xem:

- Ai da thao tac.
- Thao tac tren module nao.
- Thoi gian thao tac.

Role nen dung:

```text
admin hoac manager
```

## 6. Kich ban demo nhanh 10-15 phut

Nen dang nhap:

```text
admin / Demo@123
```

### Phan 1: Gioi thieu tong quan

Noi:

```text
Day la he thong quan ly dich vu garage, ho tro tu tiep nhan khach hang, quan ly xe, lap phieu sua chua, quan ly phu tung, lap hoa don, thanh toan den bao cao quan ly.
```

Thao tac:

```text
Mo Tong quan
```

Noi ve cac so lieu tren dashboard:

- Lich hen.
- Xe dang sua.
- Doanh thu.
- Cong viec can xu ly.

### Phan 2: Tiep nhan khach va xe

Thao tac:

```text
Khach hang -> Tao khach hang
Phuong tien -> Tao xe cho khach hang
```

Noi:

```text
Khi khach hang den garage, nhan vien tiep nhan tao ho so khach hang truoc. Sau do tao phuong tien cua khach, vi moi lich hen va phieu sua chua deu phai gan voi mot xe cu the.
```

### Phan 3: Tao lich hen hoac phieu sua chua

Neu muon demo khach dat truoc:

```text
Lich hen -> Tao lich hen
Phieu sua chua -> Tao phieu tu xe/lich hen
```

Neu muon demo nhanh:

```text
Phieu sua chua -> Tao phieu truc tiep cho xe
```

Noi:

```text
Phieu sua chua la trung tam cua nghiep vu. Moi dich vu, phu tung, tien do sua chua va hoa don deu xoay quanh phieu nay.
```

### Phan 4: Them dich vu va phu tung

Thao tac:

```text
Mo chi tiet phieu sua chua
Them dich vu
Them phu tung su dung
```

Noi:

```text
Nhan vien hoac ky thuat vien chon dich vu can thuc hien tu danh muc co san. Neu co thay phu tung, he thong ghi nhan so luong su dung va tu dong tru ton kho.
```

### Phan 5: Cap nhat trang thai sua chua

Thao tac:

```text
Cap nhat trang thai phieu sua chua
```

Noi:

```text
Trang thai giup garage theo doi xe dang o buoc nao: tiep nhan, chan doan, dang sua, cho phu tung, san sang giao hoac da giao.
```

### Phan 6: Lap hoa don va thanh toan

Thao tac:

```text
Hoa don -> Lap hoa don
Mo chi tiet hoa don -> Ghi nhan thanh toan
```

Noi:

```text
Khi sua xong, thu ngan lap hoa don dua tren dich vu va phu tung trong phieu sua chua. Sau khi khach thanh toan, he thong cap nhat trang thai hoa don va luu lai lich su.
```

### Phan 7: Quan ly xem bao cao

Thao tac:

```text
Bao cao
Nhat ky
```

Noi:

```text
Quan ly co the xem doanh thu, top dich vu, top phu tung, ton kho thap va audit log de biet ai da thao tac gi trong he thong.
```

## 7. Kich ban demo theo tung role

### Demo role Service Advisor

Dang nhap:

```text
advisor / Demo@123
```

Demo:

```text
Khach hang
-> Phuong tien
-> Lich hen
-> Phieu sua chua
```

Noi:

```text
Day la nhan vien tiep nhan, phu trach lam viec voi khach hang, tao xe, tao lich hen va mo phieu sua chua.
```

### Demo role Technician

Dang nhap:

```text
technician / Demo@123
```

Demo:

```text
Phieu sua chua
-> Xem chi tiet
-> Cap nhat tien do
-> Ghi nhan dich vu/phu tung neu co
```

Noi:

```text
Day la ky thuat vien, tap trung vao cong viec sua chua va cap nhat trang thai ky thuat cua xe.
```

### Demo role Inventory Clerk

Dang nhap:

```text
inventory / Demo@123
```

Demo:

```text
Phu tung
-> Giao dich kho
-> Nhap kho / Xuat kho / Dieu chinh ton
```

Noi:

```text
Day la thu kho, phu trach quan ly phu tung va ton kho. Khi phu tung duoc dung trong phieu sua chua, ton kho se duoc cap nhat.
```

### Demo role Cashier

Dang nhap:

```text
cashier / Demo@123
```

Demo:

```text
Hoa don
-> Lap hoa don
-> Ghi nhan thanh toan
```

Noi:

```text
Day la thu ngan, phu trach lap hoa don va ghi nhan thanh toan sau khi xe sua xong.
```

### Demo role Manager

Dang nhap:

```text
manager / Demo@123
```

Demo:

```text
Tong quan
-> Bao cao
-> Nhat ky
-> Nguoi dung
```

Noi:

```text
Day la quan ly, khong nhat thiet thao tac truc tiep tung phieu ma chu yeu xem tinh hinh van hanh, doanh thu, ton kho va audit log.
```

## 8. Thu tu demo khuyen nghi cho buoi bao cao

Neu chi co it thoi gian, dung thu tu nay:

```text
1. Dang nhap admin
2. Mo Tong quan
3. Tao khach hang
4. Tao phuong tien
5. Tao phieu sua chua
6. Them dich vu
7. Them phu tung
8. Cap nhat trang thai phieu
9. Lap hoa don
10. Thanh toan
11. Xem lich su bao duong
12. Xem bao cao
13. Xem nhat ky
```

Neu giang vien hoi phan quyen, dang xuat va login nhanh cac role:

```text
advisor -> cho thay tiep nhan
technician -> cho thay xu ly sua chua
inventory -> cho thay quan ly kho
cashier -> cho thay hoa don/thanh toan
manager -> cho thay bao cao/nhat ky
admin -> cho thay toan quyen
```

## 9. Loi thuong gap khi demo

| Loi | Nguyen nhan | Cach xu ly |
| --- | --- | --- |
| Khong tao duoc xe | Chua co khach hang | Tao khach hang truoc |
| Khong tao duoc lich hen | Chua co phuong tien | Tao xe truoc |
| Khong them duoc phu tung | Chua co phu tung hoac ton kho khong du | Tao phu tung va nhap kho |
| Khong lap duoc hoa don | Phieu sua chua chua du dieu kien | Cap nhat trang thai phieu |
| Khong thay menu Bao cao | Role khong co quyen | Login `admin` hoac `manager` |
| Khong thay menu Nguoi dung | Role khong co quyen quan tri | Login `admin` hoac `manager` |
| Frontend khong goi duoc API | Backend chua chay hoac sai `VITE_API_URL` | Kiem tra backend `localhost:3000/api/v1` |
| Backend khong ket noi database | Sai `DATABASE_URL` hoac Docker chua chay | Dung port `5434`, chay Docker Compose |

## 10. Cau noi ket luan khi demo

Co the ket thuc bang cau:

```text
He thong giup garage quan ly tron ven quy trinh tu luc khach hang mang xe den, tiep nhan thong tin, lap phieu sua chua, quan ly dich vu va phu tung, lap hoa don, thanh toan, luu lich su bao duong den viec theo doi bao cao va audit log. Moi role trong he thong duoc phan quyen theo dung cong viec thuc te cua garage.
```

## 11. Tai lieu lien quan

- [full-flow-guide.md](./full-flow-guide.md): Huong dan chi tiet tung man hinh va tung flow.
- [seed-data.md](./seed-data.md): Account demo, account E2E va noi dung du lieu seed.
