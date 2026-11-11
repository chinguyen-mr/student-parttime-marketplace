# QUY CHUẨN TRUY VẤN VÀ PHÂN TÍCH TÁC ĐỘNG MÃ NGUỒN (GITNEXUS)

> **Phạm vi áp dụng:** Bắt buộc áp dụng trước khi thay đổi bất kỳ hàm, phương thức, class hoặc API endpoint nào trong dự án JobNest.

---

## 1. NGUYÊN TẮC BẮT BUỘC (ALWAYS DO)
1. **Phân tích tác động (Impact Analysis) trước khi sửa đổi:**
   - Sử dụng lệnh: `node .gitnexus/run.cjs impact "symbolName" --direction upstream --repo .`
   - Báo cáo rõ ràng: Callers (những nơi gọi tới), Execution Processes (luồng thực thi bị ảnh hưởng), và Mức độ rủi ro (Risk Level).
   - Tuyệt đối không thay thế phân tích đồ thị bằng lệnh grep thông thường.
2. **Kiểm tra đồ thị thay đổi trước khi commit:**
   - Sử dụng lệnh: `node .gitnexus/run.cjs detect-changes --scope all --repo .`
3. **Cảnh báo khi rủi ro HIGH hoặc CRITICAL:**
   - Phải dừng lại và đánh giá kỹ lưỡng trước khi sửa các symbol có rủi ro cao.
4. **Xử lý rủi ro UNKNOWN:**
   - Coi `risk: UNKNOWN` là chưa phân giải được (unresolved), không được coi là an toàn. Phải đối chiếu thêm bằng tìm kiếm văn bản.

---

## 2. ĐIỀU TUYỆT ĐỐI CẤM (NEVER DO)
- ❌ KHÔNG BAO GIỜ sửa hàm hoặc method mà chưa chạy phân tích tác động đồ thị.
- ❌ KHÔNG BAO GIỜ đổi tên symbol bằng Find & Replace thủ công — phải sử dụng quy trình hiểu call graph.
- ❌ KHÔNG BAO GIỜ bỏ qua cảnh báo rủi ro HIGH/CRITICAL.

