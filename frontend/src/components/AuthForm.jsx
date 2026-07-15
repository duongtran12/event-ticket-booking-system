export function AuthForm({ mode, values, onChange, onSubmit, loading }) {
  return (
    <div
      className="form-card"
      style={{
        width: '100%',
        maxWidth: mode === 'login' ? '420px' : '650px',
        margin: '40px auto',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
        border: '1px solid #f1f5f9',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box',
        transition: 'max-width 0.2s ease'
      }}
    >
      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
          {mode === 'login' ? '🔑 Đăng nhập' : '📝 Đăng ký tài khoản'}
        </h2>
        <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#64748b', lineHeight: '1.4' }}>
          {mode === 'login' ? 'Nhập email và mật khẩu để tiếp tục.' : 'Tạo tài khoản mới để quản lý đặt vé.'}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          display: 'grid',
          gridTemplateColumns: mode === 'login' ? '1fr' : 'repeat(2, 1fr)',
          gap: '18px'
        }}
      >
        {mode === 'register' && (
          <>
            <div style={{ gridColumn: '1 / -1', ...fieldContainerStyle }}>
              <label style={labelStyle}>Họ và tên <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                value={values.fullName}
                onChange={(e) => onChange('fullName', e.target.value)}
                type="text"
                placeholder="Nguyễn Văn A"
                required
                style={inputStyle}
              />
            </div>

            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Số điện thoại</label>
              <input
                value={values.phone || ''}
                onChange={(e) => onChange('phone', e.target.value)}
                type="tel"
                placeholder="0123 456 789"
                style={inputStyle}
              />
            </div>

            <div style={fieldContainerStyle}>
              <label style={labelStyle}>CCCD</label>
              <input
                value={values.cccd || ''}
                onChange={(e) => onChange('cccd', e.target.value)}
                type="text"
                placeholder="012345678901"
                style={inputStyle}
              />
            </div>

            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Tuổi</label>
              <input
                value={values.age || ''}
                onChange={(e) => onChange('age', e.target.value)}
                type="number"
                min="1"
                placeholder="30"
                style={inputStyle}
              />
            </div>

            <div style={fieldContainerStyle}>
              <label style={labelStyle}>Giới tính</label>
              <select
                value={values.gender || ''}
                onChange={(e) => onChange('gender', e.target.value)}
                style={{ ...inputStyle, height: '42px', backgroundColor: '#ffffff' }}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', ...fieldContainerStyle }}>
              <label style={labelStyle}>Ảnh đại diện (URL)</label>
              <input
                value={values.avatarUrl || ''}
                onChange={(e) => onChange('avatarUrl', e.target.value)}
                type="url"
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          </>
        )}

        <div style={{ gridColumn: mode === 'login' ? 'auto' : '1 / -1', ...fieldContainerStyle }}>
          <label style={labelStyle}>Email <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            value={values.email}
            onChange={(e) => onChange('email', e.target.value)}
            type="email"
            placeholder="email@example.com"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ gridColumn: mode === 'login' ? 'auto' : '1 / -1', ...fieldContainerStyle }}>
          <label style={labelStyle}>Mật khẩu <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            value={values.password}
            onChange={(e) => onChange('password', e.target.value)}
            type="password"
            placeholder="Ít nhất 8 ký tự"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '44px',
              background: loading ? '#cbd5e1' : '#006af5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.background = '#0056c6';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.background = '#006af5';
            }}
          >
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập ngay' : 'Đăng ký tài khoản'}
          </button>
        </div>
      </form>
    </div>
  );
}

const fieldContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle = {
  fontSize: '13px',
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