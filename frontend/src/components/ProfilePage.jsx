export function ProfilePage({ profile, isAdmin, onGoAdmin, onEdit }) {
  if (!profile) {
    return (
      <section
        className="form-panel"
        style={{
          width: '100%',
          maxWidth: '500px',
          margin: '40px auto',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div
          className="message-panel"
          style={{
            padding: '20px',
            textAlign: 'center',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            color: '#64748b',
            fontWeight: '600'
          }}
        >
          Vui lòng đăng nhập để xem thông tin tài khoản.
        </div>
      </section>
    );
  }

  return (
    <section
      className="profile-page"
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="profile-container"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px'
        }}
      >
        {/* Phần đầu: Ảnh đại diện tròn và Tiêu đề hồ sơ */}
        <div
          className="profile-header-block"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '24px'
          }}
        >
          <div
            className="avatar-wrapper"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              background: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #e2e8f0',
              flexShrink: 0
            }}
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: '32px' }}>👤</span>
            )}
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#0f172a' }}>
              Hồ sơ của bạn
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>
              Quản lý thông tin cá nhân
            </p>
          </div>
        </div>

        {/* Phần thân: Lưới thông tin chi tiết */}
        <div
          className="profile-card-detail"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}
        >
          <div style={infoBoxStyle}>
            <span style={labelStyle}>Họ và tên</span>
            <strong style={valueStyle}>{profile.fullName}</strong>
          </div>
          <div style={infoBoxStyle}>
            <span style={labelStyle}>Email</span>
            <strong style={valueStyle}>{profile.email}</strong>
          </div>
          <div style={infoBoxStyle}>
            <span style={labelStyle}>Số điện thoại</span>
            <strong style={valueStyle}>{profile.phone || 'Chưa cập nhật'}</strong>
          </div>
          <div style={infoBoxStyle}>
            <span style={labelStyle}>CCCD</span>
            <strong style={valueStyle}>{profile.cccd || 'Chưa cập nhật'}</strong>
          </div>
          <div style={infoBoxStyle}>
            <span style={labelStyle}>Tuổi</span>
            <strong style={valueStyle}>{profile.age || 'Chưa cập nhật'}</strong>
          </div>
          <div style={infoBoxStyle}>
            <span style={labelStyle}>Giới tính</span>
            <strong style={valueStyle}>{profile.gender || 'Chưa cập nhật'}</strong>
          </div>
        </div>

        {/* Phần cuối: Nút hành động */}
        <div
          className="profile-actions"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '8px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '20px'
          }}
        >
          {isAdmin && (
            <button
              type="button"
              className="secondary"
              onClick={onGoAdmin}
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
              ⚙️ Đi đến trang Admin
            </button>
          )}

          <button
            type="button"
            onClick={onEdit}
            style={{
              padding: '10px 20px',
              background: '#006af5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#0056c6'}
            onMouseOut={(e) => e.currentTarget.style.background = '#006af5'}
          >
            Chỉnh sửa thông tin
          </button>
        </div>
      </div>
    </section>
  );
}

// Các hằng số định dạng Style cho lưới thông tin
const infoBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  background: '#f8fafc',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1px solid #f1f5f9'
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const valueStyle = {
  fontSize: '14px',
  color: '#334155',
  fontWeight: '600'
};