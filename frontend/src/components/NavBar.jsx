export function NavBar({
  activePage,
  onNavigate,
  isAuthenticated,
  isAdmin,
  userEmail,
  onLogout,
  keyword,
  onKeywordChange,
  onSearch,
}) {
  const navClass = (page) => `site-nav-link ${activePage === page ? 'active' : ''}`;

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <button type="button" className="site-brand" onClick={() => onNavigate('home')} aria-label="Về trang chủ">
          <span className="site-brand-logo"><img src="/logo.png" alt="TicketBox" /></span>
          <span className="site-brand-copy">
            <strong>TICKETBOX</strong>
            <small>Chạm tới trải nghiệm</small>
          </span>
        </button>

        <form className="header-search" onSubmit={onSearch}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.7-3.7" />
          </svg>
          <input
            type="search"
            placeholder="Tìm sự kiện, nghệ sĩ, địa điểm..."
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
          />
          <button type="submit">Tìm</button>
        </form>

        <nav className="site-nav" aria-label="Điều hướng chính">
          <button type="button" className={navClass('home')} onClick={() => onNavigate('home')}>Trang chủ</button>
          <button type="button" className={navClass('bookings')} onClick={() => onNavigate('bookings')}>Vé của tôi</button>
          {isAuthenticated && (
            <button type="button" className={navClass('profile')} onClick={() => onNavigate('profile')}>Hồ sơ</button>
          )}
          {isAdmin && (
            <button type="button" className={navClass('admin')} onClick={() => onNavigate('admin')}>Quản trị</button>
          )}
        </nav>

        <div className="header-account">
          {!isAuthenticated ? (
            <>
              <button type="button" className="header-login" onClick={() => onNavigate('login')}>Đăng nhập</button>
              <button type="button" className="header-register" onClick={() => onNavigate('register')}>Đăng ký</button>
            </>
          ) : (
            <>
              <button type="button" className="account-chip" onClick={() => onNavigate('profile')} title={userEmail || 'Tài khoản'}>
                <span>{(userEmail || 'U').charAt(0).toUpperCase()}</span>
                <small>{userEmail ? userEmail.split('@')[0] : 'Tài khoản'}</small>
              </button>
              <button type="button" className="header-logout" onClick={onLogout} aria-label="Đăng xuất">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></svg>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
