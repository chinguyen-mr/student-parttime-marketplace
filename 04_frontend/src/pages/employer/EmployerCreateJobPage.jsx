import React, { useState, useEffect } from 'react';
import { 
  Building2, Briefcase, Calendar, DollarSign, MapPin, 
  Clock, FileText, Image as ImageIcon, CheckCircle2, 
  AlertCircle, ArrowLeft, Send, Save, X
} from 'lucide-react';
import { Button } from '../../components/ui';
import { API_BASE, formatApiError } from '../../config/api';

export default function EmployerCreateJobPage({
  currentUser,
  editingJob = null,
  onCancel,
  onSuccess,
  onNavigateVerification,
  showToast
}) {
  // Form Type: 'PART_TIME' | 'FULL_TIME' (WF-E05 dynamic columns)
  const [workType, setWorkType] = useState(editingJob?.work_type || 'PART_TIME');

  // Form Fields
  const [title, setTitle] = useState(editingJob?.title || '');
  const [category, setCategory] = useState(editingJob?.category || 'Công nghệ thông tin');
  const [location, setLocation] = useState(editingJob?.location || 'Quận Bình Thạnh, TP.HCM');
  const [description, setDescription] = useState(editingJob?.description || '');
  const [requirements, setRequirements] = useState(editingJob?.requirements || '');
  const [salaryType, setSalaryType] = useState(editingJob?.salary_type || 'HOURLY');
  const [salary, setSalary] = useState(editingJob?.salary || 40000);
  const [quantityRequired, setQuantityRequired] = useState(editingJob?.quantity_required || 1);
  const [applicationDeadline, setApplicationDeadline] = useState(() => {
    if (editingJob?.application_deadline) {
      return new Date(editingJob.application_deadline).toISOString().split('T')[0];
    }
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [jobBannerUrl, setJobBannerUrl] = useState(editingJob?.job_banner_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800');

  // Specific Freelance / Seasonal Fields
  const [deliverableRequirements, setDeliverableRequirements] = useState('Bàn giao mã nguồn hoàn chỉnh kèm tài liệu hướng dẫn và link demo trực tuyến.');
  const [revisionPolicy, setRevisionPolicy] = useState('Hỗ trợ chỉnh sửa tối đa 2 lần trong vòng 7 ngày sau khi nghiệm thu.');

  const [submitting, setSubmitting] = useState(false);
  const [deadlineError, setDeadlineError] = useState(null);

  // Sync form state if editingJob changes
  useEffect(() => {
    if (editingJob) {
      setWorkType(editingJob.work_type || 'PART_TIME');
      setTitle(editingJob.title || '');
      setCategory(editingJob.category || 'Công nghệ thông tin');
      setLocation(editingJob.location || 'Quận Bình Thạnh, TP.HCM');
      setDescription(editingJob.description || '');
      setRequirements(editingJob.requirements || '');
      setSalaryType(editingJob.salary_type || 'HOURLY');
      setSalary(editingJob.salary || 40000);
      setQuantityRequired(editingJob.quantity_required || editingJob.slots || 1);
      if (editingJob.application_deadline) {
        setApplicationDeadline(new Date(editingJob.application_deadline).toISOString().split('T')[0]);
      }
      if (editingJob.job_banner_url) {
        setJobBannerUrl(editingJob.job_banner_url);
      }
    }
  }, [editingJob]);

  // Validate deadline in future whenever it changes
  useEffect(() => {
    if (applicationDeadline) {
      const selected = new Date(applicationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected <= today) {
        setDeadlineError('Hạn chót ứng tuyển (application_deadline) bắt buộc phải là ngày trong tương lai!');
      } else {
        setDeadlineError(null);
      }
    }
  }, [applicationDeadline]);

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e?.preventDefault();

    // 1. Validate future deadline
    const selectedDate = new Date(applicationDeadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate <= today) {
      setDeadlineError('Hạn chót ứng tuyển bắt buộc phải ở tương lai!');
      if (showToast) showToast('Hạn chót ứng tuyển phải ở tương lai!', 'error');
      return;
    }

    if (!title.trim()) {
      if (showToast) showToast('Vui lòng nhập tiêu đề tin tuyển dụng', 'error');
      return;
    }

    if (!description.trim()) {
      if (showToast) showToast('Vui lòng nhập mô tả công việc', 'error');
      return;
    }

    const isEditing = !!editingJob?.id;

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        category,
        location: location.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
        work_type: workType,
        salary_type: salaryType,
        salary: Number(salary),
        quantity_required: Number(quantityRequired),
        application_deadline: new Date(applicationDeadline).toISOString(),
        job_banner_url: jobBannerUrl.trim(),
        deliverable_requirements: workType === 'FREELANCE' ? deliverableRequirements.trim() : undefined,
        revision_policy: workType === 'FREELANCE' ? revisionPolicy.trim() : undefined
      };

      const url = isEditing ? `${API_BASE}/jobs/${editingJob.id}` : `${API_BASE}/jobs`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        if (showToast) {
          showToast(
            isEditing 
              ? 'Cập nhật tin tuyển dụng thành công!' 
              : 'Đăng tin tuyển dụng thành công! Tin đang chờ kiểm duyệt (PENDING).',
            'success'
          );
        }
        if (onSuccess) onSuccess(data.data);
      } else {
        throw new Error(data.message || (isEditing ? 'Lỗi cập nhật tin tuyển dụng' : 'Lỗi đăng tin tuyển dụng'));
      }
    } catch (err) {
      if (showToast) showToast(formatApiError(err, isEditing ? 'Lỗi cập nhật tin tuyển dụng' : 'Lỗi tạo tin tuyển dụng'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 'none', paddingBottom: 60 }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginBottom: 6
            }}
          >
            <ArrowLeft size={14} /> Quay lại danh sách tin (WF-E04)
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            {editingJob ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới (WF-E05)'}
          </h1>
        </div>

        <span style={{
          fontSize: 12,
          fontWeight: 700,
          background: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          padding: '4px 12px',
          borderRadius: 16
        }}>
          WF-E05 Form động
        </span>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#ffffff', borderRadius: 16, border: '1px solid var(--color-border)', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Dynamic Job Type Selector matching WF-E05: Part-time | Full-time */}
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
            Chọn hình thức tuyển dụng <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {[
              { id: 'PART_TIME', label: 'Bán thời gian (Part-time)', desc: 'Làm việc theo ca/giờ, linh hoạt lịch học' },
              { id: 'FULL_TIME', label: 'Toàn thời gian (Full-time)', desc: 'Làm việc giờ hành chính, phù hợp sinh viên năm cuối' },
            ].map(type => (
              <div
                key={type.id}
                onClick={() => setWorkType(type.id)}
                style={{
                  border: `2px solid ${workType === type.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  background: workType === type.id ? 'var(--color-primary-light)' : '#ffffff',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 800, color: workType === type.id ? 'var(--color-primary)' : 'var(--color-text)', marginBottom: 4 }}>
                  {type.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {type.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              Tiêu đề tin tuyển dụng <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Nhân viên phục vụ quán cà phê ca tối / Lập trình viên ReactJS..."
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                fontSize: 14
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              Ngành nghề / Danh mục
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                fontSize: 14,
                background: '#ffffff'
              }}
            >
              <option value="Công nghệ thông tin">Công nghệ thông tin</option>
              <option value="Thiết kế đồ họa">Thiết kế đồ họa</option>
              <option value="F&B / Phục vụ">F&B / Phục vụ</option>
              <option value="Sự kiện / Truyền thông">Sự kiện / Truyền thông</option>
              <option value="Gia sư / Giáo dục">Gia sư / Giáo dục</option>
              <option value="Bán hàng / Thu ngân">Bán hàng / Thu ngân</option>
            </select>
          </div>
        </div>

        {/* Location & Slots */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              Địa điểm làm việc / Hình thức
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="VD: Quận Bình Thạnh, TP.HCM"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                fontSize: 14
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              Số lượng tuyển (Slots) <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={quantityRequired}
              onChange={(e) => setQuantityRequired(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                fontSize: 14
              }}
            />
          </div>
        </div>

        {/* Salary / Wage & Salary Type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              {workType === 'FREELANCE' ? 'Ngân sách trọn gói (VNĐ)' : 'Mức lương / Thù lao (VNĐ)'}
            </label>
            <input
              type="number"
              step={5000}
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                fontSize: 14
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
              Hình thức chi trả
            </label>
            <select
              value={salaryType}
              onChange={(e) => setSalaryType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                fontSize: 14,
                background: '#ffffff'
              }}
            >
              <option value="HOURLY">Theo giờ (HOURLY)</option>
              <option value="DAILY">Theo ngày / ca (DAILY)</option>
              <option value="MONTHLY">Theo tháng (MONTHLY)</option>
            </select>
          </div>
        </div>

        {/* APPLICATION DEADLINE (Validate Future Date - Requirement) */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
            Hạn chót ứng tuyển (application_deadline) <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            type="date"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: `1.5px solid ${deadlineError ? 'var(--color-danger)' : 'var(--color-border)'}`,
              fontSize: 14
            }}
          />
          {deadlineError ? (
            <div style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              <AlertCircle size={14} /> {deadlineError}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              Hệ thống sẽ tự động đóng nhận hồ sơ khi qua hạn chót này.
            </div>
          )}
        </div>

        {/* Banner URL (Upload / Link) */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
            Đường dẫn Banner việc làm (job_banner_url)
          </label>
          <input
            type="url"
            value={jobBannerUrl}
            onChange={(e) => setJobBannerUrl(e.target.value)}
            placeholder="https://.../banner.jpg"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              fontSize: 14
            }}
          />
        </div>

        {/* Description & Requirements */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
            Mô tả chi tiết công việc <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
            placeholder="Nêu rõ các đầu việc cần làm, ca làm việc, thời gian và môi trường làm việc..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              fontSize: 14,
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
            Yêu cầu đối với sinh viên ứng tuyển
          </label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={3}
            placeholder="Kỹ năng mềm, thái độ, sự nhiệt tình, phương tiện đi lại hoặc các chứng chỉ liên quan..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              fontSize: 14,
              resize: 'vertical'
            }}
          />
        </div>

        {/* Freelance Specific: Deliverable Requirements & Revision Policy (Wireframe C10) */}
        {workType === 'FREELANCE' && (
          <div style={{ background: '#F8F7FB', borderRadius: 12, padding: '18px 20px', marginBottom: 24, border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--color-primary)', marginBottom: 12 }}>
              QUY ĐỊNH BÀN GIAO DỰ ÁN FREELANCE (C10)
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                Yêu cầu sản phẩm bàn giao (Deliverable requirements) *
              </label>
              <input
                type="text"
                value={deliverableRequirements}
                onChange={(e) => setDeliverableRequirements(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
                Chính sách chỉnh sửa sau bàn giao (Revision policy)
              </label>
              <input
                type="text"
                value={revisionPolicy}
                onChange={(e) => setRevisionPolicy(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--color-border)', fontSize: 13 }}
              />
            </div>
          </div>
        )}

        {/* Buttons matching WF-E05: Lưu nháp | Gửi duyệt | Hủy */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            style={{ padding: '10px 20px', fontSize: 13.5 }}
          >
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={submitting || !!deadlineError}
            style={{ padding: '10px 24px', fontSize: 13.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            {editingJob?.id ? <Save size={15} /> : <Send size={15} />} 
            {submitting ? 'Đang lưu...' : (editingJob?.id ? 'Lưu thay đổi tin tuyển dụng' : 'Gửi duyệt tin tuyển dụng')}
          </Button>
        </div>
      </form>
    </div>
  );
}
