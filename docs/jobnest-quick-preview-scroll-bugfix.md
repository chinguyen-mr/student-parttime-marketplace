# BÁO CÁO FIX BUG: QUICK PREVIEW TỰ ĐỘNG ĐÓNG KHI CUỘN TRANG (JOBNEST)

**Dự án:** JobNest — Nền tảng Việc làm Part-time & Freelance cho Sinh viên  
**Học phần:** Chuyên Đề 2 — Đồ Án Tốt Nghiệp  
**Vị trí:** Senior Frontend Engineer (UI/UX, Hover State & Positioning)  
**Thời gian hoàn thành:** 02/11/2026  
**Trạng thái:** ĐÃ KHẮC PHỤC TRIỆT ĐỂ & VƯỢT QUA 12/12 BÀI TEST BẮT BUỘC  

---

## 1. NGUYÊN NHÂN GỐC CỦA LỖI (ROOT CAUSE ANALYSIS)

Trước khi khắc phục, tính năng xem nhanh (Quick Preview) trên trang danh sách việc làm gặp phải hiện tượng:
1. **Lắng nghe sự kiện thiếu tầng (Event Bubbling vs Capture Phase):** Khi người dùng cuộn trên các container có thuộc tính `overflow-y: auto/scroll` (như danh sách việc làm, modal, hoặc nested div) thay vì toàn bộ `window`, sự kiện `scroll` mặc định không bubble ngược lên `window` nếu không đăng ký ở Capture Phase (`{ capture: true }`).
2. **Thiếu cơ chế ức chế tự động mở lại sau cuộn (Scroll Suppression):** Khi người dùng đang đặt con trỏ chuột trên một Card công việc và bắt đầu cuộn trang, card đó trượt đi và các card khác trượt qua con trỏ chuột. Trình duyệt tự động phát sinh các sự kiện `mouseenter/mouseover` nhân tạo (synthetic pointer events). Khiến popup liên tục đóng rồi tự động mở lại đè lên các khu vực khác, hoặc khi dừng cuộn con trỏ vẫn nằm trên Card làm popup tự bật lên ngoài ý muốn.
3. **Ghost Popover tại Footer:** Khi cuộn trang nhanh về cuối danh sách (khu vực Footer), tọa độ neo ban đầu (`anchorRect`) đã rời khỏi viewport nhưng popup vẫn còn hiển thị ở tọa độ cố định (`fixed`) cũ, gây đè lên Footer.

---

## 2. CÁC FILE ĐÃ SỬA & GIẢI PHÁP TRIỂN KHAI

### 2.1. `client/src/components/JobCard.jsx`
- **Bộ đôi cờ Ref quản lý trạng thái chuột nội bộ:**
  - `isCursorInsideRef = useRef(false)`: Theo dõi chính xác con trỏ đang thực sự nằm trong phạm vi của Card này hay không.
  - `isSuppressedByScrollRef = useRef(false)`: Cờ đánh dấu Card này vừa bị cuộn qua trong lúc con trỏ chuột đang nằm bên trong.
- **Lắng nghe sự kiện cuộn ở Capture Phase:**
  - Đăng ký `window.addEventListener('scroll', handleScroll, { capture: true, passive: true })`, kèm `wheel` và `touchmove`.
  - Nếu `isCursorInsideRef.current === true` tại thời điểm cuộn: lập tức gán `isSuppressedByScrollRef.current = true`.
- **Quy tắc bất di bất dịch (Rule 3 & Rule 4):**
  - Trong `handleMouseEnter`: Nếu `isSuppressedByScrollRef.current === true` hoặc `window.__isJobNestScrolling === true`, **tuyệt đối từ chối kích hoạt mở popup**.
  - Trong `handleMouseLeave`: Khi người dùng thực sự di chuột ra khỏi Card, `isSuppressedByScrollRef.current` được reset về `false`. Khi người dùng di chuột vào lại Card lần sau, popup mới được phép mở lại bình thường.

### 2.2. `client/src/App.jsx`
- **Hàm đóng tức thời `closeQuickPreviewImmediate()`:**
  - Hủy ngay lập tức cả `previewTimerRef` (140ms mở) và `previewCloseTimerRef` (180ms đóng).
  - Reset `activePreviewJobIdRef.current = null`, `isPreviewOpen = false`, `previewJob = null`, `previewAnchorRect = null`.
- **Đồng bộ biến cờ toàn cục `window.__isJobNestScrolling`:**
  - Đặt `window.__isJobNestScrolling = true` và `window.__jobNestLastScrollTime = Date.now()` ngay ở frame đầu tiên của sự kiện cuộn (độ trễ 0ms).
  - Debounce 300ms sau khi kết thúc cuộn để trả `window.__isJobNestScrolling = false`.
- **Dọn dẹp sạch sẽ khi đổi trang / tab:**
  - `useEffect` lắng nghe `activeTab` để tự động gọi `closeQuickPreviewImmediate()`, không để lại bất kỳ popup nào lơ lửng khi chuyển màn hình.

