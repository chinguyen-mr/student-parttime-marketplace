import React from 'react';
import { User, MapPin, GraduationCap, Target, Briefcase, Sparkles, Languages } from 'lucide-react';
import { resolveFileUrl } from '../../config/api';

const WORK_TYPE_LABEL = { PART_TIME: 'Bán thời gian (Part-time)', FULL_TIME: 'Toàn thời gian (Full-time)' };

const fmtDate = (d) => {
  if (!d) return null;
  const [y, m, day] = String(d).slice(0, 10).split('-');
  return day ? `${day}/${m}/${y}` : d;
};
const fmtMonth = (m) => {
  if (!m) return null;
  const [y, mo] = m.split('-');
  return `${mo}/${y}`;
};

function Block({ icon: Icon, title, children }) {
  return (
    <div style={{ padding: '16px 0', borderTop: '1px solid #F1F5F9' }}>
      <h3 style={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon size={16} color="#7565A8" /> {title}
      </h3>
      {children}
    </div>
  );
}

function Rows({ items }) {
  const shown = items.filter(([, v]) => v !== null && v !== undefined && v !== '');
  if (!shown.length) return <div style={{ fontSize: 13, color: '#94A3B8' }}>Chưa cập nhật</div>;
  return (
    <dl className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px 20px', margin: 0 }}>
      {shown.map(([label, value, full]) => (
        <div key={label} style={{ gridColumn: full ? '1 / -1' : undefined, minWidth: 0 }}>
          <dt style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{label}</dt>
          <dd style={{ margin: '2px 0 0 0', fontSize: 13.5, color: '#0F172A', whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const chip = {
  display: 'inline-block', background: '#F1EEF8', color: '#594675', border: '1px solid #DDD6FE',
  borderRadius: 999, padding: '3px 10px', fontSize: 12.5, fontWeight: 600
};

/** Hồ sơ xin việc dạng chỉ xem (dùng cho đơn ứng tuyển đã gửi). */
export default function ProfileSnapshotView({ profile }) {
  if (!profile) return <div style={{ fontSize: 13.5, color: '#94A3B8' }}>Không có thông tin hồ sơ.</div>;
  const p = profile;
  const avatar = resolveFileUrl(p.avatar_url);
  const address = [p.detailed_address, p.ward, p.province].filter(Boolean).join(', ');
  const skills = Array.isArray(p.skills) ? p.skills : [];
  const languages = Array.isArray(p.languages) ? p.languages : [];
  const experiences = Array.isArray(p.experiences) ? p.experiences : [];

  return (
    <div>
      {/* Đầu hồ sơ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: 'linear-gradient(135deg, #7565A8 0%, #A997C5 100%)', color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800
        }}>
          {avatar ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p.full_name || '?').charAt(0)}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{p.full_name || '—'}</div>
          {p.desired_position && <div style={{ fontSize: 13.5, color: '#594675', fontWeight: 600, marginTop: 2 }}>{p.desired_position}</div>}
          {(p.major || p.school) && <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>{[p.major, p.school].filter(Boolean).join(' · ')}</div>}
        </div>
      </div>

      <Block icon={User} title="Thông tin cá nhân">
        <Rows items={[
          ['Ngày sinh', fmtDate(p.date_of_birth)],
          ['Giới tính', p.gender],
          ['Số điện thoại', p.phone],
          ['Email', p.email],
        ]} />
      </Block>

      <Block icon={MapPin} title="Địa chỉ">
        <Rows items={[['Địa chỉ', address || null, true]]} />
      </Block>

      <Block icon={GraduationCap} title="Học vấn">
        <Rows items={[
          ['Trường', p.school],
          ['Chuyên ngành', p.major],
          ['Sinh viên năm', p.year_of_study],
          ['Năm tốt nghiệp (dự kiến)', p.graduation_year],
          ['GPA', p.gpa !== null && p.gpa !== undefined ? Number(p.gpa).toString() : null],
        ]} />
      </Block>

      <Block icon={Target} title="Giới thiệu & Nguyện vọng">
        <Rows items={[
          ['Giới thiệu bản thân', p.bio, true],
          ['Vị trí mong muốn', p.desired_position],
          ['Ngành nghề quan tâm', p.interested_category],
          ['Loại hình', WORK_TYPE_LABEL[p.desired_work_type] || p.desired_work_type],
          ['Mức lương mong muốn', p.desired_salary],
        ]} />
      </Block>

      <Block icon={Briefcase} title="Kinh nghiệm">
        {experiences.length === 0 ? <div style={{ fontSize: 13, color: '#94A3B8' }}>Chưa có kinh nghiệm</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {experiences.map((e, i) => (
              <div key={i} style={{ paddingLeft: 12, borderLeft: '3px solid #DDD6FE' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                  {e.title}{e.organization ? ` · ${e.organization}` : ''}
                </div>
                {(e.start_month || e.end_month) && (
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    {fmtMonth(e.start_month) || '?'} – {fmtMonth(e.end_month) || 'Hiện tại'}
                  </div>
                )}
                {e.description && <div style={{ fontSize: 13, color: '#334155', marginTop: 4, whiteSpace: 'pre-line' }}>{e.description}</div>}
              </div>
            ))}
          </div>
        )}
      </Block>

      <Block icon={Sparkles} title="Kỹ năng">
        {skills.length === 0 ? <div style={{ fontSize: 13, color: '#94A3B8' }}>Chưa cập nhật</div> : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{skills.map(s => <span key={s} style={chip}>{s}</span>)}</div>
        )}
      </Block>

      <Block icon={Languages} title="Ngoại ngữ">
        {languages.length === 0 ? <div style={{ fontSize: 13, color: '#94A3B8' }}>Chưa cập nhật</div> : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {languages.map((l, i) => <span key={i} style={chip}>{l.language}{l.level ? ` – ${l.level}` : ''}</span>)}
          </div>
        )}
      </Block>
    </div>
  );
}
