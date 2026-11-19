import React, { useState, useEffect, useRef } from 'react';
import MoneyInput from '../../components/common/MoneyInput';
import { AlertCircle, ArrowLeft, Send, Save, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { API_BASE, formatApiError, resolveFileUrl } from '../../config/api';
import { checkImageFile, resizeImageFile } from '../../utils/imageResize';

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
  const [quantityRequired, setQuantityRequired] = useState(editingJob?.quantity_required || editingJob?.headcount || 1);
  const [applicationDeadline, setApplicationDeadline] = useState(() => {
    if (editingJob?.application_deadline) {
      return new Date(editingJob.application_deadline).toISOString().split('T')[0];
    }
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const bannerInput = useRef(null);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [jobBannerUrl, setJobBannerUrl] = useState(editingJob?.job_banner_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800');

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
      setQuantityRequired(editingJob.quantity_required || editingJob.headcount || editingJob.slots || 1);
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
        setDeadlineError('Hạn chót ứng tuyển bắt buộc phải là ngày trong tương lai!');
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
        // Full-time luôn tính theo tháng; Part-time theo giờ hoặc theo tháng
        salary_type: workType === 'FULL_TIME' ? 'MONTHLY' : (salaryType === 'MONTHLY' ? 'MONTHLY' : 'HOURLY'),
        salary: Number(salary),
        quantity_required: Number(quantityRequired),
        application_deadline: new Date(applicationDeadline).toISOString(),
        job_banner_url: jobBannerUrl.trim()
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
              ? 'Đã lưu thay đổi! Tin được gửi Admin duyệt lại và tạm ẩn với sinh viên đến khi được duyệt.' 
              : 'Đăng tin thành công! Tin sẽ hiển thị với sinh viên sau khi Admin duyệt.',
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
            <ArrowLeft size={14} /> Quay lại danh sách tin
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-text)', margin: 0 }}>
            {editingJob ? 'Chỉnh sửa tin tuyển dụng' : 'Đăng tin tuyển dụng mới'}
          </h1>
        </div>
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
              Mức lương / Thù lao
            </label>
            <MoneyInput
              value={salary}
              onChange={setSalary}
              placeholder="Ví dụ: 30.000"
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
              Tính lương theo
            </label>
            {/* Part-time: theo giờ hoặc theo tháng; Full-time: theo tháng */}
            <select
              value={workType === 'FULL_TIME' ? 'MONTHLY' : salaryType}
              onChange={(e) => setSalaryType(e.target.value)}
              disabled={workType === 'FULL_TIME'}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1.5px solid var(--color-border)',
                fontSize: 14,
                background: '#ffffff'
              }}
            >
              {workType !== 'FULL_TIME' && <option value="HOURLY">Theo giờ</option>}
              <option value="MONTHLY">Theo tháng</option>
            </select>
          </div>
          {workType !== 'FULL_TIME' && (
            <div style={{ gridColumn: '1 / -1', fontSize: 12.5, color: 'var(--color-text-secondary)', marginTop: -6 }}>
              Nhận lương cuối ca/trong ngày hay cuối tháng: bạn thỏa thuận với sinh viên sau khi nhận hồ sơ.
            </div>
          )}
        </div>

        {/* APPLICATION DEADLINE (Validate Future Date - Requirement) */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
            Hạn chót ứng tuyển <span style={{ color: 'var(--color-danger)' }}>*</span>
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

        {/* Ảnh banner: chọn từ máy, tải lên ngay và hiển thị xem trước */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
            Ảnh banner tin tuyển dụng
          </label>
          <input
            ref={bannerInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              const err = checkImageFile(file);
              if (err) { if (showToast) showToast(err, 'error'); return; }
              setBannerUploading(true);
              try {
                const image = await resizeImageFile(file, { maxWidth: 1600, maxHeight: 900 });
                const res = await fetch(`${API_BASE}/files/job-banner`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentUser?.token}` },
                  body: JSON.stringify({ image })
                });
                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.message || 'Không tải được ảnh');
                setJobBannerUrl(data.data.url);
              } catch (ex) {
                if (showToast) showToast(formatApiError(ex, 'Không tải được ảnh banner'), 'error');
              } finally {
                setBannerUploading(false);
              }
            }}
          />
          {jobBannerUrl ? (
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)', aspectRatio: '16 / 6', background: '#F1F5F9' }}>
              <img src={resolveFileUrl(jobBannerUrl)} alt="Ảnh banner tin tuyển dụng" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', gap: 8 }}>
                <button type="button" disabled={bannerUploading} onClick={() => bannerInput.current?.click()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#ffffff', color: '#334155', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 3px rgba(15,23,42,0.2)' }}>
                  {bannerUploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Đổi ảnh
                </button>
                <button type="button" disabled={bannerUploading} onClick={() => setJobBannerUrl('')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, border: 'none', background: '#ffffff', color: '#B91C1C', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 3px rgba(15,23,42,0.2)' }}>
                  <Trash2 size={14} /> Bỏ ảnh
                </button>
              </div>
            </div>
          ) : (
            <button type="button" disabled={bannerUploading} onClick={() => bannerInput.current?.click()}
              style={{ width: '100%', aspectRatio: '16 / 4', borderRadius: 12, border: '1.5px dashed #CBD5E1', background: '#F8FAFC', color: '#475569', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {bannerUploading ? <Loader2 size={22} className="animate-spin" /> : <ImagePlus size={22} />}
              {bannerUploading ? 'Đang tải ảnh…' : 'Chọn ảnh từ máy'}
            </button>
          )}
          <div style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', marginTop: 6 }}>
            JPG, PNG hoặc WEBP. Nên dùng ảnh ngang (tỉ lệ khoảng 16:6). Không bắt buộc.
          </div>
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
