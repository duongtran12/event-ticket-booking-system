export function NavBar({ activePage, onNavigate, isAuthenticated, isAdmin, userEmail, onLogout, keyword, onKeywordChange, onSearch }) {
  return (
    <nav
      className="topbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        color: '#ffffff',
        gap: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box',
        minHeight: '70px'
      }}
    >
      {/* Cụm 1: Brand Logo & Nút Quản lý nhanh */}
      <div
        className="brand-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexShrink: 0
        }}
      >
        <div
          className="brand"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
          onClick={() => onNavigate('home')}
        >
          <div
            className="brand-mark"
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '18px'
            }}
          >
            ET
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontSize: '16px', lineHeight: '1.2' }}>Event Ticket</strong>
            <span style={{ fontSize: '11px', opacity: 0.85, marginTop: '2px' }}>Đặt vé sự kiện dễ dàng</span>
          </div>
        </div>

        {/* Nút Admin chuyển hẳn sang đây nếu là Admin */}
        {isAdmin && (
          <button
            type="button"
            className={activePage === 'admin' ? 'active' : ''}
            onClick={() => onNavigate('admin')}
            style={{
              padding: '6px 12px',
              background: activePage === 'admin' ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
              color: activePage === 'admin' ? '#059669' : '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ⚙️ Quản lý
          </button>
        )}
      </div>

      {/* Cụm 2: Form Tìm kiếm (Căn giữa, co giãn thông minh) */}
      <form
        className="topbar-search"
        onSubmit={onSearch}
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: '1',
          maxWidth: '450px',
          background: 'rgba(255, 255, 255, 0.15)',
          borderRadius: '50px',
          padding: '2px 4px 2px 16px',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxSizing: 'border-box'
        }}
      >
        <input
          type="search"
          placeholder="Bạn tìm gì hôm nay?"
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#ffffff',
            fontSize: '14px',
            height: '36px'
          }}
        />
        <button
          type="submit"
          style={{
            background: '#ffffff',
            color: '#059669',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '50px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          Tìm kiếm
        </button>
      </form>

      {/* Cụm 3: Các nút điều hướng Menu chính */}
      <div
        className="nav-actions"
        role="navigation"
        aria-label="Main navigation"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0
        }}
      >
        <button
          className={activePage === 'home' ? 'active' : ''}
          onClick={() => onNavigate('home')}
          style={getNavButtonStyle(activePage === 'home')}
        >
          Trang chủ
        </button>
        <button
          className={activePage === 'bookings' ? 'active' : ''}
          onClick={() => onNavigate('bookings')}
          style={getNavButtonStyle(activePage === 'bookings')}
        >
          Vé của tôi
        </button>
        {isAuthenticated && (
          <button
            className={activePage === 'profile' ? 'active' : ''}
            onClick={() => onNavigate('profile')}
            style={getNavButtonStyle(activePage === 'profile')}
          >
            Hồ sơ
          </button>
        )}

        {/* Phân tách Trạng thái Auth (Đăng nhập / Đăng xuất) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '14px' }}>
          {!isAuthenticated ? (
            <>
              <button
                className={activePage === 'login' ? 'active' : ''}
                onClick={() => onNavigate('login')}
                style={getNavButtonStyle(activePage === 'login')}
              >
                Đăng nhập
              </button>
              <button
                className={activePage === 'register' ? 'active' : ''}
                onClick={() => onNavigate('register')}
                style={{
                  ...getNavButtonStyle(activePage === 'register'),
                  background: '#ffffff',
                  color: '#059669',
                  fontWeight: '700'
                }}
              >
                Đăng ký
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {userEmail && (
                <span style={{ fontSize: '12px', opacity: 0.9, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userEmail}
                </span>
              )}
              <button
                onClick={onLogout}
                style={{
                  ...getNavButtonStyle(false),
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#fca5a5'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.color = '#fca5a5';
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Hàm bổ trợ xác định CSS cho các nút điều hướng
const getNavButtonStyle = (isActive) => ({
  padding: '8px 16px',
  background: isActive ? '#ffffff' : 'transparent',
  color: isActive ? '#059669' : '#ffffff',
  border: 'none',
  borderRadius: '50px',
  fontSize: '13.5px',
  fontWeight: isActive ? '700' : '500',
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap'
});