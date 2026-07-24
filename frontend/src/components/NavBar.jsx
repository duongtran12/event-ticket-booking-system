export function NavBar({
  activePage,
  onNavigate,
  isAuthenticated,
  isAdmin,
  userEmail,
  onLogout,
  keyword,
  onKeywordChange,
  onSearch
}) {
  return (
    <header
      style={{
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '0 24px',
          height: '72px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}
      >
        {/* BRAND LOGO */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexShrink: 0
          }}
        >
          <div
            onClick={() => onNavigate('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffffff',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)'
              }}
            >
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                TICKETBOX
              </span>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                Nền tảng vé sự kiện
              </span>
            </div>
          </div>

          {/* ADMIN SHORTCUT BUTTON */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              style={{
                padding: '6px 12px',
                background: activePage === 'admin' ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                color: activePage === 'admin' ? '#60a5fa' : '#cbd5e1',
                border: activePage === 'admin' ? '1px solid rgba(96, 165, 250, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>Quản trị</span>
            </button>
          )}
        </div>

        {/* TOPBAR SEARCH */}
        <form
          onSubmit={onSearch}
          style={{
            flex: '1',
            maxWidth: '460px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <input
            type="search"
            placeholder="Tìm theo tên sự kiện, ca sĩ, địa điểm..."
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            style={{
              width: '100%',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '999px',
              padding: '9px 16px 9px 40px',
              color: '#ffffff',
              fontSize: '13.5px',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#334155';
              e.target.style.boxShadow = 'none';
            }}
          />
          {/* Search Icon SVG */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </form>

        {/* NAVIGATION LINKS & USER PROFILE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            style={getNavStyle(activePage === 'home')}
          >
            Trang chủ
          </button>

          <button
            type="button"
            onClick={() => onNavigate('bookings')}
            style={getNavStyle(activePage === 'bookings')}
          >
            Vé của tôi
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              style={getNavStyle(activePage === 'profile')}
            >
              Hồ sơ
            </button>
          )}

          <div style={{ width: '1px', height: '24px', background: '#334155', margin: '0 4px' }} />

          {!isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                style={getNavStyle(activePage === 'login')}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
                onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
              >
                Đăng ký
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {userEmail && (
                <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: '500' }}>
                  {userEmail.split('@')[0]}
                </span>
              )}
              <button
                type="button"
                onClick={onLogout}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  background: 'transparent',
                  color: '#94a3b8',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.borderColor = '#ef4444';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.borderColor = '#334155';
                }}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const getNavStyle = (isActive) => ({
  padding: '8px 16px',
  borderRadius: '999px',
  border: 'none',
  background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
  color: isActive ? '#ffffff' : '#94a3b8',
  fontSize: '13.5px',
  fontWeight: isActive ? '700' : '500',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap'
});