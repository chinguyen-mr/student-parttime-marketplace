<!-- converted from 02_JOBNEST_Product_Backlog_Sprint_Plan.docx -->

JOBNEST — PRODUCT BACKLOG & SPRINT PLAN
Tên file: 02_JOBNEST_Product_Backlog_Sprint_Plan.docx
Phiên bản: v2.1 + Phase 1 Rev.6 — Consolidated Draft (Revision 3.1)
Ngày: 03/11/2026
Trạng thái: DRAFT — Đủ điều kiện review chính thức (chưa Approved)
Phạm vi: Product Backlog, MoSCoW, Sprint Planning, Technical Backlog, Document Backlog, Decision Register, Test Baseline và Review Checklist.
Ghi chú hợp nhất Revision 3.1: Áp dụng toàn bộ delta từ review Revision 2 và Revision 3: thay mã A3 bằng DEP-01 cho dependency PB-07/PB-08; thay mã C4 bằng EPIC-GAP-01 cho việc đối chiếu 12 Epic; loại mục trùng tại §8.2; cập nhật §8.3; bổ sung Changelog FIX-05 và chuẩn hóa cách gọi 12 vị trí Epic. §1 giữ nguyên nội dung, riêng §1.2 được bổ sung quy tắc #6 (không tái sử dụng mã quyết định chính thức) — xem Changelog FIX-05. Các quyết định còn mở tập trung tại §8.1.
# 0. CHANGELOG SO VỚI REVISION 2
| Mã | Nội dung | Trạng thái |
| --- | --- | --- |
| FIX-01 | A3 (dependency PB-07/PB-08) → DEP-01 tại §3.3.1, §8.1, §8.3 | ĐÃ FIX |
| FIX-02 | C4 (12 Epic) → EPIC-GAP-01 tại §2.3, §8.3 | ĐÃ FIX |
| FIX-03 | Loại mục trùng §8.2; đánh lại số #9–#13 | ĐÃ FIX |
| FIX-04 | §8.3 cập nhật tham chiếu DEP-01 / EPIC-GAP-01 | ĐÃ FIX |
| FIX-05 | §1.2 bổ sung quy tắc #6 (không tái sử dụng mã quyết định chính thức) | ĐÃ FIX — xem ghi chú §1 |
| Giữ nguyên | A1, B1, B2, B3, B4, số liệu test 334/326/317/309 | CONDITIONAL — theo §8.1 |

Ghi chú mã:
- A3 giữ nguyên ý nghĩa chính thức: chỉ POST /jobs/:jobId/selections được thiết lập ACCEPTED và tạo Work Assignment. Không dùng lại cho mục đích khác.
- C4 giữ nguyên ý nghĩa chính thức: cơ chế Job EXPIRED (cron hoặc manual). Không dùng lại cho mục đích khác.
- DEP-01 và EPIC-GAP-01 là mã theo dõi nội bộ của File 02, không thay thế hoặc ghi đè C1–C10, A3, T1/M1, T2, S1–S6, G-xx, API-Dxx.
# 1. MỤC ĐÍCH VÀ NGUYÊN TẮC QUẢN TRỊ BACKLOG
Trạng thái: Giữ nguyên nội dung, riêng §1.2 bổ sung quy tắc #6 (không tái sử dụng mã quyết định chính thức).
## 1.1. Mục đích
Tài liệu quản lý các hạng mục công việc của dự án JOBNEST, bao gồm:
- Product Backlog: các hạng mục sản phẩm được định danh bằng PB ID.
- Technical Backlog: các hạng mục kỹ thuật được theo dõi riêng.
- Document Backlog: các tài liệu cần xây dựng, hoàn thiện hoặc phê duyệt.
- MoSCoW Prioritization: mức độ ưu tiên của Product Backlog.
- Sprint Planning: thông tin phân bổ Sprint, chỉ được xem là chính thức khi có xác nhận của nhóm.
Tài liệu này thiết lập quy tắc quản trị và truy vết backlog. Việc có PB ID, mức ưu tiên hoặc số Story Point không đồng nghĩa hạng mục đã đủ điều kiện triển khai.
## 1.2. Quy tắc khóa ID
1. Giữ nguyên các PB ID từ PB-01 đến PB-36.
2. Không tự ý đổi ID, tái sử dụng ID hoặc đánh số lại.
3. Không tạo PB ID mới chỉ để xử lý một hạng mục đang thiếu chi tiết.
4. Khi cần tách hoặc gộp backlog, phải ghi nhận quyết định và tác động truy vết trước khi thay đổi danh mục chính thức.
5. Các ID đề xuất hoặc nội dung đang chờ quyết định phải được đánh dấu rõ trạng thái, không được trình bày như hạng mục đã phê duyệt.
6. Không tái sử dụng mã quyết định (C1–C10, A3, T1/M1, T2, S1–S6, G-xx, API-Dxx) cho mục đích khác. Mã theo dõi nội bộ của File 02 phải dùng tiền tố riêng (DEP-xx, EPIC-GAP-xx) và không ghi đè mã chính thức.
## 1.3. Phân biệt ba loại backlog
| Loại backlog | Mục đích | Quy tắc quản lý |
| --- | --- | --- |
| Product Backlog | Quản lý chức năng và hạng mục sản phẩm | Dùng PB-01 đến PB-36; không tự đổi ID |
| Technical Backlog | Quản lý công việc kỹ thuật, hạ tầng, tích hợp và kỹ thuật hệ thống | Theo dõi riêng với Product Backlog; không tự chuyển thành PB |
| Document Backlog | Quản lý tài liệu cần xây dựng, cập nhật hoặc phê duyệt | Theo dõi trạng thái tài liệu; không xem tài liệu chưa hoàn thiện là đầu vào đã được duyệt |

