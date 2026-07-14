export function UserProfile({ profile }) {
  if (!profile) {
    return null;
  }

  return (
    <div className="profile-card">
      <h2>Thông tin tài khoản</h2>
      <div className="profile-details">
        <span>
          <strong>Họ và tên</strong>
          <p>{profile.fullName}</p>
        </span>
        <span>
          <strong>Email</strong>
          <p>{profile.email}</p>
        </span>
        <span>
          <strong>Vai trò</strong>
          <p>{profile.role}</p>
        </span>
      </div>
    </div>
  );
}
