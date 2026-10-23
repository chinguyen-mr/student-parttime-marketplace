import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, User, Shield, CheckCircle, Clock, 
  MapPin, DollarSign, Send, Star, Filter, LogIn, LogOut, PlusCircle, Building2, AlertCircle 
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'employer', 'student', 'admin'
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Authentication state
  const [currentUser, setCurrentUser] = useState({
    id: 4,
    email: 'nguyen.van.chi@vlu.edu.vn',
    full_name: 'Nguyễn Văn Chí',
    role: 'STUDENT',
    token: null,
  });

  // Filters for job search
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Selected job for applying / viewing
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  // Employer state
  const [employerJobs, setEmployerJobs] = useState([]);
  const [selectedJobApplicants, setSelectedJobApplicants] = useState([]);
  const [selectedJobIdForApplicants, setSelectedJobIdForApplicants] = useState(null);
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    category: 'Công nghệ thông tin',
    location: 'Quận 1, TP.HCM',
    salary: 50000,
    salary_type: 'HOURLY',
    work_type: 'PART_TIME',
    description: '',
    requirements: '',
  });

  // Student state
  const [myApplications, setMyApplications] = useState([]);

  // Admin state
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper login function for quick role switching
  const handleQuickLogin = async (email, roleName) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser({ ...data.data.user, token: data.data.token });
        showToast(`Đã chuyển sang vai trò: ${roleName} (${data.data.user.full_name})`);
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Không thể kết nối đến máy chủ Backend (Port 5000)', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Public Jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchKeyword) params.append('keyword', searchKeyword);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLocation) params.append('location', selectedLocation);

      const res = await fetch(`${API_BASE}/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Employer Jobs
  const fetchEmployerJobs = async () => {
    if (!currentUser.token || currentUser.role !== 'EMPLOYER') return;
    try {
      const res = await fetch(`${API_BASE}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success) setEmployerJobs(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Student Applications
  const fetchMyApplications = async () => {
    if (!currentUser.token || currentUser.role !== 'STUDENT') return;
    try {
      const res = await fetch(`${API_BASE}/applications/my-applications`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success) setMyApplications(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch Admin Data
  const fetchAdminData = async () => {
    if (!currentUser.token || currentUser.role !== 'ADMIN') return;
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/admin/stats`, { headers: { Authorization: `Bearer ${currentUser.token}` } }),
        fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${currentUser.token}` } })
      ]);
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      if (statsData.success) setAdminStats(statsData.data);
      if (usersData.success) setAdminUsers(usersData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Initial login as student for easy testing
    handleQuickLogin('nguyen.van.chi@vlu.edu.vn', 'Sinh viên');
    fetchJobs();
  }, []);

  useEffect(() => {
    if (activeTab === 'jobs') fetchJobs();
    if (activeTab === 'employer') fetchEmployerJobs();
    if (activeTab === 'student') fetchMyApplications();
    if (activeTab === 'admin') fetchAdminData();
  }, [activeTab, currentUser]);

  // Submit Application
  const handleApply = async () => {
    if (!currentUser.token) {
      showToast('Vui lòng đăng nhập với tài khoản Sinh viên để nộp đơn', 'error');
      return;
    }
    if (currentUser.role !== 'STUDENT') {
      showToast('Chỉ tài khoản Sinh viên mới có thể nộp đơn ứng tuyển', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          job_id: selectedJob.id,
          cover_letter: coverLetter,
          cv_url: 'https://cv.vanlanguni.vn/sample-student.pdf',
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Nộp hồ sơ ứng tuyển thành công!');
        setApplyModalOpen(false);
        setCoverLetter('');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Lỗi khi nộp đơn: ' + err.message, 'error');
    }
  };

  // Submit Post Job (Employer)
  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify(newJobForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Đăng tin tuyển dụng thành công!');
        fetchEmployerJobs();
        setNewJobForm({
          title: '',
          category: 'Công nghệ thông tin',
          location: 'Quận 1, TP.HCM',
          salary: 50000,
          salary_type: 'HOURLY',
          work_type: 'PART_TIME',
          description: '',
          requirements: '',
        });
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Lỗi đăng tin: ' + err.message, 'error');
    }
  };

  // Employer view applicants for specific job
  const handleViewApplicants = async (jobId) => {
    setSelectedJobIdForApplicants(jobId);
    try {
      const res = await fetch(`${API_BASE}/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedJobApplicants(data.data);
      }
    } catch (err) {
      showToast('Lỗi tải danh sách ứng viên', 'error');
    }
  };

  // Employer accept / reject applicant
  const handleUpdateApplicationStatus = async (appId, status) => {
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã cập nhật trạng thái ứng viên: ${status}`);
        handleViewApplicants(selectedJobIdForApplicants);
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Lỗi cập nhật ứng viên', 'error');
    }
  };

  // Employer update job status
  const handleUpdateJobStatus = async (jobId, status) => {
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Đã chuyển trạng thái tin sang: ${status}`);
        fetchEmployerJobs();
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Lỗi cập nhật trạng thái công việc', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 8,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {toast.message}
        </div>
      )}

      {/* Role Switcher Toolbar */}
      <div style={{ background: '#0f172a', color: '#e2e8f0', padding: '8px 24px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#94a3b8' }}>Chế độ kiểm thử nhanh vai trò:</span>
          <button 
            onClick={() => { handleQuickLogin('nguyen.van.chi@vlu.edu.vn', 'Sinh viên'); setActiveTab('jobs'); }}
            style={{ padding: '4px 10px', borderRadius: 4, background: currentUser?.role === 'STUDENT' ? '#4f46e5' : '#334155', color: '#fff', fontSize: 12, fontWeight: 600 }}>
            🎓 Sinh viên (Nguyễn Văn Chí)
          </button>
          <button 
            onClick={() => { handleQuickLogin('techcorp@gmail.com', 'Nhà tuyển dụng'); setActiveTab('employer'); }}
            style={{ padding: '4px 10px', borderRadius: 4, background: currentUser?.role === 'EMPLOYER' ? '#0ea5e9' : '#334155', color: '#fff', fontSize: 12, fontWeight: 600 }}>
            🏢 Nhà tuyển dụng (TechCorp)
          </button>
          <button 
            onClick={() => { handleQuickLogin('admin@marketplace.vlu.edu.vn', 'Quản trị viên'); setActiveTab('admin'); }}
            style={{ padding: '4px 10px', borderRadius: 4, background: currentUser?.role === 'ADMIN' ? '#f59e0b' : '#334155', color: '#fff', fontSize: 12, fontWeight: 600 }}>
            🛡️ Quản trị viên (Admin)
          </button>
        </div>
        <div>
          <span>Đang đăng nhập: <strong>{currentUser?.full_name}</strong> ({currentUser?.role})</span>
        </div>
      </div>

      {/* Navbar */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>VLU Part-time & Freelance</h1>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Chuyên đề Tốt nghiệp 2 — ĐH Văn Lang</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => setActiveTab('jobs')}
            className={`btn ${activeTab === 'jobs' ? 'btn-primary' : 'btn-secondary'}`}>
            <Search size={16} /> Khám phá Việc làm
          </button>
          <button 
            onClick={() => setActiveTab('employer')}
            className={`btn ${activeTab === 'employer' ? 'btn-primary' : 'btn-secondary'}`}>
            <Building2 size={16} /> Kênh Nhà tuyển dụng
          </button>
          <button 
            onClick={() => setActiveTab('student')}
            className={`btn ${activeTab === 'student' ? 'btn-primary' : 'btn-secondary'}`}>
            <User size={16} /> Kênh Sinh viên
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}>
            <Shield size={16} /> Bảng Quản trị
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '32px 24px' }}>
        
        {/* ==================== TAB 1: KHÁM PHÁ VIỆC LÀM (JOBS) ==================== */}
        {activeTab === 'jobs' && (
          <div>
            {/* Hero banner */}
            <div style={{ 
              background: 'linear-gradient(135deg, #312e81, #1e1b4b)', 
              borderRadius: 16, 
              padding: '40px 32px', 
              color: '#ffffff', 
              marginBottom: 32,
              boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.4)'
            }}>
              <span className="badge badge-warning" style={{ marginBottom: 12 }}>Chuyên đề Tốt nghiệp 2</span>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 8 }}>
                Nền tảng kết nối Việc làm Part-time & Freelance cho Sinh viên
              </h2>
              <p style={{ color: '#c7d2fe', maxWidth: 640, marginBottom: 24 }}>
                Tìm kiếm cơ hội việc làm bán thời gian uy tín, minh bạch, bảo vệ quyền lợi sinh viên với cơ chế đánh giá hai chiều sau công việc.
              </p>

              {/* Search Bar */}
              <div style={{ 
                background: '#ffffff', 
                borderRadius: 12, 
                padding: 12, 
                display: 'grid', 
                gridTemplateColumns: '1.5fr 1fr 1fr auto', 
                gap: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 8 }}>
                  <Search size={18} color="#64748b" />
                  <input 
                    type="text" 
                    placeholder="Tiêu đề công việc, kỹ năng..." 
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    style={{ border: 'none', width: '100%', padding: '6px 0' }}
                  />
                </div>
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ border: 'none', background: '#f8fafc' }}>
                  <option value="">Tất cả ngành nghề</option>
                  <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                  <option value="Thiết kế đồ họa">Thiết kế đồ họa</option>
                  <option value="Dịch vụ & F&B">Dịch vụ & F&B</option>
                  <option value="Giáo dục & Gia sư">Giáo dục & Gia sư</option>
                </select>
                <select 
                  value={selectedLocation} 
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  style={{ border: 'none', background: '#f8fafc' }}>
                  <option value="">Tất cả khu vực</option>
                  <option value="Quận 1">Quận 1, TP.HCM</option>
                  <option value="Bình Thạnh">Bình Thạnh, TP.HCM</option>
                  <option value="Remote">Từ xa (Remote)</option>
                </select>
                <button onClick={fetchJobs} className="btn btn-primary" style={{ padding: '10px 24px' }}>
                  Tìm kiếm
                </button>
              </div>
            </div>

            {/* Job Listings Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Danh sách Việc làm Part-time đang tuyển ({jobs.length})</h3>
              <span style={{ fontSize: 13, color: '#64748b' }}>Dữ liệu thời gian thực từ PostgreSQL</span>
            </div>

            {/* Job Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
              {jobs.map((job) => (
                <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span className="badge badge-primary">{job.category}</span>
                      <span className="badge badge-success">{job.work_type === 'PART_TIME' ? 'Bán thời gian' : 'Freelance'}</span>
                    </div>

                    <h4 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{job.title}</h4>
                    <p style={{ fontSize: 13, color: '#4f46e5', fontWeight: 600, marginBottom: 12 }}>
                      🏢 {job.company_name || job.employer_name}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <DollarSign size={15} color="#10b981" />
                        <strong style={{ color: '#0f172a' }}>{Number(job.salary).toLocaleString('vi-VN')} VNĐ</strong>
                        <span>/{job.salary_type === 'HOURLY' ? 'giờ' : 'dự án'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={15} color="#64748b" />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, marginBottom: 16 }}>
                      {job.description}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>
                      Đăng ngày: {new Date(job.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    <button 
                      onClick={() => { setSelectedJob(job); setApplyModalOpen(true); }}
                      className="btn btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
                      <Send size={14} /> Ứng tuyển ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: NHÀ TUYỂN DỤNG (EMPLOYER) ==================== */}
        {activeTab === 'employer' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>Kênh Quản trị Tuyển dụng (Employer Portal)</h2>
                <p style={{ color: '#64748b', fontSize: 14 }}>Đăng việc làm mới, theo dõi ứng viên và chuyển trạng thái hoàn thành</p>
              </div>
              <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: 13 }}>
                Đang quản lý: {currentUser?.full_name}
              </span>
            </div>

            {/* Grid 2 Columns: Post Job Form & Job List */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24, alignItems: 'start' }}>
              {/* Form Đăng tin */}
              <div className="card">
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PlusCircle size={18} color="#4f46e5" /> Đăng tin tuyển dụng mới (UC-04)
                </h3>
                <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Tiêu đề công việc *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="VD: Phục vụ quán cafe ca sáng / Lập trình viên React" 
                      value={newJobForm.title}
                      onChange={(e) => setNewJobForm({ ...newJobForm, title: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Ngành nghề</label>
                      <select 
                        value={newJobForm.category} 
                        onChange={(e) => setNewJobForm({ ...newJobForm, category: e.target.value })}
                        style={{ width: '100%' }}>
                        <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                        <option value="Thiết kế đồ họa">Thiết kế đồ họa</option>
                        <option value="Dịch vụ & F&B">Dịch vụ & F&B</option>
                        <option value="Giáo dục & Gia sư">Giáo dục & Gia sư</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Hình thức</label>
                      <select 
                        value={newJobForm.work_type} 
                        onChange={(e) => setNewJobForm({ ...newJobForm, work_type: e.target.value })}
                        style={{ width: '100%' }}>
                        <option value="PART_TIME">Part-time (Bán thời gian)</option>
                        <option value="FREELANCE">Freelance (Theo dự án)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Mức lương (VNĐ) *</label>
                      <input 
                        type="number" 
                        required 
                        value={newJobForm.salary}
                        onChange={(e) => setNewJobForm({ ...newJobForm, salary: e.target.value })}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Hình thức tính lương</label>
                      <select 
                        value={newJobForm.salary_type} 
                        onChange={(e) => setNewJobForm({ ...newJobForm, salary_type: e.target.value })}
                        style={{ width: '100%' }}>
                        <option value="HOURLY">Theo giờ (Hourly)</option>
                        <option value="FIXED">Trọn gói (Fixed)</option>
                        <option value="MONTHLY">Theo tháng (Monthly)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Địa điểm làm việc *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="VD: 123 Đặng Thùy Trâm, Bình Thạnh hoặc Remote" 
                      value={newJobForm.location}
                      onChange={(e) => setNewJobForm({ ...newJobForm, location: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Mô tả công việc chi tiết *</label>
                    <textarea 
                      rows={3} 
                      required 
                      placeholder="Mô tả các đầu việc chính sinh viên cần đảm nhiệm..."
                      value={newJobForm.description}
                      onChange={(e) => setNewJobForm({ ...newJobForm, description: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
                    Xác nhận đăng tin
                  </button>
                </form>
              </div>

              {/* Danh sách tin đã đăng của Employer */}
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
                  Tin tuyển dụng của bạn ({employerJobs.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {employerJobs.map((job) => (
                    <div key={job.id} className="card" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <h4 style={{ fontSize: 16, fontWeight: 700 }}>{job.title}</h4>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span className={`badge ${job.status === 'OPEN' ? 'badge-success' : job.status === 'FILLED' ? 'badge-primary' : 'badge-warning'}`}>
                            {job.status === 'OPEN' ? 'Đang tuyển' : job.status === 'FILLED' ? 'Đã nhận người' : job.status}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                        <span>Lương: <strong>{Number(job.salary).toLocaleString('vi-VN')} đ</strong></span>
                        <span>Số ứng viên: <strong>{job.total_applicants || 0} người</strong></span>
                        <span>Khu vực: {job.location}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                        <button 
                          onClick={() => handleViewApplicants(job.id)}
                          className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>
                          👥 Xem hồ sơ ứng viên ({job.total_applicants || 0})
                        </button>

                        {/* Status switcher (UC-08) */}
                        <div style={{ display: 'flex', gap: 6 }}>
                          {job.status === 'OPEN' && (
                            <button 
                              onClick={() => handleUpdateJobStatus(job.id, 'FILLED')}
                              className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
                              Khóa nhận người
                            </button>
                          )}
                          {job.status === 'FILLED' && (
                            <button 
                              onClick={() => handleUpdateJobStatus(job.id, 'COMPLETED')}
                              className="btn btn-success" style={{ padding: '4px 10px', fontSize: 12 }}>
                              Hoàn thành việc
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Applicants Sub-panel */}
                      {selectedJobIdForApplicants === job.id && (
                        <div style={{ marginTop: 14, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <h5 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Danh sách ứng viên nộp đơn:</h5>
                          {selectedJobApplicants.length === 0 ? (
                            <p style={{ fontSize: 13, color: '#94a3b8' }}>Chưa có ứng viên nào nộp hồ sơ vào tin này.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {selectedJobApplicants.map((app) => (
                                <div key={app.id} style={{ background: '#ffffff', padding: 10, borderRadius: 6, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{app.student_name} ({app.student_email})</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{app.university} - {app.major}</div>
                                    <p style={{ fontSize: 12, color: '#334155', marginTop: 4 }}><em>"{app.cover_letter}"</em></p>
                                  </div>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    {app.status === 'PENDING' ? (
                                      <>
                                        <button 
                                          onClick={() => handleUpdateApplicationStatus(app.id, 'ACCEPTED')}
                                          className="btn btn-success" style={{ padding: '4px 10px', fontSize: 12 }}>
                                          Duyệt
                                        </button>
                                        <button 
                                          onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                                          className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }}>
                                          Từ chối
                                        </button>
                                      </>
                                    ) : (
                                      <span className={`badge ${app.status === 'ACCEPTED' ? 'badge-success' : 'badge-danger'}`}>
                                        {app.status === 'ACCEPTED' ? 'Đã duyệt' : 'Đã từ chối'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: SINH VIÊN (STUDENT) ==================== */}
        {activeTab === 'student' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>Kênh Sinh viên (Student Portal)</h2>
                <p style={{ color: '#64748b', fontSize: 14 }}>Theo dõi tiến độ hồ sơ ứng tuyển và kết quả phê duyệt</p>
              </div>
              <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: 13 }}>
                Sinh viên: {currentUser?.full_name}
              </span>
            </div>

            <div className="card">
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
                Lịch sử nộp đơn ứng tuyển của bạn ({myApplications.length})
              </h3>

              {myApplications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                  <Briefcase size={36} style={{ margin: '0 auto 12px' }} />
                  <p>Bạn chưa nộp đơn vào công việc nào. Hãy chuyển sang tab "Khám phá Việc làm" để tìm kiếm cơ hội phù hợp!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {myApplications.map((app) => (
                    <div key={app.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h4 style={{ fontSize: 16, fontWeight: 700 }}>{app.job_title}</h4>
                          <span className="badge badge-secondary">{app.category}</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>
                          🏢 Nhà tuyển dụng: <strong>{app.employer_name}</strong> | 📍 {app.location} | 💵 {Number(app.salary).toLocaleString('vi-VN')} đ
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8' }}>
                          Thời gian nộp: {new Date(app.applied_at).toLocaleString('vi-VN')}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${app.status === 'ACCEPTED' ? 'badge-success' : app.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`} style={{ padding: '6px 12px', fontSize: 13 }}>
                          {app.status === 'PENDING' && '⏳ Chờ nhà tuyển dụng duyệt'}
                          {app.status === 'ACCEPTED' && '🎉 Đã được nhận vào làm'}
                          {app.status === 'REJECTED' && '❌ Hồ sơ chưa phù hợp'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: QUẢN TRỊ VIÊN (ADMIN) ==================== */}
        {activeTab === 'admin' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800 }}>Bảng Quản trị Hệ thống (Admin Portal) — UC-10</h2>
                <p style={{ color: '#64748b', fontSize: 14 }}>Giám sát người dùng, kiểm duyệt tin tuyển dụng và tổng quan hệ sinh thái</p>
              </div>
              <span className="badge badge-danger" style={{ padding: '6px 14px', fontSize: 13 }}>
                Quản trị viên tối cao
              </span>
            </div>

            {/* Metric KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              <div className="card" style={{ borderLeft: '4px solid #4f46e5' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Tổng người dùng hệ thống</span>
                <h3 style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                  {adminUsers.length} tài khoản
                </h3>
              </div>
              <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Tổng tin tuyển dụng</span>
                <h3 style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                  {jobs.length} tin đăng
                </h3>
              </div>
              <div className="card" style={{ borderLeft: '4px solid #0ea5e9' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Trạng thái Cơ sở dữ liệu</span>
                <h3 style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: '#10b981' }}>
                  PostgreSQL 18 OK
                </h3>
              </div>
            </div>

            {/* User Management Table */}
            <div className="card">
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Danh sách người dùng và phân quyền</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: 10 }}>ID</th>
                      <th style={{ padding: 10 }}>Họ và tên</th>
                      <th style={{ padding: 10 }}>Email</th>
                      <th style={{ padding: 10 }}>Vai trò</th>
                      <th style={{ padding: 10 }}>Trạng thái</th>
                      <th style={{ padding: 10 }}>Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 10 }}>#{u.id}</td>
                        <td style={{ padding: 10, fontWeight: 600 }}>{u.full_name}</td>
                        <td style={{ padding: 10, color: '#64748b' }}>{u.email}</td>
                        <td style={{ padding: 10 }}>
                          <span className={`badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'EMPLOYER' ? 'badge-primary' : 'badge-success'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: 10 }}>
                          <span className="badge badge-success">{u.status}</span>
                        </td>
                        <td style={{ padding: 10, color: '#94a3b8' }}>
                          {new Date(u.created_at).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modal Ứng tuyển */}
      {applyModalOpen && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, maxWidth: 500, width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Nộp hồ sơ ứng tuyển: {selectedJob.title}
            </h3>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
              Nhà tuyển dụng: <strong>{selectedJob.company_name || selectedJob.employer_name}</strong>
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                Lời nhắn / Thư giới thiệu bản thân (Cover Letter)
              </label>
              <textarea 
                rows={4} 
                placeholder="Giới thiệu nhanh về kỹ năng, kinh nghiệm và thời gian bạn có thể làm việc..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ background: '#f8fafc', padding: 10, borderRadius: 6, fontSize: 12, color: '#64748b', marginBottom: 16 }}>
              📎 Hồ sơ CV sinh viên đính kèm: <strong>CV_Nguyen_Van_Chi_VLU.pdf</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setApplyModalOpen(false)} className="btn btn-secondary">
                Hủy bỏ
              </button>
              <button onClick={handleApply} className="btn btn-primary">
                Xác nhận nộp đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '24px 32px', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
        <p>Đồ Án Tốt Nghiệp — Chuyên Đề 2 | Khoa Công Nghệ Thông Tin — Đại Học Văn Lang (VLU)</p>
        <p style={{ marginTop: 4, color: '#94a3b8' }}>SVTH: Nguyễn Tấn Hoàng Thông, Lê Quang Anh Tuấn, Nguyễn Văn Chí — GVHD: ThS. Nguyễn Văn Trung</p>
      </footer>
    </div>
  );
}
