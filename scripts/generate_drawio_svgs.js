const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'docs', 'architecture');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function buildDrawioSvg(width, height, title, svgInnerContent, mxGraphXml) {
    const escapedMxGraph = escapeXml(mxGraphXml);
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="${width}px" height="${height}px" viewBox="0 0 ${width} ${height}" content="${escapedMxGraph}">
  <defs>
    <style type="text/css">
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&amp;display=swap');
      text { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
    </style>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7565A8" />
      <stop offset="100%" stop-color="#5B4A8D" />
    </linearGradient>
    <linearGradient id="peachGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F4B99D" />
      <stop offset="100%" stop-color="#E8A484" />
    </linearGradient>
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="115%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#7565A8" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Canvas Background -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="#F8F7FB" rx="16" />
  
  <!-- Header Bar -->
  <rect x="0" y="0" width="${width}" height="70" fill="url(#headerGrad)" rx="16" />
  <rect x="0" y="50" width="${width}" height="20" fill="url(#headerGrad)" />
  <text x="30" y="44" fill="#FFFFFF" font-size="22" font-weight="700">JOBNEST ARCHITECTURE — ${title.toUpperCase()}</text>
  <text x="${width - 240}" y="44" fill="#F4B99D" font-size="13" font-weight="600">Soft Lavender &amp; Peach Theme</text>

  <!-- Diagram Graphical Content -->
  ${svgInnerContent}
</svg>`;
}

// ==========================================
// 1. SYSTEM CONTEXT DIAGRAM
// ==========================================
const scSvg = `
  <!-- Users Column -->
  <g filter="url(#cardShadow)">
    <rect x="60" y="120" width="220" height="110" rx="12" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <circle cx="100" cy="175" r="24" fill="#EEEAF7" />
    <text x="100" y="181" font-size="18" text-anchor="middle" fill="#7565A8">🎓</text>
    <text x="140" y="165" font-size="16" font-weight="700" fill="#29263A">Sinh viên (Student)</text>
    <text x="140" y="185" font-size="12" fill="#777486">Tìm việc, nộp CV,</text>
    <text x="140" y="200" font-size="12" fill="#777486">theo dõi ứng tuyển</text>
  </g>

  <g filter="url(#cardShadow)">
    <rect x="60" y="260" width="220" height="110" rx="12" fill="#FFFFFF" stroke="#F4B99D" stroke-width="2" />
    <circle cx="100" cy="315" r="24" fill="#FDF1EA" />
    <text x="100" y="321" font-size="18" text-anchor="middle" fill="#E8A484">🏢</text>
    <text x="140" y="305" font-size="16" font-weight="700" fill="#29263A">Doanh nghiệp</text>
    <text x="140" y="325" font-size="12" fill="#777486">Đăng tin tuyển dụng,</text>
    <text x="140" y="340" font-size="12" fill="#777486">sàng lọc &amp; duyệt CV</text>
  </g>

  <g filter="url(#cardShadow)">
    <rect x="60" y="400" width="220" height="110" rx="12" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <circle cx="100" cy="455" r="24" fill="#EEEAF7" />
    <text x="100" y="461" font-size="18" text-anchor="middle" fill="#7565A8">🛡️</text>
    <text x="140" y="445" font-size="16" font-weight="700" fill="#29263A">Quản trị viên (Admin)</text>
    <text x="140" y="465" font-size="12" fill="#777486">Duyệt tin, xác thực DN,</text>
    <text x="140" y="480" font-size="12" fill="#777486">giám sát hệ thống</text>
  </g>

  <!-- JobNest Central System -->
  <g filter="url(#cardShadow)">
    <rect x="360" y="120" width="380" height="390" rx="16" fill="#FFFFFF" stroke="#7565A8" stroke-width="3" />
    <rect x="360" y="120" width="380" height="48" rx="16" fill="#7565A8" />
    <rect x="360" y="150" width="380" height="18" fill="#7565A8" />
    <text x="550" y="152" fill="#FFFFFF" font-size="18" font-weight="700" text-anchor="middle">JOBNEST PLATFORM CORE</text>

    <!-- Sub-modules -->
    <rect x="385" y="190" width="155" height="85" rx="8" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="462" y="225" font-size="13" font-weight="700" fill="#29263A" text-anchor="middle">Xác thực &amp; Hồ sơ</text>
    <text x="462" y="245" font-size="11" fill="#777486" text-anchor="middle">JWT, RBAC, Profiles</text>

    <rect x="560" y="190" width="155" height="85" rx="8" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="637" y="225" font-size="13" font-weight="700" fill="#29263A" text-anchor="middle">Tin tuyển dụng</text>
    <text x="637" y="245" font-size="11" fill="#777486" text-anchor="middle">Search, Filter, Categories</text>

    <rect x="385" y="295" width="155" height="85" rx="8" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="462" y="330" font-size="13" font-weight="700" fill="#29263A" text-anchor="middle">Ứng tuyển &amp; Giao việc</text>
    <text x="462" y="350" font-size="11" fill="#777486" text-anchor="middle">Applications, Workflows</text>

    <rect x="560" y="295" width="155" height="85" rx="8" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="637" y="330" font-size="13" font-weight="700" fill="#29263A" text-anchor="middle">Đánh giá &amp; Báo cáo</text>
    <text x="637" y="350" font-size="11" fill="#777486" text-anchor="middle">Reviews, Analytics, Logs</text>

    <!-- Database indicator inside -->
    <rect x="385" y="405" width="330" height="75" rx="8" fill="#EEEAF7" stroke="#7565A8" stroke-dasharray="4" />
    <text x="550" y="435" font-size="14" font-weight="700" fill="#7565A8" text-anchor="middle">PostgreSQL Database (13 Core Tables)</text>
    <text x="550" y="455" font-size="12" fill="#777486" text-anchor="middle">users, profiles, jobs, applications, assignments,...</text>
  </g>

  <!-- External Systems Column -->
  <g filter="url(#cardShadow)">
    <rect x="820" y="160" width="220" height="95" rx="12" fill="#FFFFFF" stroke="#D5CFE2" stroke-width="1.5" />
    <text x="930" y="200" font-size="15" font-weight="700" fill="#29263A" text-anchor="middle">Email Notification (SMTP)</text>
    <text x="930" y="222" font-size="12" fill="#777486" text-anchor="middle">Gửi thông báo &amp; kết quả duyệt</text>
  </g>

  <g filter="url(#cardShadow)">
    <rect x="820" y="280" width="220" height="95" rx="12" fill="#FFFFFF" stroke="#D5CFE2" stroke-width="1.5" />
    <text x="930" y="320" font-size="15" font-weight="700" fill="#29263A" text-anchor="middle">Bản đồ &amp; Địa điểm</text>
    <text x="930" y="342" font-size="12" fill="#777486" text-anchor="middle">Hiển thị vị trí làm việc</text>
  </g>

  <g filter="url(#cardShadow)">
    <rect x="820" y="400" width="220" height="95" rx="12" fill="#FFFFFF" stroke="#D5CFE2" stroke-width="1.5" />
    <text x="930" y="440" font-size="15" font-weight="700" fill="#29263A" text-anchor="middle">Lưu trữ CV &amp; Tài sản</text>
    <text x="930" y="462" font-size="12" fill="#777486" text-anchor="middle">Tệp PDF hồ sơ, Logo công ty</text>
  </g>

  <!-- Connectors -->
  <line x1="280" y1="175" x2="360" y2="230" stroke="#7565A8" stroke-width="2" marker-end="url(#arrow)" />
  <line x1="280" y1="315" x2="360" y2="315" stroke="#F4B99D" stroke-width="2" marker-end="url(#arrow)" />
  <line x1="280" y1="455" x2="360" y2="380" stroke="#7565A8" stroke-width="2" marker-end="url(#arrow)" />

  <line x1="740" y1="210" x2="820" y2="210" stroke="#777486" stroke-width="1.5" stroke-dasharray="4" />
  <line x1="740" y1="330" x2="820" y2="330" stroke="#777486" stroke-width="1.5" stroke-dasharray="4" />
  <line x1="740" y1="440" x2="820" y2="440" stroke="#777486" stroke-width="1.5" stroke-dasharray="4" />
`;

const scMx = `<mxfile host="app.diagrams.net"><diagram name="System Context"><mxGraphModel dx="1000" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="600"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="u1" value="Sinh viên (Student)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="60" y="120" width="220" height="110" as="geometry"/></mxCell><mxCell id="u2" value="Doanh nghiệp (Employer)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#F4B99D;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="60" y="260" width="220" height="110" as="geometry"/></mxCell><mxCell id="u3" value="Quản trị viên (Admin)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="60" y="400" width="220" height="110" as="geometry"/></mxCell><mxCell id="core" value="JOBNEST PLATFORM CORE" style="swimlane;whiteSpace=wrap;html=1;fillColor=#F8F7FB;strokeColor=#7565A8;startSize=40;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="360" y="120" width="380" height="390" as="geometry"/></mxCell><mxCell id="ext1" value="Email SMTP Service" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#D5CFE2;" vertex="1" parent="1"><mxGeometry x="820" y="160" width="220" height="95" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>`;

fs.writeFileSync(path.join(outDir, 'system-context.drawio.svg'), buildDrawioSvg(1100, 560, 'Sơ Đồ Ngữ Cảnh Hệ Thống (System Context)', scSvg, scMx));

// ==========================================
// 2. APPLICATION ARCHITECTURE DIAGRAM
// ==========================================
const appSvg = `
  <!-- Presentation Layer -->
  <g filter="url(#cardShadow)">
    <rect x="50" y="110" width="310" height="420" rx="14" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <rect x="50" y="110" width="310" height="45" rx="14" fill="#7565A8" />
    <rect x="50" y="140" width="310" height="15" fill="#7565A8" />
    <text x="205" y="140" fill="#FFFFFF" font-size="16" font-weight="700" text-anchor="middle">FRONTEND TIER (REACT SPA)</text>

    <rect x="70" y="175" width="270" height="65" rx="8" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="85" y="200" font-size="14" font-weight="700" fill="#29263A">Portals &amp; Pages</text>
    <text x="85" y="222" font-size="11" fill="#777486">Student, Employer, Admin, Guest Pages</text>

    <rect x="70" y="255" width="270" height="65" rx="8" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="85" y="280" font-size="14" font-weight="700" fill="#29263A">Shared UI Components</text>
    <text x="85" y="302" font-size="11" fill="#777486">JobCard, CustomDropdown, Modals, Toasts</text>

    <rect x="70" y="335" width="270" height="65" rx="8" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="85" y="360" font-size="14" font-weight="700" fill="#29263A">State &amp; Context</text>
    <text x="85" y="382" font-size="11" fill="#777486">AuthContext, ThemeContext, Route Guards</text>

    <rect x="70" y="415" width="270" height="85" rx="8" fill="#FDF1EA" stroke="#F4B99D" />
    <text x="85" y="440" font-size="13" font-weight="700" fill="#E8A484">Vite Build &amp; Tailwind Engine</text>
    <text x="85" y="462" font-size="11" fill="#777486">Axios HTTP Client + Interceptors (Bearer Token)</text>
    <text x="85" y="480" font-size="11" fill="#777486">Design Tokens: Soft Lavender &amp; Peach</text>
  </g>

  <!-- Middle Connector (REST API) -->
  <line x1="360" y1="320" x2="420" y2="320" stroke="#7565A8" stroke-width="3" />
  <rect x="365" y="285" width="50" height="25" rx="4" fill="#7565A8" />
  <text x="390" y="302" fill="#FFFFFF" font-size="11" font-weight="700" text-anchor="middle">JSON</text>

  <!-- Backend Layer -->
  <g filter="url(#cardShadow)">
    <rect x="420" y="110" width="370" height="420" rx="14" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <rect x="420" y="110" width="370" height="45" rx="14" fill="#7565A8" />
    <rect x="420" y="140" width="370" height="15" fill="#7565A8" />
    <text x="605" y="140" fill="#FFFFFF" font-size="16" font-weight="700" text-anchor="middle">BACKEND TIER (NODE.JS + EXPRESS)</text>

    <rect x="440" y="175" width="330" height="65" rx="8" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="455" y="200" font-size="14" font-weight="700" fill="#29263A">Routing &amp; Middlewares</text>
    <text x="455" y="222" font-size="11" fill="#777486">CORS, JWT Verify, Role Guard (RBAC), Error Handler</text>

    <rect x="440" y="255" width="330" height="65" rx="8" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="455" y="280" font-size="14" font-weight="700" fill="#29263A">Business Logic (Service Layer)</text>
    <text x="455" y="302" font-size="11" fill="#777486">AuthService, JobService, ApplicationService,...</text>

    <rect x="440" y="335" width="330" height="65" rx="8" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="455" y="360" font-size="14" font-weight="700" fill="#29263A">Data Access (Repository Layer)</text>
    <text x="455" y="382" font-size="11" fill="#777486">UserRepository, JobRepository (Parameterized $1, $2)</text>

    <rect x="440" y="415" width="330" height="85" rx="8" fill="#EEEAF7" stroke="#7565A8" />
    <text x="455" y="440" font-size="13" font-weight="700" fill="#7565A8">Database Connection Pool</text>
    <text x="455" y="462" font-size="11" fill="#777486">pg.Pool quản lý kết nối an toàn, auto-reconnect</text>
    <text x="455" y="480" font-size="11" fill="#777486">Config: Host, Port, User, Password, DB Name từ .env</text>
  </g>

  <!-- Middle Connector (SQL) -->
  <line x1="790" y1="320" x2="840" y2="320" stroke="#7565A8" stroke-width="3" />
  <rect x="795" y="285" width="40" height="25" rx="4" fill="#F4B99D" />
  <text x="815" y="302" fill="#29263A" font-size="11" font-weight="700" text-anchor="middle">SQL</text>

  <!-- Database Layer -->
  <g filter="url(#cardShadow)">
    <rect x="840" y="110" width="280" height="420" rx="14" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <rect x="840" y="110" width="280" height="45" rx="14" fill="#7565A8" />
    <rect x="840" y="140" width="280" height="15" fill="#7565A8" />
    <text x="980" y="140" fill="#FFFFFF" font-size="16" font-weight="700" text-anchor="middle">POSTGRESQL 17 TIER</text>

    <rect x="860" y="175" width="240" height="135" rx="8" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="875" y="200" font-size="14" font-weight="700" fill="#29263A">13 Core Relational Tables</text>
    <text x="875" y="222" font-size="11" fill="#777486">• users, profiles (student, company)</text>
    <text x="875" y="240" font-size="11" fill="#777486">• jobs, categories, applications</text>
    <text x="875" y="258" font-size="11" fill="#777486">• work_assignments, deliverables</text>
    <text x="875" y="276" font-size="11" fill="#777486">• proposals, reviews, notifications</text>
    <text x="875" y="294" font-size="11" fill="#777486">• audit_logs, moderation_reports</text>

    <rect x="860" y="325" width="240" height="175" rx="8" fill="#FDF1EA" stroke="#F4B99D" />
    <text x="875" y="350" font-size="13" font-weight="700" fill="#E8A484">Data Integrity &amp; Seed</text>
    <text x="875" y="372" font-size="11" fill="#777486">• Chuẩn hóa từ Data_v2.xlsx</text>
    <text x="875" y="390" font-size="11" fill="#777486">• Khóa chính UUID / Serial</text>
    <text x="875" y="408" font-size="11" fill="#777486">• Ràng buộc toàn vẹn khóa ngoại (FK)</text>
    <text x="875" y="426" font-size="11" fill="#777486">• Script import tự động</text>
    <text x="875" y="444" font-size="11" fill="#777486">• Persistent Volume postgres_data</text>
  </g>
`;

const appMx = `<mxfile host="app.diagrams.net"><diagram name="Application Architecture"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="600"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="fe" value="Frontend Tier (React SPA)" style="swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="50" y="110" width="310" height="420" as="geometry"/></mxCell><mxCell id="be" value="Backend Tier (Express API)" style="swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="420" y="110" width="370" height="420" as="geometry"/></mxCell><mxCell id="db" value="Database Tier (PostgreSQL 17)" style="swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="840" y="110" width="280" height="420" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>`;

fs.writeFileSync(path.join(outDir, 'application-architecture.drawio.svg'), buildDrawioSvg(1180, 560, 'Kiến Trúc Phân Tầng Ứng Dụng (Application Architecture)', appSvg, appMx));

// ==========================================
// 3. DEPLOYMENT ARCHITECTURE DIAGRAM
// ==========================================
const depSvg = `
  <!-- Host Machine Boundary -->
  <rect x="40" y="100" width="1080" height="430" rx="14" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" stroke-dasharray="6" />
  <text x="70" y="130" font-size="15" font-weight="700" fill="#7565A8">HOST SERVER (DEVELOPMENT / PRODUCTION DOCKER ENGINE)</text>

  <!-- Port Mapping Indicators -->
  <g>
    <rect x="120" y="150" width="260" height="40" rx="6" fill="#EEEAF7" stroke="#7565A8" />
    <text x="250" y="175" font-size="12" font-weight="700" fill="#7565A8" text-anchor="middle">Browser Access: http://localhost:8080</text>
  </g>

  <g>
    <rect x="460" y="150" width="260" height="40" rx="6" fill="#EEEAF7" stroke="#7565A8" />
    <text x="590" y="175" font-size="12" font-weight="700" fill="#7565A8" text-anchor="middle">API Direct Access: http://localhost:5000</text>
  </g>

  <g>
    <rect x="800" y="150" width="260" height="40" rx="6" fill="#FDF1EA" stroke="#F4B99D" />
    <text x="930" y="175" font-size="12" font-weight="700" fill="#E8A484" text-anchor="middle">Database Port: 5432:5432 (Dev Host)</text>
  </g>

  <!-- Docker Bridge Network Box -->
  <rect x="70" y="210" width="1020" height="300" rx="12" fill="#F8F7FB" stroke="#D5CFE2" stroke-width="2" />
  <text x="95" y="240" font-size="14" font-weight="700" fill="#29263A">Docker Bridge Network: "jobnest"</text>

  <!-- Container 1: Frontend -->
  <g filter="url(#cardShadow)">
    <rect x="100" y="260" width="290" height="220" rx="10" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <rect x="100" y="260" width="290" height="36" rx="10" fill="#7565A8" />
    <rect x="100" y="285" width="290" height="11" fill="#7565A8" />
    <text x="245" y="285" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle">CONTAINER: jobnest-frontend</text>
    <text x="120" y="325" font-size="12" font-weight="600" fill="#29263A">• Image: jobnest-frontend:latest</text>
    <text x="120" y="348" font-size="12" fill="#777486">• Web Server: Nginx (Alpine)</text>
    <text x="120" y="371" font-size="12" fill="#777486">• Exposed Port: 8080:80</text>
    <text x="120" y="394" font-size="12" fill="#777486">• Static Assets: Vite Dist Bundle</text>
    <text x="120" y="417" font-size="12" fill="#777486">• Depends on: backend</text>
    <text x="120" y="445" font-size="11" font-weight="700" fill="#7565A8">Status: Healthy / Running</text>
  </g>

  <!-- Container 2: Backend -->
  <g filter="url(#cardShadow)">
    <rect x="440" y="260" width="300" height="220" rx="10" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <rect x="440" y="260" width="300" height="36" rx="10" fill="#7565A8" />
    <rect x="440" y="285" width="300" height="11" fill="#7565A8" />
    <text x="590" y="285" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle">CONTAINER: jobnest-backend</text>
    <text x="460" y="325" font-size="12" font-weight="600" fill="#29263A">• Image: jobnest-backend:latest</text>
    <text x="460" y="348" font-size="12" fill="#777486">• Runtime: Node.js 20+ (Alpine)</text>
    <text x="460" y="371" font-size="12" fill="#777486">• Exposed Port: 5000:5000</text>
    <text x="460" y="394" font-size="12" fill="#777486">• Env Config: .env (JWT, DB_USER, DB_PASS)</text>
    <text x="460" y="417" font-size="12" fill="#777486">• Depends on: postgres (healthy)</text>
    <text x="460" y="445" font-size="11" font-weight="700" fill="#7565A8">Status: Healthy (Service Online)</text>
  </g>

  <!-- Container 3: Database -->
  <g filter="url(#cardShadow)">
    <rect x="790" y="260" width="270" height="220" rx="10" fill="#FFFFFF" stroke="#F4B99D" stroke-width="2" />
    <rect x="790" y="260" width="270" height="36" rx="10" fill="#F4B99D" />
    <rect x="790" y="285" width="270" height="11" fill="#F4B99D" />
    <text x="925" y="285" fill="#29263A" font-size="13" font-weight="700" text-anchor="middle">CONTAINER: jobnest-postgres</text>
    <text x="810" y="325" font-size="12" font-weight="600" fill="#29263A">• Image: postgres:17-alpine</text>
    <text x="810" y="348" font-size="12" fill="#777486">• Database: cd2_marketplace_db</text>
    <text x="810" y="371" font-size="12" fill="#777486">• Internal Port: 5432</text>
    <text x="810" y="394" font-size="12" fill="#777486">• Init: 01_init.sql (auto-dump)</text>
    <text x="810" y="417" font-size="12" fill="#777486">• Volume: postgres_data (persistent)</text>
    <text x="810" y="445" font-size="11" font-weight="700" fill="#E8A484">Healthcheck: pg_isready</text>
  </g>

  <!-- Connectors -->
  <line x1="390" y1="370" x2="440" y2="370" stroke="#7565A8" stroke-width="2" />
  <line x1="740" y1="370" x2="790" y2="370" stroke="#F4B99D" stroke-width="2" />
`;

const depMx = `<mxfile host="app.diagrams.net"><diagram name="Deployment Architecture"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="600"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="net" value="Docker Bridge Network: jobnest" style="swimlane;whiteSpace=wrap;html=1;fillColor=#F8F7FB;strokeColor=#D5CFE2;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="70" y="210" width="1020" height="300" as="geometry"/></mxCell><mxCell id="c_fe" value="jobnest-frontend" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="net"><mxGeometry x="30" y="50" width="290" height="220" as="geometry"/></mxCell><mxCell id="c_be" value="jobnest-backend" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="net"><mxGeometry x="370" y="50" width="300" height="220" as="geometry"/></mxCell><mxCell id="c_db" value="jobnest-postgres" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#F4B99D;fontStyle=1;" vertex="1" parent="net"><mxGeometry x="720" y="50" width="270" height="220" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>`;

fs.writeFileSync(path.join(outDir, 'deployment-architecture.drawio.svg'), buildDrawioSvg(1160, 560, 'Kiến Trúc Triển Khai Docker (Deployment Architecture)', depSvg, depMx));

// ==========================================
// 4. DATABASE ERD DIAGRAM
// ==========================================
const erdSvg = `
  <!-- Entity Grid (13 Core Tables from Data_v2.xlsx) -->
  <g filter="url(#cardShadow)">
    <rect x="50" y="100" width="230" height="160" rx="8" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <rect x="50" y="100" width="230" height="28" rx="8" fill="#7565A8" />
    <rect x="50" y="118" width="230" height="10" fill="#7565A8" />
    <text x="165" y="120" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle">USERS (Người dùng)</text>
    <text x="60" y="145" font-size="11" fill="#7565A8" font-weight="700">PK  id : UUID / INT</text>
    <text x="60" y="163" font-size="11" fill="#29263A">    email : VARCHAR(255) UNIQUE</text>
    <text x="60" y="181" font-size="11" fill="#29263A">    password_hash : VARCHAR(255)</text>
    <text x="60" y="199" font-size="11" fill="#29263A">    full_name : VARCHAR(100)</text>
    <text x="60" y="217" font-size="11" fill="#29263A">    phone : VARCHAR(20)</text>
    <text x="60" y="235" font-size="11" fill="#29263A">    role : ENUM(student,emp,admin)</text>
    <text x="60" y="253" font-size="11" fill="#777486">    status : VARCHAR(20)</text>
  </g>

  <g filter="url(#cardShadow)">
    <rect x="50" y="290" width="230" height="150" rx="8" fill="#FFFFFF" stroke="#7565A8" stroke-width="1.5" />
    <rect x="50" y="290" width="230" height="28" rx="8" fill="#EEEAF7" />
    <text x="165" y="310" fill="#7565A8" font-size="13" font-weight="700" text-anchor="middle">STUDENT_PROFILES</text>
    <text x="60" y="335" font-size="11" fill="#7565A8" font-weight="700">PK  id : INT</text>
    <text x="60" y="353" font-size="11" fill="#E8A484" font-weight="700">FK  user_id -> users(id)</text>
    <text x="60" y="371" font-size="11" fill="#29263A">    university : VARCHAR(150)</text>
    <text x="60" y="389" font-size="11" fill="#29263A">    major : VARCHAR(100)</text>
    <text x="60" y="407" font-size="11" fill="#29263A">    skills : TEXT[]</text>
    <text x="60" y="425" font-size="11" fill="#29263A">    resume_url : VARCHAR(255)</text>
  </g>

  <g filter="url(#cardShadow)">
    <rect x="50" y="470" width="230" height="150" rx="8" fill="#FFFFFF" stroke="#F4B99D" stroke-width="1.5" />
    <rect x="50" y="470" width="230" height="28" rx="8" fill="#FDF1EA" />
    <text x="165" y="490" fill="#E8A484" font-size="13" font-weight="700" text-anchor="middle">COMPANY_PROFILES</text>
    <text x="60" y="515" font-size="11" fill="#7565A8" font-weight="700">PK  id : INT</text>
    <text x="60" y="533" font-size="11" fill="#E8A484" font-weight="700">FK  user_id -> users(id)</text>
    <text x="60" y="551" font-size="11" fill="#29263A">    company_name : VARCHAR(150)</text>
    <text x="60" y="569" font-size="11" fill="#29263A">    tax_code : VARCHAR(50)</text>
    <text x="60" y="587" font-size="11" fill="#29263A">    industry : VARCHAR(100)</text>
    <text x="60" y="605" font-size="11" fill="#777486">    verification_status : VARCHAR</text>
  </g>

  <!-- Middle Entities: Jobs & Applications -->
  <g filter="url(#cardShadow)">
    <rect x="340" y="100" width="250" height="200" rx="8" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <rect x="340" y="100" width="250" height="28" rx="8" fill="#7565A8" />
    <rect x="340" y="118" width="250" height="10" fill="#7565A8" />
    <text x="465" y="120" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle">JOBS (Tin tuyển dụng)</text>
    <text x="350" y="145" font-size="11" fill="#7565A8" font-weight="700">PK  id : INT</text>
    <text x="350" y="163" font-size="11" fill="#E8A484" font-weight="700">FK  employer_id -> users(id)</text>
    <text x="350" y="181" font-size="11" fill="#E8A484" font-weight="700">FK  category_id -> categories(id)</text>
    <text x="350" y="199" font-size="11" fill="#29263A">    title : VARCHAR(200)</text>
    <text x="350" y="217" font-size="11" fill="#29263A">    description : TEXT</text>
    <text x="350" y="235" font-size="11" fill="#29263A">    salary_amount : NUMERIC</text>
    <text x="350" y="253" font-size="11" fill="#29263A">    location : VARCHAR(255)</text>
    <text x="350" y="271" font-size="11" fill="#777486">    status : ENUM(open,closed,pending)</text>
    <text x="350" y="289" font-size="11" fill="#777486">    created_at : TIMESTAMP</text>
  </g>

  <g filter="url(#cardShadow)">
    <rect x="340" y="330" width="250" height="160" rx="8" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <rect x="340" y="330" width="250" height="28" rx="8" fill="#7565A8" />
    <rect x="340" y="348" width="250" height="10" fill="#7565A8" />
    <text x="465" y="350" fill="#FFFFFF" font-size="13" font-weight="700" text-anchor="middle">APPLICATIONS (Hồ sơ ứng tuyển)</text>
    <text x="350" y="375" font-size="11" fill="#7565A8" font-weight="700">PK  id : INT</text>
    <text x="350" y="393" font-size="11" fill="#E8A484" font-weight="700">FK  job_id -> jobs(id)</text>
    <text x="350" y="411" font-size="11" fill="#E8A484" font-weight="700">FK  student_id -> users(id)</text>
    <text x="350" y="429" font-size="11" fill="#29263A">    cover_letter : TEXT</text>
    <text x="350" y="447" font-size="11" fill="#29263A">    resume_url : VARCHAR(255)</text>
    <text x="350" y="465" font-size="11" fill="#777486">    status : ENUM(pending,accepted,rejected)</text>
    <text x="350" y="483" font-size="11" fill="#777486">    applied_at : TIMESTAMP</text>
  </g>

  <!-- Work Assignments & Execution -->
  <g filter="url(#cardShadow)">
    <rect x="650" y="100" width="250" height="160" rx="8" fill="#FFFFFF" stroke="#7565A8" stroke-width="1.5" />
    <rect x="650" y="100" width="250" height="28" rx="8" fill="#EEEAF7" />
    <text x="775" y="120" fill="#7565A8" font-size="13" font-weight="700" text-anchor="middle">WORK_ASSIGNMENTS (Giao việc)</text>
    <text x="660" y="145" font-size="11" fill="#7565A8" font-weight="700">PK  id : INT</text>
    <text x="660" y="163" font-size="11" fill="#E8A484" font-weight="700">FK  job_id -> jobs(id)</text>
    <text x="660" y="181" font-size="11" fill="#E8A484" font-weight="700">FK  student_id -> users(id)</text>
    <text x="660" y="199" font-size="11" fill="#E8A484" font-weight="700">FK  employer_id -> users(id)</text>
    <text x="660" y="217" font-size="11" fill="#29263A">    status : VARCHAR(30)</text>
    <text x="660" y="235" font-size="11" fill="#777486">    started_at / completed_at</text>
  </g>

  <g filter="url(#cardShadow)">
    <rect x="650" y="290" width="250" height="140" rx="8" fill="#FFFFFF" stroke="#F4B99D" stroke-width="1.5" />
    <rect x="650" y="290" width="250" height="28" rx="8" fill="#FDF1EA" />
    <text x="775" y="310" fill="#E8A484" font-size="13" font-weight="700" text-anchor="middle">REVIEWS &amp; RATINGS</text>
    <text x="660" y="335" font-size="11" fill="#7565A8" font-weight="700">PK  id : INT</text>
    <text x="660" y="353" font-size="11" fill="#E8A484" font-weight="700">FK  reviewer_id -> users(id)</text>
    <text x="660" y="371" font-size="11" fill="#E8A484" font-weight="700">FK  reviewee_id -> users(id)</text>
    <text x="660" y="389" font-size="11" fill="#29263A">    rating : SMALLINT (1-5)</text>
    <text x="660" y="407" font-size="11" fill="#29263A">    comment : TEXT</text>
  </g>

  <!-- Support & Admin Tables -->
  <g filter="url(#cardShadow)">
    <rect x="950" y="100" width="230" height="120" rx="8" fill="#FFFFFF" stroke="#D5CFE2" />
    <text x="1065" y="125" fill="#29263A" font-size="12" font-weight="700" text-anchor="middle">CATEGORIES (Ngành nghề)</text>
    <text x="960" y="150" font-size="11" fill="#7565A8">PK id, name, slug</text>
    <text x="960" y="170" font-size="11" fill="#777486">icon, is_active</text>
  </g>

  <g filter="url(#cardShadow)">
    <rect x="950" y="240" width="230" height="120" rx="8" fill="#FFFFFF" stroke="#D5CFE2" />
    <text x="1065" y="265" fill="#29263A" font-size="12" font-weight="700" text-anchor="middle">NOTIFICATIONS (Thông báo)</text>
    <text x="960" y="290" font-size="11" fill="#7565A8">PK id, FK user_id</text>
    <text x="960" y="310" font-size="11" fill="#777486">title, message, is_read</text>
  </g>

  <g filter="url(#cardShadow)">
    <rect x="950" y="380" width="230" height="120" rx="8" fill="#FFFFFF" stroke="#D5CFE2" />
    <text x="1065" y="405" fill="#29263A" font-size="12" font-weight="700" text-anchor="middle">AUDIT_LOGS &amp; MODERATION</text>
    <text x="960" y="430" font-size="11" fill="#7565A8">PK id, FK user_id, action</text>
    <text x="960" y="450" font-size="11" fill="#777486">entity, ip_address, created_at</text>
  </g>

  <!-- Relationship Connectors -->
  <line x1="280" y1="180" x2="340" y2="180" stroke="#7565A8" stroke-width="2" />
  <line x1="280" y1="210" x2="340" y2="390" stroke="#7565A8" stroke-width="2" />
  <line x1="465" y1="300" x2="465" y2="330" stroke="#7565A8" stroke-width="2" />
  <line x1="590" y1="200" x2="650" y2="200" stroke="#7565A8" stroke-width="2" />
`;

const erdMx = `<mxfile host="app.diagrams.net"><diagram name="Database ERD"><mxGraphModel dx="1400" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1250" pageHeight="650"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="t_users" value="USERS" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="50" y="100" width="230" height="160" as="geometry"/></mxCell><mxCell id="t_jobs" value="JOBS" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="340" y="100" width="250" height="200" as="geometry"/></mxCell><mxCell id="t_app" value="APPLICATIONS" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="340" y="330" width="250" height="160" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>`;

fs.writeFileSync(path.join(outDir, 'database-erd.drawio.svg'), buildDrawioSvg(1220, 650, 'Sơ Đồ Thực Thể Quan Hệ Dữ Liệu (Database ERD)', erdSvg, erdMx));

// ==========================================
// 5. AUTHENTICATION FLOW DIAGRAM
// ==========================================
const authSvg = `
  <!-- Swimlanes Columns -->
  <rect x="50" y="100" width="240" height="500" rx="8" fill="#FFFFFF" stroke="#7565A8" stroke-width="1.5" />
  <rect x="50" y="100" width="240" height="35" rx="8" fill="#7565A8" />
  <text x="170" y="123" fill="#FFFFFF" font-size="14" font-weight="700" text-anchor="middle">1. CLIENT (REACT SPA)</text>

  <rect x="330" y="100" width="250" height="500" rx="8" fill="#FFFFFF" stroke="#7565A8" stroke-width="1.5" />
  <rect x="330" y="100" width="250" height="35" rx="8" fill="#7565A8" />
  <text x="455" y="123" fill="#FFFFFF" font-size="14" font-weight="700" text-anchor="middle">2. API &amp; MIDDLEWARE</text>

  <rect x="620" y="100" width="250" height="500" rx="8" fill="#FFFFFF" stroke="#7565A8" stroke-width="1.5" />
  <rect x="620" y="100" width="250" height="35" rx="8" fill="#7565A8" />
  <text x="745" y="123" fill="#FFFFFF" font-size="14" font-weight="700" text-anchor="middle">3. AUTH SERVICE &amp; BCRYPT</text>

  <rect x="910" y="100" width="220" height="500" rx="8" fill="#FFFFFF" stroke="#F4B99D" stroke-width="1.5" />
  <rect x="910" y="100" width="220" height="35" rx="8" fill="#F4B99D" />
  <text x="1020" y="123" fill="#29263A" font-size="14" font-weight="700" text-anchor="middle">4. DATABASE (USERS)</text>

  <!-- Flow 1: Registration Step -->
  <g>
    <rect x="70" y="160" width="200" height="45" rx="6" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="80" y="187" font-size="12" font-weight="600" fill="#29263A">User nhập form Đăng ký</text>

    <line x1="270" y1="182" x2="350" y2="182" stroke="#7565A8" stroke-width="2" />
    
    <rect x="350" y="160" width="210" height="45" rx="6" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="360" y="187" font-size="11" fill="#7565A8" font-weight="600">POST /api/v1/auth/register</text>

    <line x1="560" y1="182" x2="640" y2="182" stroke="#7565A8" stroke-width="2" />

    <rect x="640" y="160" width="210" height="45" rx="6" fill="#EEEAF7" stroke="#7565A8" />
    <text x="650" y="187" font-size="11" fill="#7565A8" font-weight="600">bcrypt.hash(password, 10)</text>

    <line x1="850" y1="182" x2="930" y2="182" stroke="#7565A8" stroke-width="2" />

    <rect x="930" y="160" width="180" height="45" rx="6" fill="#FDF1EA" stroke="#F4B99D" />
    <text x="940" y="187" font-size="11" fill="#E8A484" font-weight="600">INSERT INTO users ($1..$5)</text>
  </g>

  <!-- Flow 2: Login Step -->
  <g>
    <rect x="70" y="240" width="200" height="45" rx="6" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="80" y="267" font-size="12" font-weight="600" fill="#29263A">User nhập Email &amp; Password</text>

    <line x1="270" y1="262" x2="350" y2="262" stroke="#7565A8" stroke-width="2" />

    <rect x="350" y="240" width="210" height="45" rx="6" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="360" y="267" font-size="11" fill="#7565A8" font-weight="600">POST /api/v1/auth/login</text>

    <line x1="560" y1="262" x2="640" y2="262" stroke="#7565A8" stroke-width="2" />

    <rect x="640" y="240" width="210" height="55" rx="6" fill="#EEEAF7" stroke="#7565A8" />
    <text x="650" y="262" font-size="11" fill="#7565A8" font-weight="600">1. findByEmail()</text>
    <text x="650" y="280" font-size="11" fill="#7565A8" font-weight="600">2. bcrypt.compare(pass, hash)</text>

    <line x1="850" y1="262" x2="930" y2="262" stroke="#7565A8" stroke-width="2" />

    <rect x="930" y="240" width="180" height="45" rx="6" fill="#FDF1EA" stroke="#F4B99D" />
    <text x="940" y="267" font-size="11" fill="#E8A484" font-weight="600">SELECT * WHERE email=$1</text>
  </g>

  <!-- Flow 3: JWT Token Generation & Return -->
  <g>
    <rect x="640" y="325" width="210" height="50" rx="6" fill="#FDF1EA" stroke="#F4B99D" />
    <text x="650" y="347" font-size="11" fill="#E8A484" font-weight="700">jwt.sign({ id, role },</text>
    <text x="650" y="363" font-size="11" fill="#E8A484">JWT_SECRET, { expiresIn: '7d' })</text>

    <line x1="640" y1="350" x2="270" y2="350" stroke="#F4B99D" stroke-width="2" stroke-dasharray="4" />

    <rect x="70" y="325" width="200" height="50" rx="6" fill="#EEEAF7" stroke="#7565A8" />
    <text x="80" y="347" font-size="11" fill="#7565A8" font-weight="700">Lưu Token vào Storage</text>
    <text x="80" y="363" font-size="10" fill="#777486">Gắn vào AuthContext State</text>
  </g>

  <!-- Flow 4: Protected API Call with RBAC -->
  <g>
    <rect x="70" y="415" width="200" height="60" rx="6" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <text x="80" y="438" font-size="11" font-weight="700" fill="#29263A">Gọi API có bảo vệ</text>
    <text x="80" y="456" font-size="10" fill="#7565A8">Header: Authorization: Bearer &lt;token&gt;</text>

    <line x1="270" y1="445" x2="350" y2="445" stroke="#7565A8" stroke-width="2" />

    <rect x="350" y="405" width="210" height="80" rx="6" fill="#FFFFFF" stroke="#7565A8" stroke-width="2" />
    <text x="360" y="427" font-size="11" font-weight="700" fill="#7565A8">verifyToken(req, res, next)</text>
    <text x="360" y="445" font-size="10" fill="#777486">Giải mã chữ ký token</text>
    <text x="360" y="463" font-size="11" font-weight="700" fill="#E8A484">requireRole('EMPLOYER')</text>
    <text x="360" y="478" font-size="10" fill="#777486">Kiểm tra quyền hạn</text>

    <line x1="560" y1="445" x2="640" y2="445" stroke="#7565A8" stroke-width="2" />

    <rect x="640" y="420" width="210" height="50" rx="6" fill="#F8F7FB" stroke="#EAE7F0" />
    <text x="650" y="442" font-size="11" font-weight="700" fill="#29263A">Xử lý nghiệp vụ chính</text>
    <text x="650" y="458" font-size="10" fill="#777486">Trả về dữ liệu JSON cho Client</text>
  </g>
`;

const authMx = `<mxfile host="app.diagrams.net"><diagram name="Authentication Flow"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="650"><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="c1" value="Client (React SPA)" style="swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="50" y="100" width="240" height="500" as="geometry"/></mxCell><mxCell id="c2" value="API &amp; Middleware" style="swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="330" y="100" width="250" height="500" as="geometry"/></mxCell><mxCell id="c3" value="Auth Service &amp; Bcrypt" style="swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#7565A8;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="620" y="100" width="250" height="500" as="geometry"/></mxCell><mxCell id="c4" value="Database" style="swimlane;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#F4B99D;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="910" y="100" width="220" height="500" as="geometry"/></mxCell></root></mxGraphModel></diagram></mxfile>`;

fs.writeFileSync(path.join(outDir, 'authentication-flow.drawio.svg'), buildDrawioSvg(1180, 640, 'Luồng Xác Thực & Phân Quyền (Authentication Flow)', authSvg, authMx));

console.log('[SUCCESS] All 5 standardized .drawio.svg diagrams created in docs/architecture/');