Ngoại lệ S4 — PB-32:
- Giữ nguyên PB-32 trong danh mục hiện tại.
- Không tự tách PB-32 thành nhiều PB ID.
- Không tự tạo các PB ID mới cho User, Category hoặc Log.
- Việc tách PB-32 chỉ được thực hiện sau khi có quyết định S4.
- Các test ID đề xuất liên quan vẫn giữ PROPOSED — pending S4.
Ngoại lệ này không thay thế hoặc hủy bỏ quy tắc khóa ID tại §1.2.
## 1.4. Nguyên tắc quản lý TBD
1. Không tự điền nội dung còn thiếu bằng giả định.
2. Không chuyển TBD thành Approved/Confirmed/Ready nếu chưa có quyết định được ghi nhận.
3. Mỗi TBD phải giữ mã tham chiếu tương ứng nếu đã có (C9, S4, API-D1...).
4. Khi TBD ảnh hưởng đến API, Database, Test hoặc Sprint, phải ghi nhận ảnh hưởng trong tài liệu liên quan.
5. Hạng mục còn phụ thuộc quyết định chưa duyệt không được mặc nhiên xem là đủ điều kiện triển khai.
6. Khi TBD được giải quyết, cập nhật trạng thái và tài liệu chịu ảnh hưởng; không xóa lịch sử quyết định.
# 2. PRODUCT BACKLOG
## 2.1. Quy mô Product Backlog
| Chỉ tiêu | Giá trị |
| --- | --- |
| Tổng số Product Backlog | 36 |
| Dải ID | PB-01 đến PB-36 |
| Must | 31 |
| Should | 5 |
| Tổng Story Point theo MoSCoW | 186 SP |
| Must Story Point | 163 SP |
| Should Story Point | 23 SP |

Ghi chú hiệu chỉnh: Đã điều chỉnh MoSCoW về 31 Must + 5 Should = 186 SP; PB-08 đã được bổ sung vào Sprint 1.
## 2.2. Danh sách ưu tiên MoSCoW
Must Have — 31 PB:
PB-01, PB-02, PB-03, PB-04, PB-05, PB-06, PB-07, PB-09, PB-10, PB-11, PB-12, PB-13, PB-14, PB-15, PB-16, PB-17, PB-19, PB-20, PB-21, PB-22, PB-23, PB-24, PB-25, PB-26, PB-27, PB-28, PB-31, PB-32, PB-34, PB-35, PB-36.
Should Have — 5 PB:
PB-08, PB-18, PB-29, PB-30, PB-33.
Quy tắc:
- Không tự thay đổi MoSCoW đã chốt.
- Thuộc Must không đồng nghĩa đã được phân Sprint.
- Có Story Point không đồng nghĩa đã có Sprint assignment.
- Hạng mục chưa có mô tả, Acceptance Criteria hoặc dependency rõ ràng tiếp tục theo dõi là TBD.
## 2.3. Product Backlog Register
Danh mục chính thức gồm PB-01 đến PB-36. Các trường cần duy trì:
| Trường | Ý nghĩa |
| --- | --- |
| PB ID | Mã định danh cố định |
| Epic | Nhóm chức năng |
| Backlog Item | Tên hạng mục |
| Description | Mô tả phạm vi |
| Priority | Must / Should |
| Story Point | Ước lượng công sức |
| Dependency | Hạng mục phụ thuộc |
| Acceptance Criteria | Điều kiện nghiệm thu |
| Related FR / UC / Test ID | Liên kết truy vết |
| Sprint | Sprint được phân bổ, nếu đã xác nhận |
| Status | Trạng thái xử lý |
| Notes | Ghi chú và quyết định liên quan |

