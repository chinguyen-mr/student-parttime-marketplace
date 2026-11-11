# HỆ THỐNG QUẢN LÝ TẬP TRUNG TÀI NGUYÊN AI (CENTRALIZED AI TOOLING HUB) — JOBNEST

Chào mừng bạn đến với thư mục `.ai/` của dự án **JOBNEST**. Đây là trung tâm quản lý tập trung (Single Source of Truth - SSOT) cho toàn bộ hệ thống AI Agents, Kỹ năng (Skills), Quy tắc (Rules), Quy trình (Workflows), Prompt templates và cấu hình MCP trong repository.

---

## 1. Mục đích của thư mục `.ai`

Trong quá trình phát triển phần mềm với sự hỗ trợ của các AI Coding Agents (Antigravity, Claude Code, GitHub Copilot, Codex, Kilo), các tài nguyên cấu hình, hướng dẫn và kỹ năng thường bị phân tán ở nhiều thư mục ẩn khác nhau (`.agents/`, `.claude/`, `.github/`, `.kilo/`).

Thư mục `.ai/` được thiết kế nhằm:
1. **Tập trung hóa:** Gom toàn bộ tri thức, định nghĩa vai trò Agent, hướng dẫn kỹ năng chuyên sâu vào một nơi duy nhất có tổ chức rõ ràng.
2. **Dễ bảo trì và mở rộng:** Giúp lập trình viên và thành viên nhóm dễ dàng tra cứu, cập nhật hoặc bổ sung Agent/Skill mới mà không làm xáo trộn cấu hình của từng công cụ.
3. **Độc lập và di động:** Thuận tiện sao chép, đồng bộ và sử dụng trên nhiều máy tính khác nhau mà không bị phụ thuộc vào một IDE hay công cụ AI cố định.
4. **Bảo toàn khả năng tương thích:** Các thư mục riêng của công cụ (`.agents/`, `.claude/`, `.github/`) đóng vai trò như các adapter/entry points tự động nạp hoặc tham chiếu về trung tâm `.ai/`.

---

## 2. Cấu trúc tổ chức thư mục

```text
.ai/
│
├── agents/                       # Định nghĩa vai trò và trách nhiệm của từng AI Agent
│   ├── frontend/                 # Senior Frontend Architect & UI Engineer
│   ├── backend/                  # Senior Backend Engineer & API Architect
│   ├── database/                 # Database Specialist (PostgreSQL DBA)
│   ├── ui-ux/                    # UI/UX Craft & Product Designer (Impeccable)
│   ├── security/                 # DevSecOps & Security Auditor (OWASP Top 10)
│   ├── testing/                  # QA & Test Automation Engineer
│   └── general/                  # Principal Software Architect & Coordinator
│
├── skills/                       # Thư viện kỹ năng chuyên sâu phân loại theo lĩnh vực
│   ├── frontend/                 # frontend-design-workflow
│   ├── backend/                  # gitnexus-cli, gitnexus-exploring, gitnexus-guide, gitnexus-refactoring
│   ├── ui-ux/                    # better-web-ui, no-slop-ui, impeccable
│   ├── security/                 # security-audit
│   ├── testing/                  # gitnexus-debugging, gitnexus-impact-analysis, graphify
│   └── documentation/            # ppt-master
│
├── prompts/                      # Kho lưu trữ các mẫu prompt và master prompts chuẩn hóa
│   ├── master-agent-integration.md
│   ├── master-twenty-crm.md
│   ├── master-ui-audit-refactoring.md
│   ├── master-tooling-consolidation.md
│   ├── feature-implementation-template.md
│   └── bug-investigation-template.md
│
├── rules/                        # Các quy chuẩn và luật lệ bắt buộc khi code
│   ├── anti-ai-slop-frontend.md  # Quy chuẩn chống giao diện AI đại trà
│   ├── code-quality.md           # Surgical changes & Simplicity first
│   ├── devsecops-security.md     # An toàn thông tin & phi phá hủy
│   ├── drawio-architecture-maintenance.md # Quản lý 5 sơ đồ Draw.io
│   ├── gitnexus-intelligence.md  # Phân tích tác động đồ thị bắt buộc
│   └── graphify-knowledge-graph.md# Luật sử dụng đồ thị tri thức
│
├── workflows/                    # Quy trình thực thi nhiều bước từng kịch bản
│   ├── code-change-impact-workflow.md
│   ├── graphify-pipeline.md
│   ├── presentation-generation.md
│   ├── security-audit-pipeline.md
│   └── ui-ux-audit-pipeline.md
│
├── mcp/                          # Tài liệu hóa và hướng dẫn các MCP Servers
│   ├── README.md                 # Tổng quan các MCP server tích hợp
│   ├── chrome-devtools.md        # Chrome DevTools MCP
│   ├── gitnexus-mcp.md           # GitNexus Code Intelligence MCP
│   ├── graphify-mcp.md           # Graphify Knowledge Graph MCP
│   └── playwright.md             # Playwright E2E Browser MCP
│
├── references/                   # Tài liệu đối chiếu và thông số thiết kế
│   ├── architecture-diagrams-guide.md
│   ├── better-web-ui-context.md
│   └── design-system-tokens.md
│
└── README.md                     # Tài liệu hướng dẫn sử dụng thư mục .ai/
```

