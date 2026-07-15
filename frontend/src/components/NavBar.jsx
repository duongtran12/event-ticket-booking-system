export function NavBar({ activePage, onNavigate, isAuthenticated, isAdmin, userEmail, onLogout, keyword, onKeywordChange, onSearch }) {
  return (
    <nav className="topbar">
      <div className="brand">
        <div className="brand-mark">ET</div>
        <div>
          <strong>Event Ticket</strong>
          <span>Đặt vé sự kiện dễ dàng</span>
        </div>
      </div>

      <form className="topbar-search" onSubmit={onSearch}>
        <input
          type="search"
          placeholder="Bạn tìm gì hôm nay?"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
        />
        <button type="submit">Tìm kiếm</button>
      </form>

      <div className="nav-actions" role="navigation" aria-label="Main navigation">
        <button className={activePage === 'home' ? 'active' : ''} onClick={() => onNavigate('home')}>
          Trang chủ
        </button>
        <button className={activePage === 'bookings' ? 'active' : ''} onClick={() => onNavigate('bookings')}>
          Vé của tôi
        </button>
        {isAuthenticated && (
          <button className={activePage === 'profile' ? 'active' : ''} onClick={() => onNavigate('profile')}>
            Tài khoản
          </button>
        )}
        {isAdmin && (
          <button className={activePage === 'admin' ? 'active' : ''} onClick={() => onNavigate('admin')}>
            Quản lí
          </button>
        )}
        {!isAuthenticated ? (
          <>
            <button className={activePage === 'login' ? 'active' : ''} onClick={() => onNavigate('login')}>
              Đăng nhập
            </button>
            <button className={activePage === 'register' ? 'active' : ''} onClick={() => onNavigate('register')}>
              Đăng ký
            </button>
          </>
        ) : (
          <button onClick={onLogout}>Đăng xuất</button>
        )}
      </div>
      {!isAuthenticated && (
        <div className="nav-status">Bạn chưa đăng nhập</div>
      )}
    </nav>
  );
}