Nguyên tắc điền dữ liệu: chỉ điền nội dung có căn cứ trong nguồn dự án. Trường chưa có thông tin ghi TBD, không tự suy luận từ tên PB hoặc FR/UC có vẻ liên quan.
### Epic Register — 12 Epic (EPIC-GAP-01)
Product Backlog có 36 PB thuộc 12 Epic theo cấu trúc nguồn. Tuy nhiên, tên và mapping chi tiết của 12 Epic chưa có dữ liệu được xác nhận trong bản tổng hợp hiện tại.
| Nhãn vị trí tạm | Epic Name | PB Mapping | Trạng thái |
| --- | --- | --- | --- |
| Vị trí 01 | TBD | TBD | Chưa đủ dữ liệu nguồn |
| Vị trí 02 | TBD | TBD | Chưa đủ dữ liệu nguồn |
| Vị trí 03 | TBD | TBD | Chưa đủ dữ liệu nguồn |
| Vị trí 04 | TBD | TBD | Chưa đủ dữ liệu nguồn |
| Vị trí 05 | TBD | TBD | Chưa đủ dữ liệu nguồn |
| Vị trí 06 | TBD | TBD | Chưa đủ dữ liệu nguồn |
| Vị trí 07 | TBD | TBD | Chưa đủ dữ liệu nguồn |
| Vị trí 08 | TBD | TBD | Chưa đủ dữ liệu nguồn |
| Vị trí 09 | TBD | TBD | Chưa đủ dữ liệu nguồn |
| Vị trí 10 | TBD | TBD | Chưa đủ dữ liệu nguồn |
| Vị trí 11 | TBD | TBD | Chưa đủ dữ liệu nguồn |
| Vị trí 12 | TBD | TBD | Chưa đủ dữ liệu nguồn |

Quy tắc cách gọi (áp dụng toàn tài liệu):
- Cột "Nhãn vị trí tạm" dùng để đếm số lượng Epic cần đối chiếu. Không phải Epic ID.
- Trong toàn bộ File 02, dùng cụm "nhãn vị trí tạm" hoặc "vị trí Epic" khi nói về các mục này. Không dùng cụm "Epic ID" cho Vị trí 01..12.
- Cụm "Epic ID" chỉ được dùng khi đã có danh mục Epic gốc từ nguồn dự án.
- Khi trích dẫn §2.3 ở nơi khác, dùng dẫn chiếu EPIC-GAP-01 — không dẫn chiếu EPIC-01..12 như ID.
Theo dõi EPIC-GAP-01 — 12 vị trí Epic chưa có mapping xác nhận:
- Nguồn tổng hợp ghi nhận 12 Epic.
- Tên Epic và PB mapping chưa có dữ liệu đối chiếu được xác nhận.
- Không tự đặt tên hoặc tự gán PB vào Epic.
- Nếu không tìm được danh mục Epic gốc, ghi nhận rõ 12 Epic là số lượng chưa truy vết được.
- Không sử dụng mã C4 cho vấn đề này. C4 giữ nguyên ý nghĩa: cơ chế Job EXPIRED (cron/manual).
### Test Suite Baseline
| Trạng thái | Số lượng |
| --- | --- |
| Not Run | 223 |
| TBD | 110 |
| Manual | 1 |
| Tổng | 334 |

Không có Test Case nào được xác nhận Passed hoặc Verified. Chi tiết Test Registry, Test Case theo FR và trạng thái kiểm thử được quản lý tại tài liệu Test Plan Summary và Test Registry; theo dõi tại DB-TBD-05.
Nguyên tắc:
- Không xem Not Run là Passed.
- Không xem TBD là đã có thể thực thi.
- Không tự gán 110 TBD Test Cases vào FR nếu chưa có mapping từ Test Registry/Traceability Matrix.
- Giữ nguyên 17 Test IDs PROPOSED — pending S4.
- Giữ nguyên 8 cặp cross-reference theo Test Registry; không cộng trùng coverage.
## 2.4. Các điểm cần lưu ý
- PB-08: Should, 5 SP, Sprint 1; dependency PB-07 (xem DEP-01 §3.3.1).
- PB-31: Must; Sprint 2 theo dữ liệu nguồn; SP và điều kiện thực thi cần đối chiếu Product Backlog gốc; phụ thuộc C9.
- PB-32: Must; đang gộp User Management, Category Management và Admin Logs; việc tách phụ thuộc S4.
- PB-33: Should; liên quan Reports.
- PB-11, PB-34, PB-35, PB-36: Technical items theo nguồn. Không tự phân loại các PB còn lại nếu nguồn không xác định rõ loại.
## 2.5. Priority và mức độ sẵn sàng
Mức ưu tiên Must/Should thể hiện thứ tự ưu tiên sản phẩm, không tự động chứng minh PB đã được refine hoặc sẵn sàng đưa vào Sprint.
Một PB chỉ được xem là đủ điều kiện đưa vào Sprint khi có tối thiểu:
- Mô tả phạm vi có thể hiểu và kiểm tra.
- Acceptance Criteria.
- Dependency đã được xác định.
- Các quyết định ảnh hưởng trực tiếp đã được giải quyết hoặc có phương án được phê duyệt.
- Story Point được nhóm xác nhận.
PB thiếu thông tin tiếp tục giữ TBD. Không tự đặt Acceptance Criteria hoặc Story Point để làm backlog có vẻ hoàn chỉnh.
# 3. SPRINT PLAN
## 3.1. Trạng thái kế hoạch Sprint
Sprint Plan hiện tại là kế hoạch mục tiêu, chưa phải kế hoạch phân bổ có thể thực thi.
| Mức ưu tiên | Số PB | Story Point |
| --- | --- | --- |
| Must | 31 | 163 |
| Should | 5 | 23 |
| Tổng | 36 | 186 |

