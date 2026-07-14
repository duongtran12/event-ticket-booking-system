export function AuthForm({ mode, values, onChange, onSubmit, loading }) {
  return (
    <div className="form-card">
      <h2>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h2>
      <p>{mode === 'login' ? 'Nhập email và mật khẩu để tiếp tục.' : 'Tạo tài khoản mới để quản lý đặt vé.'}</p>
      <form onSubmit={onSubmit}>
        {mode === 'register' && (
          <label>
            Họ và tên
            <input
              value={values.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              type="text"
              placeholder="Nguyễn Văn A"
              required
            />
          </label>
        )}
        <label>
          Email
          <input
            value={values.email}
            onChange={(e) => onChange('email', e.target.value)}
            type="email"
            placeholder="email@example.com"
            required
          />
        </label>
        <label>
          Mật khẩu
          <input
            value={values.password}
            onChange={(e) => onChange('password', e.target.value)}
            type="password"
            placeholder="Ít nhất 8 ký tự"
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </button>
      </form>
    </div>
  );
}
