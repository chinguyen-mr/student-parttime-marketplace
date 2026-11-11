# MCP (Model Context Protocol) Architecture — JobNest

Thư mục này tài liệu hóa toàn bộ cấu hình, năng lực và hướng dẫn sử dụng các máy chủ MCP (Model Context Protocol Servers) đang được tích hợp vào dự án JobNest.

---

## 1. Danh mục các MCP Servers

| MCP Server | Giao thức | Chức năng chính | Trạng thái tích hợp |
| :--- | :--- | :--- | :--- |
| **GitNexus MCP** | `gitnexus://` & Tool calls | Phân tích đồ thị phụ thuộc (Call graph), truy vấn cluster, phát hiện thay đổi và kiểm tra blast radius | Đang hoạt động (.gitnexus/) |
| **Graphify MCP** | Tool calls & URI queries | Biến toàn bộ codebase thành Knowledge Graph có thể điều hướng, phát hiện god nodes và truy vấn đường đi ngắn nhất | Đang hoạt động (graphify-out/) |
| **Playwright MCP** | Browser automation | Tự động hóa trình duyệt không giao diện (Headless browser), kiểm thử E2E, chụp ảnh màn hình, kiểm tra network requests | Đang hoạt động (.playwright-mcp/) |
| **Chrome DevTools MCP**| Chrome debugging protocol | Kiểm tra console logs, phân tích hiệu năng Lighthouse, trích xuất CSS styles và network requests | Đang hoạt động |

---

## 2. Hướng dẫn chi tiết từng Server
- [playwright.md](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/.ai/mcp/playwright.md)
- [chrome-devtools.md](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/.ai/mcp/chrome-devtools.md)
- [gitnexus-mcp.md](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/.ai/mcp/gitnexus-mcp.md)
- [graphify-mcp.md](file:///d:/Tai%20Lieu/DuLieuHoc/%C4%90%E1%BB%93%20%C3%81n%20T%E1%BB%91t%20Nghi%E1%BB%87p/Chuy%C3%AAn%20%C4%90%E1%BB%81%202/.ai/mcp/graphify-mcp.md)

