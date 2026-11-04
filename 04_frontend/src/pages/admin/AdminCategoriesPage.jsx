import React, { useState, useEffect } from 'react';
import { 
  FolderPlus, Edit3, Trash2, CheckCircle2, XCircle, 
  RefreshCw, Plus, Save, X, Eye, EyeOff, Tag
} from 'lucide-react';
import { Button } from '../../components/ui';
import EmptyState from '../../components/common/EmptyState';
import { API_BASE, formatApiError } from '../../config/api';

export default function AdminCategoriesPage({
  currentUser,
  showToast
}) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form State (Thêm / Sửa danh mục chuẩn Wireframe WF-A07)
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formName, setFormName] = useState('');
  const [formParentId, setFormParentId] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Categories
  const fetchCategories = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const headers = { Authorization: `Bearer ${currentUser?.token}` };
      const res = await fetch(`${API_BASE}/admin/categories`, { headers });
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        throw new Error(data.message || 'Không thể tải danh mục');
      }
    } catch (err) {
      console.error('Lỗi tải danh mục ngành nghề:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi tải danh mục ngành nghề'), 'error');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentUser]);

  // Open Form to Add
  const handleOpenAdd = () => {
    setIsEditing(true);
    setEditingId(null);
    setFormName('');
    setFormParentId('');
    setFormIsActive(true);
  };

  // Open Form to Edit
  const handleOpenEdit = (cat) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setFormName(cat.name || '');
    setFormParentId(cat.parent_id ? String(cat.parent_id) : '');
    setFormIsActive(cat.is_active !== false);
  };

  // Reset Form
  const handleCancelForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormName('');
    setFormParentId('');
  };

  // Save Category (POST or PUT)
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      if (showToast) showToast('Vui lòng nhập tên danh mục', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const headers = { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser?.token}` 
      };

      const payload = {
        name: formName.trim(),
        parent_id: formParentId ? parseInt(formParentId, 10) : null,
        is_active: formIsActive
      };

      let res;
      if (editingId) {
        res = await fetch(`${API_BASE}/admin/categories/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${API_BASE}/admin/categories`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Thao tác lưu danh mục thất bại');
      }

      if (showToast) {
        showToast(editingId ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới', 'success');
      }

      handleCancelForm();
      fetchCategories();
    } catch (err) {
      console.error('Lỗi lưu danh mục:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi lưu danh mục'), 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active or Delete Category
  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${catName}"?`)) return;

    try {
      const headers = { Authorization: `Bearer ${currentUser?.token}` };
      const res = await fetch(`${API_BASE}/admin/categories/${catId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Xóa danh mục thất bại');
      }

      if (showToast) showToast(`Đã xóa danh mục: ${catName}`, 'success');
      fetchCategories();
    } catch (err) {
      console.error('Lỗi xóa danh mục:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi xóa danh mục'), 'error');
      }
    }
  };

  // Toggle Ẩn / Hiện nhanh (WF-A07 "Ẩn")
  const handleToggleHide = async (cat) => {
    try {
      const headers = { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentUser?.token}` 
      };
      const res = await fetch(`${API_BASE}/admin/categories/${cat.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ is_active: !cat.is_active })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Cập nhật trạng thái thất bại');
      }

      if (showToast) {
        showToast(`Đã ${cat.is_active ? 'ẩn' : 'kích hoạt'} danh mục "${cat.name}"`, 'success');
      }
      fetchCategories();
    } catch (err) {
      console.error('Lỗi toggle ẩn:', err);
      if (showToast) {
        showToast(formatApiError(err, 'Lỗi thao tác'), 'error');
      }
    }
  };

  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              background: '#FEE2E2',
              color: '#B91C1C',
              fontSize: 11.5,
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: 6,
              textTransform: 'uppercase'
            }}>
              WF-A07
            </span>
            <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              QUẢN TRỊ DANH MỤC NGÀNH NGHỀ
            </span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
            Quản lý Danh mục ngành nghề (Category Management)
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="secondary"
            onClick={() => fetchCategories(true)}
            disabled={refreshing}
            style={{ padding: '8px 16px', fontSize: 13, gap: 6 }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới ({categories.length})</span>
          </Button>

          {!isEditing && (
            <Button
              variant="primary"
              onClick={handleOpenAdd}
              style={{ padding: '8px 18px', fontSize: 13, gap: 6 }}
            >
              <Plus size={15} />
              <span>+ Thêm ngành nghề</span>
            </Button>
          )}
        </div>
      </div>

      {/* ================= KHUNG THÊM / SỬA (CHUẨN WIREFRAME WF-A07) ================= */}
      {isEditing && (
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '2px solid #000000',
          padding: 24,
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {editingId ? 'Sửa danh mục ngành nghề' : 'Thêm mới danh mục ngành nghề'} (Thêm / Sửa)
            </h3>
            <button
              type="button"
              onClick={handleCancelForm}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveCategory} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, alignItems: 'end' }}>
            {/* Tên danh mục */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                Tên danh mục: <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="VD: Công nghệ thông tin, Thiết kế đồ họa..."
                required
                style={{
                  width: '100%',
                  height: 38,
                  borderRadius: 8,
                  border: '1.5px solid #000000',
                  padding: '0 12px',
                  fontSize: 13.5,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Danh mục cha */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>
                Danh mục cha (Parent category):
              </label>
              <select
                value={formParentId}
                onChange={(e) => setFormParentId(e.target.value)}
                style={{
                  width: '100%',
                  height: 38,
                  borderRadius: 8,
                  border: '1.5px solid #CBD5E1',
                  padding: '0 10px',
                  fontSize: 13,
                  fontWeight: 600,
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">-- Là danh mục gốc (Không có cha) --</option>
                {categories
                  .filter(c => c.id !== editingId && !c.parent_id)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Trạng thái Active */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', height: 38 }}>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#059669', cursor: 'pointer' }}
                />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                  Kích hoạt công khai (Active)
                </span>
              </label>
            </div>

            {/* Action buttons (Lưu, Ẩn, Hủy) */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  height: 38,
                  padding: '0 20px',
                  borderRadius: 8,
                  border: '1.5px solid #000000',
                  background: '#0F172A',
                  color: '#ffffff',
                  fontSize: 13.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Save size={15} />
                <span>{submitting ? 'Đang lưu...' : 'Lưu'}</span>
              </button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelForm}
                style={{ height: 38, padding: '0 16px', fontSize: 13 }}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ================= BẢNG DANH MỤC (CHUẨN WIREFRAME WF-A07: ID | Tên | Cha | Active | Số tin | Thao tác) ================= */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1.5px solid #000000',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Đang tải danh sách ngành nghề...</div>
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            title="Chưa có danh mục ngành nghề nào"
            description="Hãy bấm nút '+ Thêm ngành nghề' để tạo ngành nghề việc làm đầu tiên."
            actionLabel="+ Thêm ngành nghề ngay"
            onAction={handleOpenAdd}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1.5px solid #000000', fontSize: 12.5, fontWeight: 800, color: '#0F172A' }}>
                  <th style={{ padding: '14px 16px', width: 60 }}>ID</th>
                  <th style={{ padding: '14px 16px' }}>Tên danh mục (Tên)</th>
                  <th style={{ padding: '14px 16px', width: 200 }}>Danh mục cha (Cha)</th>
                  <th style={{ padding: '14px 16px', width: 140 }}>Số tin tuyển dụng</th>
                  <th style={{ padding: '14px 16px', width: 130 }}>Active</th>
                  <th style={{ padding: '14px 16px', width: 180, textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const isActive = cat.is_active !== false;

                  return (
                    <tr key={cat.id} style={{ borderBottom: '1px solid #E2E8F0', opacity: isActive ? 1 : 0.65 }}>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#64748B' }}>
                        #{cat.id}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Tag size={14} color="#4F46E5" />
                          <span>{cat.name}</span>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {cat.parent_name ? (
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: 4,
                            background: '#F1F5F9',
                            fontSize: 12,
                            fontWeight: 600,
                            border: '1px solid #CBD5E1'
                          }}>
                            {cat.parent_name}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8', fontSize: 12 }}>— (Gốc)</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#059669' }}>
                        {cat.job_count || 0} tin
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 8px',
                          borderRadius: 14,
                          fontSize: 11.5,
                          fontWeight: 800,
                          background: isActive ? '#DCFCE7' : '#F1F5F9',
                          color: isActive ? '#15803D' : '#64748B',
                          border: `1px solid ${isActive ? '#86EFAC' : '#CBD5E1'}`
                        }}>
                          {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {isActive ? 'Có (Active)' : 'Ẩn (Hidden)'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {/* Nút Sửa */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #000000',
                              background: '#ffffff',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="Sửa danh mục"
                          >
                            <Edit3 size={13} />
                            <span>Sửa</span>
                          </button>

                          {/* Nút Ẩn / Hiện (WF-A07 "Ẩn") */}
                          <button
                            type="button"
                            onClick={() => handleToggleHide(cat)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #CBD5E1',
                              background: '#F8FAFC',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              color: isActive ? '#B45309' : '#059669'
                            }}
                            title={isActive ? 'Ẩn khỏi thị trường' : 'Kích hoạt lại'}
                          >
                            {isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                            <span>{isActive ? 'Ẩn' : 'Hiện'}</span>
                          </button>

                          {/* Nút Xóa */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: 6,
                              border: '1px solid #FCA5A5',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="Xóa danh mục"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note Box matching WF-A07 Wireframe 100% */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 8,
        border: '1.5px dashed #CBD5E1',
        background: '#F8FAFC',
        fontSize: 13,
        color: '#64748B',
        lineHeight: 1.5
      }}>
        Trạng thái UI / TBD: API-D8, G-46, S5 TBD.
      </div>
    </div>
  );
}

