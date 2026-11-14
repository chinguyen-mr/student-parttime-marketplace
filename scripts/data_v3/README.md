# Bộ dữ liệu demo v3

- `generate_data_v3.py` — sinh `02_database/JobNest_Data_v3.xlsx` (mỗi sheet = 1 bảng DB) và file thật trong
  `02_database/data_v3_files/` (logo, ảnh bìa, ảnh văn phòng, ảnh đại diện, CV PDF, giấy tờ pháp lý PDF "BẢN MẪU DEMO").
- `assets_v3.py` — tạo ảnh/PDF (Pillow + fpdf2). Ảnh ngành lấy từ Unsplash, ảnh đại diện minh họa từ DiceBear;
  bản tải về được giữ trong `data_v3_files/_cache/` (không commit).
- `import_data_v3.py` — **xóa sạch** DB rồi nạp Excel (cột `file_uploads.data` đọc từ file).

## Sinh dữ liệu (cần Docker vì Pillow/fpdf2)

```bash
docker run --rm -v "$(pwd -W):/proj" -v "C:/Windows/Fonts:/winfonts:ro" -w /proj/scripts/data_v3 python:3.12-slim \
  sh -c "pip install -q openpyxl==3.1.5 pillow==11.3.0 fpdf2==2.8.3 && python generate_data_v3.py"
```

## Nạp vào DB

```bash
python scripts/data_v3/import_data_v3.py --db-url "<DATABASE_URL>" --yes
```

Mật khẩu mọi tài khoản: `Jobnest@2026` (demo: admin.test / employer.test / student.test @vlu.edu.vn).
CV được phục vụ qua link có khóa ngẫu nhiên `/api/files/cv/<id>-<token>`; mỗi lần sinh lại token đổi.
