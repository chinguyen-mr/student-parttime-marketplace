import React, { useEffect, useState } from 'react';
import { X, ShieldCheck, Info, Loader2, EyeOff } from 'lucide-react';
import AnimatedModal from '../common/AnimatedModal';
import RatingStars from './RatingStars';
import { reviewRequest } from './reviewApi';
import {
  COMPANY_CRITERIA, JOB_CRITERIA, COMPANY_EXPERIENCES, JOB_EXPERIENCES, EXPERIENCE_LABEL,
  emptyReviewForm, validateReviewForm,
} from '../../utils/reviewDisplay';

const label = { display: 'block', fontSize: 13.5, fontWeight: 700, color: '#1E293B', marginBottom: 6 };
const input = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'inherit', color: '#1E293B' };
const counter = (n, max) => <span style={{ fontSize: 11.5, color: n > max ? '#DC2626' : '#94A3B8', float: 'right', fontWeight: 500 }}>{n}/{max}</span>;

/**
 * Form viết / sửa đánh giá.
 * type: 'company' (targetId = employerId) | 'job' (targetId = jobId)
 * existing: đánh giá của chính người dùng (sửa) | null (viết mới)
 * verifiable: các trạng thái trải nghiệm hệ thống có dữ liệu để xác thực (company)
 */