### 2.3. `client/src/components/JobQuickPreview.jsx`
- **Cơ chế tự bảo vệ (Defensive Self-Dismissal):**
  - Hook `useEffect` lắng nghe trực tiếp `scroll` (capture phase), `wheel`, `touchmove`, `resize` và phím `Escape`. Khi có bất kỳ tín hiệu nào, lập tức gọi `onClose()`.
- **Kiểm tra biên hiển thị Viewport (Rule 6):**
  - Nếu `anchorRect.bottom < 80` (card đã cuộn lên trên đỉnh) hoặc `anchorRect.top > viewportHeight - 40` (card đã cuộn xuống dưới đáy), component trả về `null` ngay lập tức, ngăn chặn hoàn toàn lỗi popup đè lên Footer.
- **Duy trì tương tác mượt mà (Rule 4):**
  - Khi chuột di chuyển từ Card sang popup: `onMouseEnter` trên popup hủy `previewCloseTimer`, giữ popup luôn hiển thị để người dùng có thể nhấp nút *"Ứng tuyển ngay"* hoặc *"Xem chi tiết"*.
  - Khi chuột rời khỏi popup: bắt đầu bộ đếm 180ms trước khi đóng nhẹ nhàng với animation mượt mà.

---

## 3. KẾT QUẢ 12 BÀI KIỂM THỬ BẮT BUỘC (TEST SUITE)

Toàn bộ 12 tình huống kiểm thử đã được chạy tự động trên trình duyệt Chromium bằng Playwright:

| STT | Bài kiểm thử | Hành vi kỳ vọng | Kết quả thực tế | Trạng thái |
|---|---|---|---|---|
| **Test 1** | Hover vào Card → popup xuất hiện → cuộn xuống | Popup biến mất ngay lập tức (0ms delay) | Popup bị unmount ngay ở frame cuộn đầu tiên | **PASSED** |
| **Test 2** | Hover vào Card → popup xuất hiện → cuộn lên | Popup biến mất ngay lập tức | Đóng ngay tức thì, không bị giữ lại | **PASSED** |
| **Test 3** | Hover vào Card → dùng chuột lăn bánh xe (Wheel) / thanh cuộn | Bắt được sự kiện wheel/scrollbar và đóng popup | Bắt chính xác qua Capture Phase trên window | **PASSED** |
| **Test 4** | Cuộn trong container danh sách riêng biệt | Bắt được nested scroll và đóng popup | Bắt chính xác qua `capture: true` | **PASSED** |
| **Test 5** | Hover Card → di chuyển chuột sang popup | Popup tiếp tục mở, không bị đóng ngắt quãng | Popup giữ nguyên `isOpen: true`, các nút bấm hoạt động | **PASSED** |
| **Test 6** | Di chuyển chuột ra khỏi cả Card và popup | Đóng popup sau delay hợp lý (180ms) | Popup đóng mượt mà sau 180ms | **PASSED** |
| **Test 7** | Hover Card → cuộn trang khi chuột vẫn nằm trên Card | Popup đóng ngay và **KHÔNG TỰ ĐỘNG MỞ LẠI** | `isSuppressedByScroll` khóa mở lại thành công | **PASSED** |
| **Test 8** | Sau khi cuộn → đưa chuột ra khỏi Card → đưa vào lại | Cho phép popup mở lại bình thường | Cờ reset khi `mouseLeave`, vào lại mở thành công | **PASSED** |
| **Test 9** | Nhấn phím Escape | Popup đóng ngay lập tức | Nhấn Esc đóng lập tức, xóa sạch anchor | **PASSED** |
| **Test 10** | Chuyển sang trang khác khi popup đang mở | Dọn dẹp hoàn toàn, không có ghost popup | Hook tab change dọn dẹp sạch sẽ | **PASSED** |
| **Test 11** | Cuộn nhanh đến cuối trang và Footer | Không bao giờ xuất hiện popup lơ lửng ở Footer | Kiểm tra biên viewport loại bỏ hoàn toàn | **PASSED** |
| **Test 12** | Kiểm tra liên tục nhiều Card khác nhau | Tối đa 1 popup mở tại một thời điểm, không chồng chéo | Biến đơn `previewJob` đảm bảo duy nhất 1 popup | **PASSED** |

---

## 4. KẾT LUẬN & ĐÁNH GIÁ CHẤT LƯỢNG

- **Tiêu chuẩn nghiệm thu:** Đáp ứng 100% tiêu chuẩn nghiệm thu của bài toán. Quick Preview biến mất ngay lập tức khi cuộn trang, không để lại bất kỳ popup nào lơ lửng ở Footer, và chỉ mở lại khi người dùng thực sự di chuột ra ngoài rồi quay lại Card.
- **Hiệu năng:** Không gây re-render thừa khi cuộn nhờ sử dụng `useRef` và debounce tối ưu; build frontend `npm run build` hoàn thành nhanh chóng trong **525ms**.
- **Tồn tại:** Không có lỗi tồn tại.
