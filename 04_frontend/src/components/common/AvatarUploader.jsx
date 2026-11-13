import React, { useEffect, useRef, useState } from 'react';
import { Camera, Trash2, Loader2, Crop, ImagePlus } from 'lucide-react';
import { API_BASE, resolveFileUrl } from '../../config/api';
import AvatarEditorModal, { downscaleSource } from './AvatarEditorModal';

const MAX_INPUT_BYTES = 10 * 1024 * 1024;

/**
 * Ảnh đại diện.
 * - readOnly: chỉ hiển thị (vd ở sidebar), bấm gọi onClick.
 * - Mặc định: có Chỉnh sửa (căn lại ảnh hiện tại), Đổi ảnh, Xóa. Gọi onChange(url | null) sau khi lưu.
 */
export default function AvatarUploader({
  token, avatarUrl, fallbackText = 'U', size = 88, onChange, showToast, readOnly = false, onClick, title
}) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [hover, setHover] = useState(false);
  const [editor, setEditor] = useState(null); // { src, isNew }

  const notify = (msg, type) => showToast && showToast(msg, type);
  const src = resolveFileUrl(avatarUrl);

  // Giải phóng object URL khi đóng khung chỉnh
  useEffect(() => () => { if (editor?.src?.startsWith('blob:')) URL.revokeObjectURL(editor.src); }, [editor]);

  const pickFile = () => !busy && inputRef.current?.click();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return notify('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.', 'error');
    if (file.size > MAX_INPUT_BYTES) return notify('Ảnh quá lớn (tối đa 10MB).', 'error');
    setEditor({ src: URL.createObjectURL(file), isNew: true });
  };

  // Mở lại ảnh gốc để căn chỉnh; ảnh cũ chưa có bản gốc thì dùng chính ảnh đại diện hiện tại
  const editCurrent = async () => {
    if (busy || !src) return;
    setBusy(true);
    try {
      let res = await fetch(`${API_BASE}/files/avatar/source`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 404) res = await fetch(src);
      if (!res.ok) throw new Error();
      setEditor({ src: URL.createObjectURL(await res.blob()), isNew: false });
    } catch {
      notify('Không mở được ảnh hiện tại để chỉnh sửa.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const save = async (image, imgEl) => {
    setBusy(true);
    try {
      const body = { image };
      if (editor?.isNew) body.source = downscaleSource(imgEl);
      const res = await fetch(`${API_BASE}/files/avatar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Không thể lưu ảnh.');
      onChange && onChange(data.data.avatar_url);
      setEditor(null);
      notify('Đã cập nhật ảnh đại diện.', 'success');
    } catch (err) {
      notify(err.message || 'Không thể lưu ảnh.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Xóa ảnh đại diện hiện tại?')) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/files/avatar`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Không thể xóa ảnh.');
      onChange && onChange(null);
      notify('Đã xóa ảnh đại diện.', 'success');
    } catch (err) {
      notify(err.message || 'Không thể xóa ảnh.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const circle = (
    <span style={{
      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', border: '3px solid #ffffff',
      background: 'linear-gradient(135deg, #7565A8 0%, #A997C5 100%)', boxShadow: '0 6px 16px rgba(117, 101, 168, 0.25)'
    }}>
      {src
        ? <img src={src} alt="Ảnh đại diện" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : <span style={{ color: '#ffffff', fontSize: size * 0.38, fontWeight: 800 }}>{fallbackText}</span>}
      {!readOnly && (hover || busy) && (
        <span style={{
          position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.5)', color: '#ffffff',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, fontSize: 11, fontWeight: 700
        }}>
          {busy ? <Loader2 size={20} className="animate-spin" /> : src ? <><Crop size={20} />Chỉnh sửa</> : <><Camera size={20} />Thêm ảnh</>}
        </span>
      )}
    </span>
  );

  if (readOnly) {
    return onClick ? (
      <button type="button" onClick={onClick} title={title} aria-label={title || 'Ảnh đại diện'}
        style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', borderRadius: '50%' }}>
        {circle}
      </button>
    ) : circle;
  }

  const linkBtn = {
    display: 'inline-flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: '2px 4px',
    fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#7565A8'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        onClick={src ? editCurrent : pickFile}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-label={src ? 'Chỉnh sửa ảnh đại diện' : 'Thêm ảnh đại diện'}
        style={{ padding: 0, border: 'none', background: 'none', cursor: busy ? 'wait' : 'pointer', borderRadius: '50%' }}
      >
        {circle}
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} style={{ display: 'none' }} />

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
        {src && <button type="button" style={linkBtn} onClick={editCurrent} disabled={busy}><Crop size={12} /> Chỉnh sửa</button>}
        <button type="button" style={linkBtn} onClick={pickFile} disabled={busy}><ImagePlus size={12} /> {src ? 'Đổi ảnh' : 'Tải ảnh lên'}</button>
        {src && <button type="button" style={{ ...linkBtn, color: '#94A3B8' }} onClick={handleRemove} disabled={busy}><Trash2 size={12} /> Xóa</button>}
      </div>

      {editor && (
        <AvatarEditorModal
          src={editor.src}
          title={editor.isNew ? 'Căn chỉnh ảnh mới' : 'Chỉnh sửa ảnh đại diện'}
          saving={busy}
          onCancel={() => setEditor(null)}
          onSave={save}
        />
      )}
    </div>
  );
}