Các con số Sprint 1–4 chỉ là Sprint target tham khảo. Chưa có đủ dữ liệu để xác nhận toàn bộ 186 SP đã được phân bổ.
Không được diễn giải 186 SP / 4 Sprint = 46,5 SP/Sprint thành velocity thực tế của nhóm.
## 3.2. Sprint target
| Sprint | SP mục tiêu tham khảo | Trạng thái |
| --- | --- | --- |
| Sprint 1 | 54 | Target — chưa xác nhận allocation |
| Sprint 2 | 42 | Target — chưa xác nhận allocation |
| Sprint 3 | 57 | Target — chưa xác nhận allocation |
| Sprint 4 | 33 | Target — chưa xác nhận allocation |
| Tổng | 186 | Tổng target, không phải Sprint allocation đã duyệt |

Tổng 54 + 42 + 57 + 33 = 186 chỉ thể hiện tổng mục tiêu tham khảo. Không diễn giải thành bằng chứng 36/36 PB đã được phân bổ.
## 3.3. PB → Sprint → SP và Dependency
| PB ID | Priority | Sprint hiện ghi nhận | SP | Dependency / điều kiện | Trạng thái |
| --- | --- | --- | --- | --- | --- |
| PB-07 | Must | TBD | TBD | Dependency của PB-08 | Chưa xác nhận Sprint — DEP-01 |
| PB-08 | Should | Sprint 1 | 5 | Phụ thuộc PB-07 | Conditional — chưa đủ điều kiện bắt đầu nếu PB-07 chưa sẵn sàng |
| PB-31 | Must | Sprint 2 | TBD | Phụ thuộc C9 Moderation Policy | Conditional — C9 chưa chốt |
| PB-01 → PB-06 | Theo MoSCoW | TBD | TBD | Theo Product Backlog nguồn | Chưa xác nhận allocation |
| PB-09 → PB-30 | Theo MoSCoW | TBD | TBD | Theo Product Backlog nguồn | Chưa xác nhận allocation |
| PB-32 → PB-36 | Theo MoSCoW | TBD | TBD | PB-32 phụ thuộc S4 | Chưa xác nhận allocation |

Các dòng nhóm PB chỉ thể hiện phần chưa có dữ liệu phân bổ đầy đủ; không thay thế danh sách từng PB trong Register.
### 3.3.1. DEP-01 — PB-07 → PB-08 dependency
- PB-08 có dependency PB-07.
- Sprint của PB-07 hiện TBD.
- PB-08 không được bắt đầu khi PB-07 chưa sẵn sàng.
- Phương án A: PB-07 được xác nhận thuộc Sprint 1 hoặc đã hoàn thành trước Sprint 1 → PB-08 có thể được xem xét thực hiện trong Sprint 1.
- Phương án B: Nếu PB-07 chưa sẵn sàng, PB-08 chuyển sang Sprint tiếp theo phù hợp và được đánh dấu Blocked/Deferred cho đến khi dependency sẵn sàng.
- Quyết định cuối cùng: TBD — nhóm dự án phê duyệt.
Lưu ý mã: A3 vẫn chỉ dùng cho quy tắc lựa chọn ứng viên và tạo Work Assignment qua POST /jobs/:jobId/selections. DEP-01 là mã theo dõi nội bộ của File 02, không thay thế A3.
| Quyết định | Người chốt | Ngày | Ghi chú |
| --- | --- | --- | --- |
| TBD | TBD | TBD | TBD |

### 3.3.2. PB-31 và C9 — Moderation Policy (B1)
PB-31 là Must, có thông tin gán Sprint 2. C9 vẫn TBD. Hai phương án:
- Phương án A: Giữ PB-31 ở Sprint 2, chỉ triển khai phần không phụ thuộc C9; phần phụ thuộc C9 chờ quyết định được phê duyệt.
- Phương án B: Chuyển PB-31 sang Sprint 3 (hoặc Sprint phù hợp) sau khi C9 được chốt.
Không tự chọn A hoặc B. Trước khi phê duyệt Sprint 2, nhóm phải ghi nhận quyết định và phạm vi được phép triển khai.
| Quyết định | Phạm vi cho phép | Người chốt | Ngày |
| --- | --- | --- | --- |
| TBD | TBD | TBD | TBD |

## 3.4. Sprint capacity, velocity và điều kiện thực thi
| Thông số | Giá trị |
| --- | --- |
| Sprint length | TBD |
| Team size | TBD |
| Developer capacity | TBD |
| QA capacity | TBD |
| Historical velocity | TBD |
| Planned velocity | TBD |
| Availability / leave factor | TBD |

