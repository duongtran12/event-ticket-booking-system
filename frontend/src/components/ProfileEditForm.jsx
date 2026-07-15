import { useState } from 'react';

export function ProfileEditForm({ profile, onSave, loading, onCancel }) {
  const [form, setForm] = useState({
    fullName: profile.fullName || '',
    phone: profile.phone || '',
    cccd: profile.cccd || '',
    age: profile.age || '',
    gender: profile.gender || '',
    avatarUrl: profile.avatarUrl || '',
  });

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div
      className="form-card"
      style={{
        width: '100%',
        maxWidth: '650px',
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
        border: '1px solid #f1f5f9',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
          📝 Cập nhật hồ sơ
        </h2>
        <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#64748b' }}>
          Cập nhập thông tin của bạn
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form);
        }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px'
        }}
      >
        {/* Họ và tên - Full chiều rộng */}
        <div style={{ gridColumn: '1 / -1', ...fieldContainerStyle }}>
          <label style={labelStyle}>Họ và tên <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            value={form.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            type="text"
            placeholder="Nguyễn Văn A"
            required
            style={inputStyle}
          />
        </div>

        {/* Số điện thoại */}
        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Số điện thoại</label>
          <input
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            type="tel"
            placeholder="0123 456 789"
            style={inputStyle}
          />
        </div>

        {/* Số CCCD */}
        <div style={fieldContainerStyle}>
          <label style={labelStyle}>CCCD</label>
          <input
            value={form.cccd}
            onChange={(e) => handleChange('cccd', e.target.value)}
            type="text"
            placeholder="012345678901"
            style={inputStyle}
          />
        </div>

        {/* Tuổi */}
        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Tuổi</label>
          <input
            value={form.age}
            onChange={(e) => handleChange('age', e.target.value)}
            type="number"
            min="1"
            placeholder="30"
            style={inputStyle}
          />
        </div>

        {/* Giới tính */}
        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Giới tính</label>
          <select
            value={form.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            style={{ ...inputStyle, height: '42px', backgroundColor: '#ffffff' }}
          >
            <option value="">Chọn giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        {/* Ảnh đại diện URL - Full chiều rộng */}
        <div style={{ gridColumn: '1 / -1', ...fieldContainerStyle }}>
          <label style={labelStyle}>Ảnh đại diện (URL)</label>
          <input
            value={form.avatarUrl}
            onChange={(e) => handleChange('avatarUrl', e.target.value)}
            type="url"
            placeholder="https://..."
            style={inputStyle}
          />
        </div>

        {/* Nhóm nút hành động - Đẩy sang góc phải dưới */}
        <div
          className="profile-actions"
          style={{
            gridColumn: '1 / -1',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '12px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '20px'
          }}
        >
          <button
            type="button"
            className="secondary"
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              color: '#475569',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
            onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#cbd5e1' : '#006af5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.background = '#0056c6';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.background = '#006af5';
            }}
          >
            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Các object style bổ trợ tái sử dụng
const fieldContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle = {
  fontSize: '12.5px',
  fontWeight: '600',
  color: '#475569'
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#334155',
  transition: 'border-color 0.2s'
};