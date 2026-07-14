export function ProfilePage({ profile, isAdmin, onGoAdmin }) {
  if (!profile) {
    return (
      <section className="form-panel">
        <div className="message-panel">Vui lòng đăng nhập để xem thông tin tài khoản.</div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-grid">
        <div className="profile-summary">
          <h2>Hồ sơ của bạn</h2>
          <p>Quản lý thông tin tài khoản và theo dõi trạng thái người dùng của bạn.</p>
          <div className="profile-card-detail">
            <div>
              <span>Họ và tên</span>
              <strong>{profile.fullName}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{profile.email}</strong>
            </div>
            <div>
              <span>Vai trò</span>
              <strong>{profile.role}</strong>
            </div>
          </div>
          <div className="profile-actions">
            <button type="button" disabled>
              Chỉnh sửa thông tin
            </button>
            {isAdmin && (
              <button type="button" className="secondary" onClick={onGoAdmin}>
                Đi đến trang Admin
              </button>
            )}
          </div>
        </div>

        <div className="profile-box">
          <div className="box-header">
            <h3>Thông tin nhanh</h3>
            <span>Chi tiết tài khoản của bạn</span>
          </div>
          <div className="box-content">
            <div className="box-item">
              <p className="box-label">Tài khoản</p>
              <strong>{profile.email}</strong>
            </div>
            <div className="box-item">
              <p className="box-label">Quyền hạn</p>
              <strong>{profile.role}</strong>
            </div>
            <div className="box-item">
              <p className="box-label">Trạng thái</p>
              <strong>Đang hoạt động</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