46,5 SP/Sprint chỉ là phép chia trung bình của 186 SP cho 4 Sprint, không phải velocity được đo hoặc được nhóm cam kết.
Để chuyển Sprint target thành Sprint Plan thực thi, cần:
1. Xác nhận Sprint length.
2. Xác nhận thành viên và vai trò trong nhóm.
3. Xác nhận thời gian làm việc thực tế và ngày nghỉ.
4. Có velocity lịch sử hoặc cơ sở ước lượng được nhóm chấp thuận.
5. Xác nhận PB → Sprint → SP đầy đủ.
6. Xác nhận dependency và điều kiện Ready.
7. Chốt các quyết định ảnh hưởng trực tiếp đến Sprint scope.
# 4. TECHNICAL BACKLOG
Technical Backlog được quản lý riêng với Product Backlog. Không cộng Technical Backlog vào tổng 36 PB nếu chưa có quyết định chính thức.
| ID | Loại | Ghi chú |
| --- | --- | --- |
| PB-11 | Technical | Giữ nguyên ID và nội dung theo nguồn |
| PB-34 | Technical | Giữ nguyên ID và nội dung theo nguồn |
| PB-35 | Technical | Giữ nguyên ID và nội dung theo nguồn |
| PB-36 | Technical | Giữ nguyên ID và nội dung theo nguồn |

Quy tắc:
- Không tự phân loại 28 PB còn lại thành Function hoặc Technical khi chưa có nguồn xác nhận.
- Công việc kỹ thuật liên quan Database, API, migration và integration phải truy vết với tài liệu tương ứng trong Document Backlog.
- Không xem một tài liệu Proposed là bằng chứng công việc kỹ thuật đã hoàn thành.
# 5. DOCUMENT BACKLOG
## 5.1. Danh mục tài liệu
Giữ nguyên 12 Document Backlog IDs DB-01 đến DB-12 theo nguồn. Không tự đặt tên hoặc thay thế nội dung các ID này khi chưa đối chiếu danh mục gốc.
Các tài liệu bổ sung dưới đây là mã theo dõi tạm thời, không phải DB ID chính thức:
| Mã tạm | Tài liệu cần theo dõi | Mục đích | Trạng thái |
| --- | --- | --- | --- |
| DB-TBD-01 | Moderation Policy | Ghi nhận chính sách kiểm duyệt C9 | TBD — chưa phê duyệt |
| DB-TBD-02 | Database Migration Plan | Theo dõi migration và constraint | Proposed — chưa chạy |
| DB-TBD-03 | API Specification / OpenAPI | Hoàn thiện API Contract và API-D1..D10 | Pending |
| DB-TBD-04 | Sprint Allocation Register | Theo dõi PB → Sprint → SP | Chưa hoàn tất |
| DB-TBD-05 | Test Plan / Test Evidence | Theo dõi Test Plan và Test Registry 334 TC | Test chưa thực thi đầy đủ |