---

## 3. Hướng dẫn thêm mới tài nguyên

### 3.1. Thêm một AI Agent mới
1. Xác định phân hệ phụ trách (`frontend`, `backend`, `database`, `ui-ux`, `security`, `testing`, `general`).
2. Tạo file markdown trong `.ai/agents/<lĩnh_vực>/<tên-agent>.md`.
3. Định nghĩa đủ 4 phần:
   - `Identity & Role`: Tên vai trò, công nghệ cốt lõi.
   - `Nhiệm vụ trọng tâm`: Các trách nhiệm cụ thể.
   - `Quy chuẩn cấm kỵ`: Điều tuyệt đối không được vi phạm.
   - `Tham chiếu kỹ năng liên quan`: Trỏ tới các file `SKILL.md` tương ứng trong `.ai/skills/`.

### 3.2. Thêm một Skill mới
1. Phân loại skill vào thư mục phù hợp trong `.ai/skills/<lĩnh_vực>/<tên-skill>/`.
2. Tạo file bắt buộc `SKILL.md` có YAML Frontmatter:
   ```markdown
   ---
   name: ten-skill
   description: Mô tả ngắn gọn nhiệm vụ và thời điểm kích hoạt skill
   ---
   # Tên Skill
   ... Hướng dẫn chi tiết ...
   ```
3. Nếu công cụ AI (như Antigravity hoặc Claude Code) yêu cầu nạp tự động, đặt bản sao hoặc entry point tại `.agents/skills/<tên-skill>/` hoặc `.claude/skills/<tên-skill>/`.

### 3.3. Thêm một Prompt Template mới
1. Đặt file vào `.ai/prompts/<tên-mục-đích>.md`.
2. Định dạng rõ ràng: Bối cảnh, Yêu cầu chi tiết, Dữ liệu đầu vào, Tiêu chuẩn nghiệm thu.

### 3.4. Thêm một Rule mới
1. Đặt file vào `.ai/rules/<tên-quy-chuẩn>.md`.
2. Nêu rõ phạm vi áp dụng, nguyên tắc cốt lõi (Always Do / Never Do) và phương pháp kiểm chứng.

### 3.5. Quản lý cấu hình MCP
1. Khi tích hợp một MCP server mới, ghi nhận tài liệu cấu hình tại `.ai/mcp/<tên-server>.md`.
2. Liệt kê danh sách Tools, Resources và Prompts mà server cung cấp.

---

## 4. Quy tắc đặt tên và tham chiếu (Naming & Linking Conventions)

- **Đặt tên file/thư mục:** Sử dụng định dạng kebab-case viết thường, phân tách bằng dấu gạch ngang (ví dụ: `frontend-design-workflow`, `anti-ai-slop-frontend.md`).
- **Liên kết file:** Luôn sử dụng đường dẫn tương đối từ gốc repository hoặc đường dẫn tuyệt đối dạng `file://` theo chuẩn markdown để lập trình viên có thể click mở trực tiếp trong IDE.

---

## 5. Hướng dẫn sử dụng trên máy tính khác (Multi-Machine Setup)

Khi clone repository này sang một máy tính mới:
1. **Kiểm tra môi trường:**
   - Đảm bảo máy đã cài đặt Node.js ($\ge 18$), Python ($\ge 3.10$), Docker Desktop và Git.
2. **Kích hoạt công cụ AI:**
   - Các công cụ AI (như Antigravity, Claude Code, VS Code Copilot) sẽ tự động nhận diện các file quy chuẩn tại gốc (`AGENTS.md`, `CLAUDE.md`, `.agents/`, `.claude/`).
   - Mọi hướng dẫn chuyên sâu, prompt mẫu và kịch bản workflow đều có thể đọc trực tiếp từ `.ai/`.
3. **Cập nhật đồ thị GitNexus và Graphify:**
   ```bash
   # Cập nhật GitNexus index
   node .gitnexus/run.cjs analyze --index-only

   # Cập nhật Graphify knowledge graph
   graphify update .
   ```

