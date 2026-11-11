# QUY CHUẨN CHẤT LƯỢNG CODE & SURGICAL EXECUTION (JOBNEST)

> **Mục tiêu:** Giảm thiểu sai sót phổ biến của AI coding, tối ưu hóa độ chính xác và tính tối giản của mã nguồn.

---

## 1. SUY NGHĨ KỸ TRƯỚC KHI CODE (THINK BEFORE CODING)
- Nêu rõ các giả định một cách tường minh; nếu chưa chắc chắn, phải đặt câu hỏi làm rõ.
- Luôn ưu tiên giải pháp đơn giản nhất giải quyết được vấn đề; không suy đoán tính năng tương lai.

## 2. ƯU TIÊN SỰ TỐI GIẢN (SIMPLICITY FIRST)
- Không viết thêm tính năng ngoài yêu cầu.
- Không tạo các lớp trừu tượng (abstractions) cho code chỉ sử dụng 1 lần.
- Không thêm xử lý lỗi cho các kịch bản bất khả thi.

## 3. THAY ĐỔI CÓ TÍNH PHẪU THUẬT (SURGICAL CHANGES)
- Chỉ chạm vào những dòng code thực sự cần sửa.
- Không tự ý format lại hoặc "dọn dẹp" code lân cận không liên quan.
- Bảo tồn toàn bộ ghi chú (comments) và docstrings hiện có trừ khi người dùng yêu cầu sửa.
- Khi thay đổi làm phát sinh code thừa (orphans), hãy dọn sạch các import/biến do chính mình tạo ra.

## 4. THỰC THI HƯỚNG MỤC TIÊU (GOAL-DRIVEN EXECUTION)
- Xác định tiêu chí thành công trước khi bắt tay làm.
- Kiểm chứng kết quả bằng test (`npm test`) hoặc build (`npm run build`) trước khi kết thúc tác vụ.