export default function ReviewFormModal({ isOpen, onClose, type, targetId, targetName, existing = null, verifiable = [], currentUser, onSaved, showToast }) {
  const [form, setForm] = useState(() => emptyReviewForm(type, existing));
  const [errors, setErrors] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) { setForm(emptyReviewForm(type, existing)); setErrors([]); setSaving(false); }
  }, [isOpen, type, existing]);

  const criteria = type === 'company' ? COMPANY_CRITERIA : JOB_CRITERIA;
  const experiences = type === 'company' ? COMPANY_EXPERIENCES : JOB_EXPERIENCES;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const willVerify = type === 'job' || verifiable.includes(form.experience_type);

  const submit = async (e) => {
    e.preventDefault();
    const errs = validateReviewForm(type, form);
    setErrors(errs);
    if (errs.length) return;
    setSaving(true);
    try {
      const path = existing
        ? `/reviews/${type}/${existing.id}`
        : type === 'company' ? `/reviews/companies/${targetId}/company-reviews` : `/reviews/jobs/${targetId}/job-reviews`;
      const res = await reviewRequest(path, { method: existing ? 'PUT' : 'POST', token: currentUser?.token, body: form });
      showToast?.(res.message || 'Đã gửi đánh giá', 'success');
      onSaved?.(res.data);
      onClose();
    } catch (err) {
      setErrors(err.details?.length ? err.details : [err.message]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatedModal isOpen={isOpen} onClose={saving ? undefined : onClose} maxWidth="640px" style={{ maxHeight: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column' }}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }} aria-labelledby="review-form-title" noValidate>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h2 id="review-form-title" style={{ fontSize: 17, fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
              {existing ? 'Chỉnh sửa đánh giá' : type === 'company' ? 'Đánh giá doanh nghiệp' : 'Đánh giá công việc'}
            </h2>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 2, overflowWrap: 'anywhere' }}>{targetName}</div>
          </div>
          <button type="button" onClick={onClose} disabled={saving} aria-label="Đóng" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={label}>{type === 'job' ? '1. Bạn đã trải nghiệm công việc này dưới hình thức nào?' : '1. Trạng thái trải nghiệm của bạn với doanh nghiệp'}</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
              {experiences.map(x => {
                const active = form.experience_type === x;
                return (
                  <label key={x} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 13.5, fontWeight: 600,
                    border: `1.5px solid ${active ? '#7565A8' : '#E2E8F0'}`, background: active ? '#F1EEF8' : '#ffffff', color: active ? '#594675' : '#334155' }}>
                    <input type="radio" name="experience_type" value={x} checked={active} onChange={() => set('experience_type', x)} style={{ accentColor: '#7565A8' }} />
                    {EXPERIENCE_LABEL[x]}
                  </label>
                );
              })}
            </div>
            {form.experience_type && (
              <div style={{ marginTop: 8, fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'flex-start', color: willVerify ? '#047857' : '#92400E' }}>
                {willVerify ? <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: 1 }} /> : <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />}
                {willVerify
                  ? 'Hệ thống có dữ liệu ứng tuyển / công việc của bạn trên JobNest nên đánh giá sẽ được gắn nhãn "Trải nghiệm đã xác thực".'
                  : 'JobNest chưa có dữ liệu để xác thực trải nghiệm này. Đánh giá vẫn được gửi nhưng sẽ được quản trị viên kiểm duyệt trước khi hiển thị và không có nhãn xác thực.'}
              </div>
            )}
          </fieldset>

          <div>
            <div style={label}>2. Chấm điểm từng tiêu chí</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {criteria.map(([k, text]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '6px 0', borderBottom: '1px dashed #F1F5F9' }}>
                  <span style={{ fontSize: 13.5, color: '#334155', fontWeight: k === 'rating_overall' ? 800 : 500 }}>{text}</span>
                  <RatingStars value={form[k]} onChange={(v) => set(k, v)} label={text} size={20} />
                </div>
              ))}
            </div>
          </div>

          {type === 'company' ? (
            <>
              <div>
                <label htmlFor="rv-title" style={label}>3. Tiêu đề nhận xét {counter(form.title.length, 120)}</label>
                <input id="rv-title" style={input} value={form.title} maxLength={140} onChange={(e) => set('title', e.target.value)} placeholder="Tóm tắt trải nghiệm trong một câu" />
              </div>
              <div>
                <label htmlFor="rv-pros" style={label}>4. Ưu điểm {counter(form.pros.length, 2000)}</label>
                <textarea id="rv-pros" rows={3} style={input} value={form.pros} onChange={(e) => set('pros', e.target.value)} placeholder="Điều bạn thấy tốt ở doanh nghiệp (tối thiểu 20 ký tự)" />
              </div>
              <div>
                <label htmlFor="rv-cons" style={label}>5. Hạn chế {counter(form.cons.length, 2000)}</label>
                <textarea id="rv-cons" rows={3} style={input} value={form.cons} onChange={(e) => set('cons', e.target.value)} placeholder="Điều doanh nghiệp cần cải thiện (tối thiểu 20 ký tự)" />
              </div>
              <div>
                <label htmlFor="rv-advice" style={label}>6. Lời khuyên cho ứng viên khác <span style={{ fontWeight: 500, color: '#94A3B8' }}>(không bắt buộc)</span> {counter(form.advice.length, 1000)}</label>
                <textarea id="rv-advice" rows={2} style={input} value={form.advice} onChange={(e) => set('advice', e.target.value)} />
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="rv-content" style={label}>3. Nội dung nhận xét {counter(form.content.length, 3000)}</label>
              <textarea id="rv-content" rows={5} style={input} value={form.content} onChange={(e) => set('content', e.target.value)}
                placeholder="Công việc thực tế so với mô tả, lương, lịch làm, khối lượng việc, sự hỗ trợ của quản lý… (tối thiểu 30 ký tự)" />
            </div>
          )}

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: '#334155', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_anonymous} onChange={(e) => set('is_anonymous', e.target.checked)} style={{ accentColor: '#7565A8', marginTop: 3 }} />
            <span>
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><EyeOff size={14} /> Đăng ẩn danh</strong>
              <span style={{ display: 'block', fontSize: 12.5, color: '#64748B' }}>
                Tên của bạn sẽ không hiển thị với doanh nghiệp và người xem. Quản trị viên JobNest vẫn biết người viết để kiểm duyệt.
              </span>
            </span>
          </label>

          <div style={{ fontSize: 12.5, color: '#64748B', background: '#F8FAFC', borderRadius: 10, padding: '10px 12px', lineHeight: 1.55 }}>
            Vui lòng không ghi số điện thoại, email, đường link hay thông tin cá nhân của người khác. Đánh giá có những nội dung này sẽ được chuyển sang kiểm duyệt.
            {existing && ' Mỗi đánh giá được chỉnh sửa tối đa 5 lần.'}
          </div>

          {errors.length > 0 && (
            <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 10, padding: '10px 12px', fontSize: 13 }}>
              <ul style={{ margin: 0, paddingLeft: 18 }}>{errors.map(e => <li key={e}>{e}</li>)}</ul>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" onClick={onClose} disabled={saving} style={{ padding: '10px 16px', borderRadius: 10, border: '1.5px solid #CBD5E1', background: '#fff', color: '#334155', fontWeight: 700, cursor: 'pointer' }}>Hủy</button>
          <button type="submit" disabled={saving} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#7565A8', color: '#fff', fontWeight: 700, cursor: saving ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {saving && <Loader2 size={15} className="animate-spin" />} {existing ? 'Lưu thay đổi' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </AnimatedModal>
  );
}