## 5.2. Vòng đời mã DB-TBD
DB-TBD-01 đến DB-TBD-05 chỉ được thăng cấp thành DB ID chính thức khi đáp ứng đầy đủ:
1. Có tên và phạm vi tài liệu rõ ràng.
2. Có nội dung hoặc deliverable xác định.
3. Có owner chịu trách nhiệm.
4. Có trạng thái và tiêu chí hoàn thành.
5. Được nhóm phê duyệt đưa vào Document Backlog chính thức.
6. Đã kiểm tra không trùng lặp với DB-01 đến DB-12.
Thẩm quyền phê duyệt: TBD — cần nhóm xác định người hoặc vai trò (B3; theo dõi tại §8.1 #7).
Điều kiện kiểm soát DB-TBD: Không thăng cấp mã tạm thành DB ID chính thức trước khi có thẩm quyền phê duyệt được xác định và quyết định phê duyệt được ghi nhận. Trong thời gian chưa có quyết định, giữ nguyên mã DB-TBD và trạng thái hiện tại.
Khi được phê duyệt:
- Gán DB ID chính thức tiếp theo theo quy tắc quản lý ID của dự án.
- Ghi lại mã tạm và DB ID chính thức trong bảng mapping.
- Không tái sử dụng mã tạm cho tài liệu khác.
- Không xóa lịch sử mã tạm.
DB-TBD-04 khi hoàn thành có thể trở thành Sprint Allocation Register chính thức. Tài liệu này bổ sung bằng chứng phân bổ Sprint, không tự động thay thế §3.3. Khi được phê duyệt, §3.3 phải dẫn chiếu đến DB ID chính thức và giữ nguyên vai trò là phần tóm tắt Sprint trong tài liệu này.
# 6. DEPENDENCY, GAP VÀ DECISION REGISTER
## 6.1. C1–C10 (mã chính thức)
| Mã | Nội dung | Trạng thái |
| --- | --- | --- |
| C1 | JWT expiry | TBD |
| C2 | Điều kiện cho phép WITHDRAWN | TBD |
| C3 | Notification trigger list | TBD |
| C4 | Cơ chế Job EXPIRED: cron hoặc manual | TBD — không dùng cho mục đích khác |
| C5 | Ràng buộc CV mặc định — T2 partial unique index | Proposed / chưa migration |
| C6 | Admin provisioning | TBD |
| C7 | Quy tắc salary_* và budget_* theo job_type | TBD |
| C8 | Tính nhất quán nguồn của work_assignments.student_id | TBD — đối chiếu G-35 |
| C9 | Moderation Policy | TBD |
| C10 | Revision limit, rating scale và comment rules | TBD |

## 6.2. S1–S6
| Mã | Nội dung | Trạng thái |
| --- | --- | --- |
| S1 | Certificate trong FR-08 | TBD |
| S2 | Withdraw Application | TBD |
| S3 | Withdraw Proposal | TBD |
| S4 | Tách PB-32 thành User/Category/Log | TBD |
| S5 | Category routes | TBD |
| S6 | Salary/Budget CHECK theo job_type | TBD |

## 6.3. T1/M1, T2 và A3
- T1/M1: Lifecycle Work Assignment là đề xuất, chưa được phê duyệt.
- T2: Partial unique index cho CV mặc định là đề xuất, chưa migration.
- A3: Chỉ POST /jobs/:jobId/selections được phép thiết lập ACCEPTED và tạo Work Assignment. Logic đã được áp dụng vào tài liệu, chưa có bằng chứng đã code.
Nguyên tắc A3:
- PATCH /applications/:id/status không được tự thiết lập ACCEPTED.
- PATCH /proposals/:id/status không được tự thiết lập ACCEPTED.
- Chỉ POST /jobs/:jobId/selections thực hiện lựa chọn ứng viên, thiết lập ACCEPTED cho nguồn được chọn và tạo Work Assignment.
- Không tuyên bố đã triển khai nếu chưa có bằng chứng.
- A3 không được tái sử dụng cho mục đích khác (ví dụ: dependency Sprint — đã tách thành DEP-01).
## 6.4. C8 và G-35 — source integrity (B4)
C8 và G-35 cùng liên quan đến tính nhất quán nguồn của work_assignments.student_id.
Quy tắc theo dõi:
- Giữ C8 là mã quyết định cần theo dõi.
- Giữ G-35 là mã Gap Register hiện có.
- Ghi quan hệ tham chiếu C8 ↔ G-35; không xóa hoặc tự đổi mã gốc.
- C8 chưa được xem là đã giải quyết chỉ vì đã có quy tắc A3. A3 kiểm soát endpoint; G-35/C8 còn liên quan đến tính toàn vẹn dữ liệu và ràng buộc nguồn trong Database.
- Cách thực thi integrity constraint và bằng chứng migration vẫn TBD.
Bốn Test Cases TC-HIRE-009..012 giữ trạng thái Not Run*, ghi chú chính xác blocked G-35. Chỉ chạy sau khi kiểm tra constraint/migration xác nhận tính toàn vẹn nguồn.
## 6.5. G-49 và G-50 — Admin API gaps
- G-49: GET /admin/stats chưa được xác nhận trong API Contract.
- G-50: GET /admin/logs chưa được xác nhận trong API Contract.
Hai endpoint là gap cần theo dõi, không tự xem là API đã được phê duyệt hoặc triển khai. Việc liên quan đến PB-32 và S4 giữ nguyên trạng thái chờ quyết định.
## 6.6. API-D1..D10
Giữ nguyên các mã API-D1 đến API-D10 và trạng thái pending approval theo API Contract. Không tự chuyển thành endpoint chính thức.
## 6.7. Mã theo dõi nội bộ File 02
Hai mã dưới đây là mã theo dõi nội bộ, không thay thế bất kỳ mã chính thức nào:
| Mã | Nội dung | Trạng thái |
| --- | --- | --- |
| DEP-01 | Dependency PB-07 → PB-08 (§3.3.1) | TBD — nhóm dự án phê duyệt |
| EPIC-GAP-01 | 12 vị trí Epic chưa có mapping xác nhận (§2.3) | TBD — chờ đối chiếu nguồn |

# 7. TEST BASELINE VÀ TRUY VẾT
## 7.1. Test Registry baseline
| Trạng thái | Số lượng |
| --- | --- |
| Not Run | 223 |
| TBD | 110 |
| Manual | 1 |
| Tổng | 334 |

Không có test nào được xác nhận Passed hoặc Verified.
## 7.2. Phân biệt Test Registry, Unique Coverage và Official Test Cases
Áp dụng bốn khái niệm riêng, đều là số liệu có điều kiện phụ thuộc A1 (xem §8.1 #8):
| Khái niệm | Số lượng | Ý nghĩa |
| --- | --- | --- |
| Test Registry | 334 | Tổng số Test Case entries đang quản lý trong Registry, bao gồm 17 Proposed entries |
| Unique Coverage | 326 | Số coverage sau khi loại 8 cặp cross-reference; vẫn bao gồm 17 Proposed entries |
| Official Entries | 317 | Số entries còn lại sau khi loại 17 Proposed entries khỏi Registry; vẫn bao gồm 8 cặp cross-reference |
| Official Unique Coverage | 309 | Coverage sau khi đồng thời loại 8 cặp cross-reference và 17 Proposed entries (nếu S4 không chấp nhận) |

Quy tắc diễn giải:
1. Registry (334) là tổng số entries đang theo dõi; không đồng nghĩa cả 334 đều có ID chính thức.
2. Unique Coverage (326) là coverage sau khi xử lý 8 cặp cross-reference; không phải số lượng Test Case ID chính thức.
3. Official Entries (317) là số entries còn lại sau khi loại 17 Proposed khỏi Registry.
4. Official Unique Coverage (309) là coverage sau khi đồng thời loại trùng cross-reference và loại 17 Proposed, nếu S4 không chấp nhận.
5. 17 Proposed entries gồm TC-CAT-001..010 và TC-LOG-001..007, trạng thái chính xác PROPOSED — pending S4.
6. Không đổi trạng thái Proposed thành Official trước khi S4 được quyết định.
7. Không cộng hoặc trừ 8 cross-reference pairs lần thứ hai khi đã sử dụng số Unique Coverage tương ứng.
Điều kiện A1: Hai cặp (1–2) và (7–8) phải được xác nhận là ánh xạ 2-to-1 độc lập, không phải parent/child của cùng coverage. Nếu phát hiện parent/child, số liệu phải sửa thành Unique = 324, Official Unique = 307. Trạng thái A1: xem §8.1 #8. Không tự đổi số liệu trước khi có kết quả đối chiếu Test Registry.
Trạng thái thực thi: 223 Not Run, 110 TBD, 1 Manual. Không có Test Case nào Passed hoặc Verified. Các trạng thái thực thi không thay đổi do việc phân biệt Registry / Unique Coverage / Official Entries.
### 7.2.1. Danh sách 8 cặp Cross-reference
Các cặp dưới đây là cross-reference, không phải Test Cases bổ sung và không được tính trùng coverage.
| # | Test Case 1 | Test Case 2 | Ghi chú |
| --- | --- | --- | --- |
| 1 | TC-AUTHZ-001 | TC-INT-AUTH-006 | Ánh xạ độc lập (A1) |
| 2 | TC-AUTHZ-001-03 | TC-INT-AUTH-003 | Ánh xạ độc lập — không phải sub-case của #1 (A1) |
| 3 | TC-APP-002-02 | TC-INT-RACE-002 | Application ↔ Integration Race |
| 4 | TC-HIRE-014 | TC-INT-RACE-001 | Hiring ↔ Integration Race |
| 5 | TC-NOTI-003 | TC-INT-NOTI-001 | Notification ↔ Integration Notification |
| 6 | TC-MOD-001 | TC-SEARCH-001-05 | Kiểm tra tác động của moderation lên search visibility. Nếu hành vi phụ thuộc C9, ghi nhận là test có điều kiện tương tự PB-31 (A2) |
| 7 | TC-VER-003 | TC-JOB-021 | Ánh xạ độc lập (A1) |
| 8 | TC-VER-003-02 | TC-JOB-022 | Ánh xạ độc lập — không phải sub-case của #7 (A1) |

Quy tắc đếm:
- Registry: 334 entries.
- Trừ 8 cặp cross-reference → Unique Coverage: 326.
- Trừ tiếp 17 Proposed entries → Official Unique Coverage: 309 (nếu S4 không chấp nhận).
- Không trừ 8 cặp cross-reference lần thứ hai khỏi Unique Coverage đã tính.
Guard rail (D1): Khi thêm cặp cross-reference mới, phải xác nhận cả hai ID chưa thuộc cặp nào khác. Nếu một ID đã thuộc cặp khác, đó là dấu hiệu equivalence class lớn hơn 2 — phải tính lại số entries bị loại, không mặc định là 1.
## 7.3. Blocked Tests
| Test ID | Trạng thái | Điều kiện |
| --- | --- | --- |
| TC-HIRE-009 | Not Run* | blocked G-35 |
| TC-HIRE-010 | Not Run* | blocked G-35 |
| TC-HIRE-011 | Not Run* | blocked G-35 |
| TC-HIRE-012 | Not Run* | blocked G-35 |

Không thực thi trước khi kiểm tra Database constraint/migration liên quan source integrity.
## 7.4. Semantic changes
Giữ nguyên hai Test IDs có thay đổi ý nghĩa:
- TC-FRE-003: Deliverable Submission.
- TC-FRE-004: Deliverable Acceptance.
Không tự đổi ID hoặc quay lại cách hiểu cũ.
# 8. REVIEW CHECKLIST VÀ QUYẾT ĐỊNH CẦN CHỐT
## 8.1. Ưu tiên cao — quyết định cần chốt trước khi phê duyệt
| # | Nội dung review | Trạng thái cần xác nhận |
| --- | --- | --- |
| 1 | DEP-01 — PB-07 thuộc Sprint nào hoặc đã hoàn thành trước Sprint 1? | TBD |
| 2 | Nếu PB-07 chưa sẵn sàng, PB-08 có được chuyển sang Sprint tiếp theo không? | TBD |
| 3 | B1 — PB-31 giữ Sprint 2 hay dời sang Sprint sau khi C9 được chốt? | TBD |
| 4 | B2 — C9 Moderation Policy được phê duyệt bởi ai và khi nào? | TBD |
| 5 | B4 — C8/G-35 source integrity được giải quyết bằng constraint nào và có bằng chứng migration chưa? | TBD |
| 6 | Test baseline 334 TC được duy trì tại Test Plan/Registry và liên kết DB-TBD-05 như thế nào? | TBD |
| 7 | B3 — Ai hoặc vai trò nào có thẩm quyền phê duyệt thăng cấp DB-TBD-01..05 thành DB ID chính thức? | TBD — Meta-TBD; chặn hoàn tất vòng đời Document Backlog |
| 8 | A1 — TC-AUTHZ-001 ≠ TC-AUTHZ-001-03 và TC-VER-003 ≠ TC-VER-003-02 (không phải parent/child của cùng coverage)? | TBD — nếu là cùng coverage, sửa 326→324 và 309→307 |

## 8.2. Ưu tiên trung bình
| # | Nội dung review | Trạng thái cần xác nhận |
| --- | --- | --- |
| 9 | EPIC-GAP-01 — Tên chính thức và PB mapping của 12 vị trí Epic (hiện là nhãn vị trí tạm, không phải Epic ID) | TBD |
| 10 | Sprint length | TBD |
| 11 | Team size và vai trò | TBD |
| 12 | Historical velocity hoặc cơ sở ước lượng velocity | TBD |
| 13 | C1–C10 và S1–S6: đối chiếu từng mã với tài liệu 01 và ghi nhận chênh lệch (nếu có) vào Decision Register §6 | TBD |

Ghi chú: Mục "Thẩm quyền phê duyệt DB-TBD" đã được hợp nhất về §8.1 #7. Không lặp lại tại §8.2.
## 8.3. Điều kiện phê duyệt
Tài liệu chỉ được xem là hoàn tất ở mức quản trị khi:
- Các PB ID và MoSCoW được giữ đúng.
- DEP-01: PB-07/PB-08 có dependency resolution được ghi nhận.
- B1/B2: PB-31/C9 có quyết định được ghi nhận.
- B3: Thẩm quyền phê duyệt DB-TBD được xác định.
- B4: C8/G-35 được theo dõi với constraint/migration evidence.
- A1: 8 cặp cross-reference được xác nhận là ánh xạ 2-to-1 độc lập (nếu không, cập nhật 326→324 và 309→307).
- EPIC-GAP-01: 12 vị trí Epic có mapping được đối chiếu từ nguồn hoặc được ghi nhận là chưa truy vết được.
- Sprint capacity được xác định bằng dữ liệu nhóm.
- Document Backlog có quy tắc vòng đời ID.
- Test baseline 334 TC được dẫn chiếu rõ ràng.
- G-35/C8, G-49, G-50 không bị bỏ khỏi danh mục theo dõi.
- Các trạng thái TBD, Proposed và Not Run được giữ chính xác.
- Không có mã chính thức nào (C1–C10, A3, T1/M1, T2, S1–S6, G-xx, API-Dxx) bị tái sử dụng cho mục đích khác.
# 9. TRẠNG THÁI CUỐI TÀI LIỆU
| Thành phần | Trạng thái |
| --- | --- |
| Product Backlog 36 PB | Đã khóa dải ID và MoSCoW |
| Epic 12 | Chưa đủ dữ liệu mapping; đang dùng nhãn vị trí tạm (EPIC-GAP-01) |
| Technical Backlog | Đã nhận diện 4 Technical items |
| Document Backlog | 12 DB IDs nguồn + 5 mã theo dõi tạm |
| Sprint Plan | Target, chưa phải allocation thực thi |
| PB-07/PB-08 | Dependency chưa được giải quyết (DEP-01) |
| PB-31/C9 | Chưa có quyết định (B1/B2) |
| Sprint capacity | TBD |
| C1–C10, S1–S6 | Đã đưa vào Decision Register (§6.1, §6.2) — không tái sử dụng mã |
| C8/G-35 | Đã liên kết để tiếp tục theo dõi |
| G-49/G-50 | Được giữ trong Gap Register |
| Test Registry | 334 TC — Registry; 326 Unique; 317 Official Entries; 309 Official Unique (điều kiện A1) |
| 8 cặp cross-reference | Đã liệt kê đầy đủ (§7.2.1) |
| T1/M1/T2/A3 | Giữ đúng trạng thái đề xuất hoặc logic tài liệu; A3 không tái sử dụng |
| Mã theo dõi nội bộ File 02 | DEP-01, EPIC-GAP-01 — không thay thế mã chính thức |

Kết luận: Bản Consolidated Draft (Revision 3.1) đã hợp nhất toàn bộ delta review, sửa các lỗi tái sử dụng mã quyết định, chuẩn hóa cách gọi 12 vị trí Epic và giữ nguyên các số liệu test dưới dạng có điều kiện (A1). Tài liệu đạt mức "Draft — đủ điều kiện review chính thức" nhưng chưa phải Approved.
Các quyết định còn mở (phải chốt trước khi Approved):
- DEP-01 — PB-07 Sprint nào.
- B1/B2 — PB-31 và C9.
- B3 — Thẩm quyền DB-TBD.
- B4 — C8/G-35 constraint + migration evidence.
- A1 — Xác nhận 8 cặp cross-reference.
- EPIC-GAP-01 — Epic mapping.
- Sprint capacity / velocity / length.
Không tuyên bố Sprint Plan đã sẵn sàng thực thi khi các điều kiện tại §8.3 chưa hoàn thành.