// Danh mục dùng cho hồ sơ xin việc sinh viên.

// 34 đơn vị hành chính cấp tỉnh sau sắp xếp (hiệu lực từ 01/07/2025)
export const PROVINCES = [
  'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Huế',
  'An Giang', 'Bắc Ninh', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
  'Gia Lai', 'Hà Tĩnh', 'Hưng Yên', 'Khánh Hòa', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn', 'Lào Cai',
  'Nghệ An', 'Ninh Bình', 'Phú Thọ', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sơn La',
  'Tây Ninh', 'Thái Nguyên', 'Thanh Hóa', 'Tuyên Quang', 'Vĩnh Long',
];

export const GENDERS = ['Nam', 'Nữ', 'Khác'];

export const YEARS_OF_STUDY = ['Năm 1', 'Năm 2', 'Năm 3', 'Năm 4', 'Năm 5', 'Đã tốt nghiệp'];

export const WORK_TYPES = [
  { value: 'PART_TIME', label: 'Bán thời gian (Part-time)' },
  { value: 'FULL_TIME', label: 'Toàn thời gian (Full-time)' },
];

// Cùng danh mục với trang Đăng ký
export const JOB_CATEGORIES = [
  'Công nghệ thông tin / Phần mềm',
  'Thiết kế đồ họa / Multimedia',
  'Dịch vụ & F&B (Nhà hàng, Quán cafe)',
  'Marketing, Truyền thông & Sự kiện',
  'Gia sư, Trợ giảng & Đào tạo',
  'Bán hàng, Thu ngân & CSKH',
  'Hành chính, Văn phòng & Nhập liệu',
  'Giao hàng, Vận tải & Logistics',
  'Lĩnh vực khác',
];

export const LANGUAGES = ['Tiếng Anh', 'Tiếng Trung', 'Tiếng Nhật', 'Tiếng Hàn', 'Tiếng Pháp', 'Tiếng Đức'];
export const LANGUAGE_LEVELS = ['Cơ bản', 'Giao tiếp', 'Thành thạo', 'Bản ngữ'];

// Nhóm ngành → từ khóa nhận diện chuyên ngành + kỹ năng gợi ý
const SKILL_GROUPS = [
  {
    keys: ['công nghệ thông tin', 'cntt', 'phần mềm', 'hệ thống thông tin', 'khoa học máy tính', 'an toàn thông tin', 'mạng máy tính', 'trí tuệ nhân tạo', 'dữ liệu'],
    skills: ['HTML/CSS', 'JavaScript', 'TypeScript', 'ReactJS', 'Vue.js', 'Node.js', 'Java', 'Python', 'C#', 'PHP', 'SQL', 'PostgreSQL', 'MongoDB', 'Git', 'Docker', 'REST API', 'Kiểm thử phần mềm', 'Phân tích dữ liệu', 'Excel nâng cao', 'Hỗ trợ kỹ thuật IT'],
  },
  {
    keys: ['thiết kế', 'đồ họa', 'mỹ thuật', 'đa phương tiện', 'multimedia', 'kiến trúc', 'nội thất', 'thời trang'],
    skills: ['Adobe Photoshop', 'Adobe Illustrator', 'Figma', 'Canva', 'Adobe Premiere Pro', 'After Effects', 'CapCut', 'Thiết kế UI/UX', 'Thiết kế ấn phẩm', 'Vẽ minh họa', 'Chụp ảnh', 'Quay dựng video', 'AutoCAD', 'SketchUp'],
  },
  {
    keys: ['marketing', 'truyền thông', 'quan hệ công chúng', 'pr', 'báo chí', 'quảng cáo', 'thương mại điện tử'],
    skills: ['Content Marketing', 'Viết bài chuẩn SEO', 'Facebook Ads', 'Google Ads', 'TikTok Marketing', 'Quản lý fanpage', 'Google Analytics', 'Canva', 'Tổ chức sự kiện', 'Chụp ảnh sản phẩm', 'Livestream bán hàng'],
  },
  {
    keys: ['quản trị kinh doanh', 'kinh doanh', 'thương mại', 'logistics', 'chuỗi cung ứng', 'bất động sản'],
    skills: ['Bán hàng', 'Chăm sóc khách hàng', 'Đàm phán', 'Telesales', 'Quản lý kho', 'Nhập liệu', 'Excel nâng cao', 'Lập kế hoạch', 'Nghiên cứu thị trường', 'Thu ngân'],
  },
  {
    keys: ['kế toán', 'kiểm toán', 'tài chính', 'ngân hàng', 'thuế'],
    skills: ['Excel nâng cao', 'Phần mềm MISA', 'Kế toán thuế', 'Lập báo cáo tài chính', 'Phân tích tài chính', 'Power BI', 'Nhập liệu chứng từ', 'Kiểm kê'],
  },
  {
    keys: ['ngôn ngữ', 'tiếng anh', 'tiếng trung', 'tiếng nhật', 'tiếng hàn', 'biên phiên dịch', 'đông phương', 'quốc tế học'],
    skills: ['Tiếng Anh giao tiếp', 'Biên dịch', 'Phiên dịch', 'Gia sư ngoại ngữ', 'Soạn thảo văn bản', 'Thuyết trình', 'IELTS', 'TOEIC', 'HSK', 'JLPT'],
  },
  {
    keys: ['du lịch', 'khách sạn', 'nhà hàng', 'lữ hành', 'hàng không'],
    skills: ['Phục vụ bàn', 'Pha chế', 'Lễ tân', 'Hướng dẫn viên', 'Đặt phòng', 'Chăm sóc khách hàng', 'Tiếng Anh giao tiếp', 'Vệ sinh an toàn thực phẩm'],
  },
  {
    keys: ['sư phạm', 'giáo dục', 'tâm lý'],
    skills: ['Gia sư', 'Trợ giảng', 'Soạn giáo án', 'Kỹ năng sư phạm', 'Tư vấn tâm lý', 'Quản lý lớp học', 'Thuyết trình'],
  },
  {
    keys: ['luật'],
    skills: ['Soạn thảo hợp đồng', 'Nghiên cứu pháp lý', 'Tư vấn pháp luật', 'Soạn thảo văn bản'],
  },
  {
    keys: ['dược', 'y khoa', 'y học', 'y đa khoa', 'điều dưỡng', 'răng hàm mặt', 'xét nghiệm'],
    skills: ['Tư vấn bán thuốc', 'Chăm sóc bệnh nhân', 'Sơ cấp cứu', 'Quản lý kho dược', 'Tiếp đón bệnh nhân'],
  },
];

