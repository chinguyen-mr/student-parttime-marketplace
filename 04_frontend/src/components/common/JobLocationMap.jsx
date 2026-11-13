import React, { useState } from 'react';
import { 
  MapPin, ExternalLink, Globe, AlertCircle, 
  Navigation, CheckCircle2, ShieldCheck 
} from 'lucide-react';

/**
 * JobLocationMap Component
 * Hiển thị vị trí làm việc của tin tuyển dụng trên Google Maps Embed chuẩn quốc tế.
 * Tự động đồng bộ với địa chỉ thực tế và tọa độ GPS của từng tin tuyển dụng.
 */
// title / exactLabel / mapHeight: mặc định giữ nguyên hiển thị ở trang chi tiết việc làm;
// trang hồ sơ công ty truyền giá trị riêng.
// strictPrecision: chỉ coi là chính xác khi có tọa độ thật (không dựa vào việc địa chỉ có chữ số)
export default function JobLocationMap({ job, title = 'Vị trí làm việc', exactLabel = 'Địa chỉ xác thực', approxLabel = 'Vị trí khu vực (Ước lượng)', mapHeight = 280, strictPrecision = false }) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!job) return null;

  // 1. Kiểm tra trường hợp làm việc từ xa (Remote 100%)
  const isRemote = 
    job.work_type === 'REMOTE' || 
    (job.location && job.location.toLowerCase().includes('remote')) ||
    (job.work_address && job.work_address.toLowerCase().includes('remote'));

  if (isRemote) {
    return (
      <div
        id="job-location-map-section"
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #EAE5F0',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(89, 70, 117, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h4
            style={{
              fontSize: 14,
              fontWeight: 800,
              color: '#30283A',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <MapPin size={16} color="#594675" /> {title}
          </h4>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#059669',
              background: '#ECFDF5',
              padding: '3px 8px',
              borderRadius: 6,
              border: '1px solid #A7F3D0',
            }}
          >
            Làm việc từ xa (Remote)
          </span>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #FAF8FC 0%, #F5F3FF 100%)',
            border: '1px dashed #D8B4FE',
            borderRadius: 10,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#594675',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#ffffff',
            }}
          >
            <Globe size={18} />
          </div>
          <div>
            <h5 style={{ fontSize: 13.5, fontWeight: 700, color: '#30283A', margin: '0 0 3px 0' }}>
              Công việc làm từ xa – Không có địa điểm làm việc cố định
            </h5>
            <p style={{ fontSize: 12.5, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              Sinh viên có thể làm việc online linh hoạt tại nhà, ký túc xá hoặc bất kỳ địa điểm nào có kết nối Internet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Xác định địa chỉ hiển thị
  const displayAddress = job.work_address || job.company_address || job.location;

  if (!displayAddress) {
    return (
      <div
        id="job-location-map-section"
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #EAE5F0',
          padding: '20px 22px',
          boxShadow: '0 1px 3px rgba(89, 70, 117, 0.03)',
        }}
      >
        <h4
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#30283A',
            marginBottom: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <MapPin size={16} color="#594675" /> Vị trí làm việc
        </h4>
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 10,
            padding: '14px 16px',
            fontSize: 12.5,
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AlertCircle size={18} color="#94A3B8" />
          <span>Chưa có thông tin địa chỉ làm việc cụ thể. Vui lòng liên hệ nhà tuyển dụng để biết thêm chi tiết.</span>
        </div>
      </div>
    );
  }

  // 3. Xây dựng URL Google Maps Embed và Chỉ đường
  const hasCoordinates = job.latitude && job.longitude;
  const lat = Number(job.latitude);
  const lng = Number(job.longitude);

  // Kiểm tra xem địa chỉ có phải là địa chỉ chi tiết (có số nhà / đường) hay chỉ là khu vực quận/huyện
  const isApproximate = strictPrecision ? !hasCoordinates : (!hasCoordinates && !(/\d+/.test(displayAddress)));

  // Query cho Google Maps Embed:
  // Nếu có tọa độ GPS chính xác (như Job 3 The Coffee Chill: 10.827725, 106.699712) -> ghim đúng vị trí!
  // Hoặc dùng địa chỉ đầy đủ (như "123 Đặng Thùy Trâm, Bình Thạnh, TP.HCM")
  const googleMapsQuery = hasCoordinates 
    ? `${lat},${lng}`
    : encodeURIComponent(displayAddress.includes('TP.') || displayAddress.includes('Hồ Chí Minh') || displayAddress.includes('Hà Nội') ? displayAddress : `${displayAddress}, Việt Nam`);

  const embedUrl = `https://maps.google.com/maps?q=${googleMapsQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed&hl=vi`;
  
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${googleMapsQuery}`;

  return (
    <div
      id="job-location-map-section"
      style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #EAE5F0',
        padding: '20px 22px',
        boxShadow: '0 1px 3px rgba(89, 70, 117, 0.03)',
      }}
    >
      {/* HEADER: Tiêu đề & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <h4
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#30283A',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <MapPin size={16} color="#EA4335" /> {title}
        </h4>

        {isApproximate ? (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#B45309',
              background: '#FEF3C7',
              padding: '2px 8px',
              borderRadius: 6,
              border: '1px solid #FDE68A',
            }}
          >
            {approxLabel}
          </span>
        ) : (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#059669',
              background: '#ECFDF5',
              padding: '2px 8px',
              borderRadius: 6,
              border: '1px solid #A7F3D0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <CheckCircle2 size={11} /> {exactLabel}
          </span>
        )}
      </div>

      {/* ĐỊA CHỈ CHI TIẾT */}
      <p
        style={{
          fontSize: 13,
          color: '#475569',
          margin: '0 0 12px 0',
          lineHeight: 1.5,
          fontWeight: 500,
        }}
      >
        {displayAddress}
      </p>

      {/* KHUNG GOOGLE MAPS EMBED */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: mapHeight,
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid #EAE5F0',
          background: '#F1F5F9',
          marginBottom: 12,
        }}
      >
        {/* Placeholder skeleton khi iframe đang tải */}
        {!iframeLoaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: '#F8FAFC',
              color: '#64748B',
              fontSize: 12.5,
              zIndex: 1,
            }}
          >
            <MapPin size={24} color="#EA4335" className="animate-bounce" />
            <span>Đang tải Google Maps...</span>
          </div>
        )}

        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{
            border: 0,
            display: 'block',
            width: '100%',
            height: '100%',
          }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          title={`Google Maps - ${job.title}`}
          onLoad={() => setIframeLoaded(true)}
        />
      </div>

      {/* NÚT CHỈ ĐƯỜNG TRÊN GOOGLE MAPS */}
      <a
        href={directionsUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          width: '100%',
          padding: '8px 14px',
          background: '#ffffff',
          color: '#594675',
          border: '1px solid #594675',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          textDecoration: 'none',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#594675';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.color = '#594675';
        }}
      >
        <Navigation size={14} /> Mở chỉ đường trên Google Maps <ExternalLink size={12} />
      </a>
    </div>
  );
}