// Kỹ năng chung, phù hợp mọi ngành
export const GENERAL_SKILLS = [
  'Giao tiếp', 'Làm việc nhóm', 'Quản lý thời gian', 'Giải quyết vấn đề', 'Thuyết trình',
  'Tin học văn phòng', 'Microsoft Word', 'Microsoft Excel', 'PowerPoint', 'Chịu được áp lực', 'Tự học',
];

// Một số chuyên ngành phổ biến để gợi ý khi nhập
export const MAJORS = [
  'Công nghệ Thông tin', 'Kỹ thuật Phần mềm', 'Hệ thống Thông tin', 'Khoa học Dữ liệu', 'Mạng máy tính và Truyền thông',
  'Thiết kế Đồ họa', 'Thiết kế Thời trang', 'Thiết kế Nội thất', 'Kiến trúc', 'Công nghệ Truyền thông Đa phương tiện',
  'Marketing', 'Quan hệ Công chúng', 'Truyền thông Đa phương tiện', 'Thương mại Điện tử',
  'Quản trị Kinh doanh', 'Kinh doanh Thương mại', 'Logistics và Quản lý Chuỗi cung ứng',
  'Kế toán', 'Tài chính – Ngân hàng', 'Kiểm toán',
  'Ngôn ngữ Anh', 'Ngôn ngữ Trung Quốc', 'Ngôn ngữ Nhật', 'Đông phương học',
  'Quản trị Khách sạn', 'Quản trị Dịch vụ Du lịch và Lữ hành', 'Quản trị Nhà hàng và Dịch vụ Ăn uống',
  'Luật', 'Luật Kinh tế', 'Tâm lý học', 'Dược học', 'Điều dưỡng',
];

/** Kỹ năng gợi ý theo chuyên ngành (kỹ năng ngành trước, kỹ năng chung sau). */
export function suggestedSkillsForMajor(major) {
  const m = String(major || '').toLowerCase();
  const byMajor = SKILL_GROUPS.filter(g => g.keys.some(k => m.includes(k))).flatMap(g => g.skills);
  return [...new Set([...byMajor, ...GENERAL_SKILLS])];
}

/** Mọi kỹ năng đã biết, dùng khi tìm kiếm ngoài nhóm ngành. */
export const ALL_SKILLS = [...new Set([...SKILL_GROUPS.flatMap(g => g.skills), ...GENERAL_SKILLS])];
