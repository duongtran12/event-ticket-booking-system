import { useEffect, useState } from 'react';
import { NavBar } from './components/NavBar';
import { EventCard } from './components/EventCard';
import { BookingCard } from './components/BookingCard';
import { AuthForm } from './components/AuthForm';
import { AdminForm } from './components/AdminForm';
import { ProfilePage } from './components/ProfilePage';
import { ProfileEditForm } from './components/ProfileEditForm';
import { completePayment, createBooking, createEvent, createPayment, cancelBooking, deleteEvent, getAdminStats, getBookings, getEvents, getUserProfile, loginUser, registerUser, updateEvent, updateUserProfile } from './api';

const PAGES = {
  HOME: 'home',
  LOGIN: 'login',
  REGISTER: 'register',
  BOOKINGS: 'bookings',
  PROFILE: 'profile',
  ADMIN: 'admin',
};

function App() {
  const [activePage, setActivePage] = useState(PAGES.HOME);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEventsCount, setTotalEventsCount] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState('dateTime,asc');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [bookingQuantities, setBookingQuantities] = useState({});
  const [token, setToken] = useState(localStorage.getItem('jwtToken') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
  const [profile, setProfile] = useState(null);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [authValues, setAuthValues] = useState({ fullName: '', email: '', password: '', phone: '', cccd: '', age: '', gender: '', avatarUrl: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [adminValues, setAdminValues] = useState({
    title: '',
    description: '',
    location: '',
    imageUrl: '',
    dateTime: '',
    price: '',
    totalTickets: '',
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [savedEventIds, setSavedEventIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('savedEventIds') || '[]');
    } catch {
      return [];
    }
  });
  const [bookingsView, setBookingsView] = useState('history');

  const isAuthenticated = !!token;
  const isAdmin = userRole === 'ROLE_ADMIN';

  useEffect(() => {
    if (token) {
      loadProfile(token);
    }
  }, [token]);

  useEffect(() => {
    fetchEvents();
  }, [page, sort]);

  useEffect(() => {
    if (activePage === PAGES.BOOKINGS && isAuthenticated) {
      fetchBookings();
    }
    if (activePage === PAGES.ADMIN && isAdmin) {
      fetchAdminStats();
    }
  }, [activePage, isAuthenticated, isAdmin]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const data = await getEvents({ page, size: 12, sort, keyword });
      setEvents(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalEventsCount(data.totalElements || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setError(null);
    setMessage(null);

    try {
      const data = await getBookings(token);
      setBookings(data.content || []);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setError(null);
    setMessage(null);

    try {
      const data = await loginUser(authValues.email, authValues.password);
      localStorage.setItem('jwtToken', data.token);
      localStorage.setItem('userEmail', authValues.email);
      setToken(data.token);
      setUserEmail(authValues.email);
      await loadProfile(data.token);
      setAuthValues({ fullName: '', email: '', password: '', phone: '', cccd: '', age: '', gender: '', avatarUrl: '' });
      setMessage('Đăng nhập thành công!');
      setActivePage(PAGES.HOME);
    } catch (e) {
      setError(e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        ...authValues,
        age: authValues.age ? Number(authValues.age) : null,
      };
      await registerUser(payload);
      setAuthValues({ fullName: '', email: '', password: '', phone: '', cccd: '', age: '', gender: '', avatarUrl: '' });
      setMessage('Đăng ký thành công! Vui lòng đăng nhập.');
      setActivePage(PAGES.LOGIN);
    } catch (e) {
      setError(e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    setAdminLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        title: adminValues.title,
        description: adminValues.description,
        location: adminValues.location,
        imageUrl: adminValues.imageUrl,
        dateTime: adminValues.dateTime,
        price: Number(adminValues.price),
        totalTickets: Number(adminValues.totalTickets),
      };
      await createEvent(token, payload);
      setAdminValues({ title: '', description: '', location: '', imageUrl: '', dateTime: '', price: '', totalTickets: '' });
      setMessage('Sự kiện mới đã được tạo thành công.');
      setActivePage(PAGES.HOME);
      fetchEvents();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleEditEvent = (eventData) => {
    setEditMode(true);
    setSelectedEvent(eventData);
    setAdminValues({
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      imageUrl: eventData.imageUrl || '',
      dateTime: eventData.dateTime,
      price: eventData.price,
      totalTickets: eventData.totalTickets,
    });
    setActivePage(PAGES.ADMIN);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedEvent(null);
    setAdminValues({ title: '', description: '', location: '', imageUrl: '', dateTime: '', price: '', totalTickets: '' });
  };

  const handleSaveEvent = async (event) => {
    event.preventDefault();
    setAdminLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        title: adminValues.title,
        description: adminValues.description,
        location: adminValues.location,
        imageUrl: adminValues.imageUrl,
        dateTime: adminValues.dateTime,
        price: Number(adminValues.price),
        totalTickets: Number(adminValues.totalTickets),
      };

      if (selectedEvent) {
        await updateEvent(token, selectedEvent.id, payload);
        setMessage('Sự kiện đã được cập nhật thành công.');
      } else {
        await createEvent(token, payload);
        setMessage('Sự kiện mới đã được tạo thành công.');
      }

      handleCancelEdit();
      setActivePage(PAGES.HOME);
      fetchEvents();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    setError(null);
    setMessage(null);

    try {
      await deleteEvent(token, eventId);
      setMessage('Sự kiện đã được xóa thành công.');
      fetchEvents();
      if (activePage === PAGES.ADMIN && isAdmin) {
        fetchAdminStats();
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchAdminStats = async () => {
    if (!isAdmin || !token) {
      return;
    }

    try {
      const data = await getAdminStats(token);
      setAdminStats(data);
    } catch (e) {
      console.error('Không thể tải thống kê admin', e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setToken('');
    setUserEmail('');
    setUserRole('');
    setProfile(null);
    setMessage('Bạn đã đăng xuất.');
    setActivePage(PAGES.HOME);
  };

  const loadProfile = async (jwt) => {
    try {
      const data = await getUserProfile(jwt);
      setProfile(data);
      setUserRole(data.role);
      localStorage.setItem('userRole', data.role);
    } catch (e) {
      console.error('Không thể lấy profile user', e);
    }
  };

  const handleUpdateProfile = async (profileData) => {
    setAuthLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        ...profileData,
        age: profileData.age ? Number(profileData.age) : null,
      };
      const updated = await updateUserProfile(token, payload);
      setProfile(updated);
      setMessage('Cập nhật hồ sơ thành công.');
      setProfileEditMode(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleBookTicket = async (eventId) => {
    if (!isAuthenticated) {
      setError('Bạn cần đăng nhập để đặt vé.');
      setActivePage(PAGES.LOGIN);
      return;
    }

    const quantity = bookingQuantities[eventId] || 1;
    setError(null);
    setMessage(null);

    try {
      const booking = await createBooking(token, eventId, quantity);
      setMessage(`Đã giữ chỗ vé cho ${booking.eventTitle}. Vui lòng thanh toán để hoàn tất.`);
      setBookingQuantities((current) => ({ ...current, [eventId]: 1 }));
      if (activePage === PAGES.BOOKINGS) {
        fetchBookings();
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!isAuthenticated) {
      setError('Bạn cần đăng nhập để hủy vé.');
      setActivePage(PAGES.LOGIN);
      return;
    }

    const reason = window.prompt('Nhập lý do hủy vé (tùy chọn):', 'Hủy vì thay đổi kế hoạch');
    if (reason === null) {
      return;
    }

    setError(null);
    setMessage(null);

    try {
      await cancelBooking(token, bookingId, reason.trim() || 'Hủy bởi người dùng');
      setMessage('Vé đã được hủy và trả về pool vé khả dụng.');
      fetchBookings();
      if (activePage === PAGES.HOME) {
        fetchEvents();
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleToggleSaveEvent = (eventId) => {
    setSavedEventIds((current) => {
      const next = current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId];
      localStorage.setItem('savedEventIds', JSON.stringify(next));
      return next;
    });
  };

  const handlePayBooking = async (bookingId) => {
    if (!isAuthenticated) {
      setError('Bạn cần đăng nhập để thanh toán.');
      setActivePage(PAGES.LOGIN);
      return;
    }

    try {
      const data = await createPayment(token, bookingId);
      window.location.href = data.paymentUrl;
    } catch (e) {
      setError(e.message);
    }
  };

  const handlePaymentCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');
    const responseCode = params.get('vnp_ResponseCode');

    if (!bookingId) {
      return;
    }

    // Only complete payment when VNPAY returns success
    if (responseCode !== '00') {
      setMessage('Thanh toán không hoàn tất. Vé vẫn giữ chỗ và bạn có thể thử lại.');
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('bookingId');
        url.searchParams.delete('vnp_ResponseCode');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } catch (ignore) {}
      if (activePage === PAGES.BOOKINGS) {
        fetchBookings();
      }
      return;
    }

    try {
      await completePayment(token, bookingId);
      setMessage('Thanh toán thành công. Vé đã chuyển sang trạng thái SOLD.');
      if (activePage === PAGES.BOOKINGS) {
        fetchBookings();
      }
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('bookingId');
        url.searchParams.delete('vnp_ResponseCode');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } catch (ignore) {}
    } catch (e) {
      const msg = e.message || '';
      if (msg.includes('Only RESERVED bookings can be completed') || msg.includes('Current status: SOLD')) {
        setMessage('Thanh toán đã được xử lý trước đó.');
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('bookingId');
          url.searchParams.delete('vnp_ResponseCode');
          window.history.replaceState({}, document.title, url.pathname + url.search);
        } catch (ignore) {}
        if (activePage === PAGES.BOOKINGS) fetchBookings();
      } else {
        setError(msg || 'Đã có lỗi xảy ra khi xử lý thanh toán.');
      }
    }
  };

  useEffect(() => {
    if (window.location.search.includes('bookingId')) {
      handlePaymentCallback();
    }
  }, [token]);

  const handleQuantityChange = (eventId, quantity) => {
    setBookingQuantities((current) => ({ ...current, [eventId]: quantity }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setPage(0);
    await fetchEvents();
  };

  const updateAuthValues = (field, value) => {
    setAuthValues((current) => ({ ...current, [field]: value }));
  };

  const updateAdminValues = (field, value) => {
    setAdminValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="app-shell">
      <NavBar
        activePage={activePage}
        onNavigate={setActivePage}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        keyword={keyword}
        onKeywordChange={setKeyword}
        onSearch={handleSearch}
      />

      <main className="content">
        {(message || error) && (
          <div className={`alert ${message ? 'success' : 'danger'}`}>{message || error}</div>
        )}

        {activePage === PAGES.PROFILE && !profileEditMode && (
          <ProfilePage
            profile={profile}
            isAdmin={isAdmin}
            onGoAdmin={() => setActivePage(PAGES.ADMIN)}
            onEdit={() => setProfileEditMode(true)}
          />
        )}
        {activePage === PAGES.PROFILE && profileEditMode && (
          <ProfileEditForm
            profile={profile}
            onSave={handleUpdateProfile}
            loading={authLoading}
            onCancel={() => setProfileEditMode(false)}
          />
        )}

        {activePage === PAGES.HOME && (
          <section
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '40px 20px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            {/* Section 1: Hero Banner */}
            <div
              className="toolbar home-toolbar"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '24px',
                padding: '60px 40px',
                textAlign: 'center',
                color: '#ffffff',
                marginBottom: '32px',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div className="home-intro" style={{ position: 'relative', zIndex: 2 }}>
                <p
                  className="eyebrow"
                  style={{
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#38bdf8',
                    marginBottom: '12px',
                    marginTop: 0
                  }}
                >
                  Khám phá ngay
                </p>
                <h2
                  style={{
                    fontSize: '36px',
                    fontWeight: '800',
                    margin: '0 0 16px 0',
                    lineHeight: '1.2',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Đặt vé sự kiện HOT nhất
                </h2>
                <p
                  className="hero-description"
                  style={{
                    fontSize: '16px',
                    color: '#94a3b8',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: '1.6'
                  }}
                >
                  Tìm nhanh sự kiện bạn yêu thích, so sánh vé và hoàn tất đặt vé chỉ trong vài bước.
                </p>
              </div>

              {/* Background Decorative Blur Circles */}
              <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(56, 189, 248, 0.15)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
              <div style={{ position: 'absolute', bottom: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(99, 102, 241, 0.15)', borderRadius: '50%', filter: 'blur(40px)' }}></div>
            </div>

            {/* Section 2: Search & Filter Toolbar */}
            <div
              className="toolbar"
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                marginBottom: '40px'
              }}
            >
              {/* Search Bar */}
              <form
                className="search-form"
                onSubmit={handleSearch}
                style={{
                  display: 'flex',
                  gap: '12px',
                  width: '100%'
                }}
              >
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    placeholder="Bạn tìm gì hôm nay? (Tên sự kiện, địa điểm...)"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 44px',
                      fontSize: '15px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#006af5';
                      e.target.style.boxShadow = '0 0 0 4px rgba(0, 106, 245, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#cbd5e1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {/* Search Icon */}
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                    🔍
                  </span>
                </div>
                <button
                  type="submit"
                  style={{
                    padding: '14px 28px',
                    background: '#006af5',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#0056c6'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#006af5'}
                >
                  Tìm kiếm
                </button>
              </form>

              {/* Sort and Stats panel */}
              <div
                className="sort-panel"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="sort-label" style={{ fontSize: '14px', fontWeight: '600', color: '#64748b' }}>
                    Sắp xếp theo
                  </span>
                  <select
                    id="sort"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      outline: 'none',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      color: '#334155'
                    }}
                  >
                    <option value="dateTime,asc">Mới nhất</option>
                    <option value="dateTime,desc">Cũ nhất</option>
                    <option value="price,asc">Giá vé thấp đến cao</option>
                    <option value="price,desc">Giá vé cao đến thấp</option>
                  </select>
                </div>

                <div
                  className="page-summary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '14px',
                    color: '#64748b'
                  }}
                >
                  <span style={{ fontWeight: '600', color: '#0f172a' }}>
                    {totalEventsCount.toLocaleString('vi-VN')} sự kiện
                  </span>
                  <span style={{ width: '1px', height: '14px', background: '#cbd5e1' }}></span>
                  <span>Trang {page + 1} / {Math.max(totalPages, 1)}</span>
                </div>
              </div>
            </div>

            {/* Section 3: Content (Grid / Loading / Empty states) */}
            {loading ? (
              <div
                className="message-panel"
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  color: '#64748b',
                  fontSize: '16px',
                  fontWeight: '500',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div className="spinner" style={{ marginBottom: '12px', fontSize: '24px' }}>⏳</div>
                Đang tải danh sách sự kiện...
              </div>
            ) : events.length === 0 ? (
              <div
                className="message-panel"
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  background: '#ffffff',
                  borderRadius: '16px',
                  color: '#64748b',
                  fontSize: '16px',
                  fontWeight: '500',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
                }}
              >
                <div style={{ marginBottom: '12px', fontSize: '32px' }}>🔍</div>
                Không tìm thấy sự kiện phù hợp. Hãy thử từ khóa khác!
              </div>
            ) : (
              <>
                {/* Grid layout for Events */}
                <div
                  className="event-grid"
                  style={{
                    display: 'grid',
                    justifyItems: 'stretch',
                    alignItems: 'stretch',
                    gap: '30px',
                    marginBottom: '40px',
                    width: '100%'
                  }}
                >
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      quantity={bookingQuantities[event.id] || 1}
                      onQuantityChange={handleQuantityChange}
                      onBook={handleBookTicket}
                      isSaved={savedEventIds.includes(event.id)}
                      onToggleSave={handleToggleSaveEvent}
                    />
                  ))}
                </div>

                {/* Section 4: Pagination */}
                {totalPages > 1 && (
                  <div
                    className="pagination"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '16px',
                      marginTop: '48px'
                    }}
                  >
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setPage((current) => Math.max(current - 1, 0))}
                      disabled={page <= 0}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: page <= 0 ? '#f1f5f9' : '#ffffff',
                        color: page <= 0 ? '#94a3b8' : '#334155',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: page <= 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        if (page > 0) e.currentTarget.style.borderColor = '#006af5';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                    >
                      Trang trước
                    </button>
                    <span
                      className="page-info"
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0f172a',
                        background: '#f1f5f9',
                        padding: '8px 16px',
                        borderRadius: '8px'
                      }}
                    >
                      {page + 1} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))}
                      disabled={page >= totalPages - 1}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: page >= totalPages - 1 ? '#f1f5f9' : '#ffffff',
                        color: page >= totalPages - 1 ? '#94a3b8' : '#334155',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        if (page < totalPages - 1) e.currentTarget.style.borderColor = '#006af5';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                    >
                      Trang sau
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {activePage === PAGES.LOGIN && (
          <section className="form-panel">
            <AuthForm mode="login" values={authValues} onChange={updateAuthValues} onSubmit={handleLogin} loading={authLoading} />
          </section>
        )}

        {activePage === PAGES.REGISTER && (
          <section className="form-panel">
            <AuthForm mode="register" values={authValues} onChange={updateAuthValues} onSubmit={handleRegister} loading={authLoading} />
          </section>
        )}

        {activePage === PAGES.BOOKINGS && (
          <section>
            <div className="section-heading">
              <h2>Vé của tôi</h2>
              <p>Xem danh sách vé hoặc chuyển sang vé lưu trữ.</p>
            </div>
            {!isAuthenticated ? (
              <div className="message-panel">Vui lòng đăng nhập để xem vé của bạn.</div>
            ) : (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  <button
                    type="button"
                    onClick={() => setBookingsView('history')}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '9999px',
                      border: bookingsView === 'history' ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      background: bookingsView === 'history' ? '#eff6ff' : '#ffffff',
                      color: bookingsView === 'history' ? '#1d4ed8' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Lịch sử vé
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingsView('saved')}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '9999px',
                      border: bookingsView === 'saved' ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      background: bookingsView === 'saved' ? '#eff6ff' : '#ffffff',
                      color: bookingsView === 'saved' ? '#1d4ed8' : '#475569',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Vé lưu trữ
                  </button>
                </div>

                {bookingsView === 'history' ? (
                  bookings.length === 0 ? (
                    <div className="message-panel">Bạn chưa có đơn đặt vé nào.</div>
                  ) : (
                    <div className="booking-list">
                      {bookings.map((booking) => (
                        <BookingCard key={booking.id} booking={booking} onPay={handlePayBooking} onCancel={handleCancelBooking} />
                      ))}
                    </div>
                  )
                ) : (
                  <>
                    {events.filter((event) => savedEventIds.includes(event.id)).length === 0 ? (
                      <div className="message-panel">Bạn chưa lưu trữ sự kiện nào.</div>
                    ) : (
                      <div
                        className="event-grid"
                        style={{
                          display: 'grid',
                          justifyItems: 'stretch',
                          alignItems: 'stretch',
                          gap: '30px',
                          marginBottom: '40px',
                          width: '100%'
                        }}
                      >
                        {events.filter((event) => savedEventIds.includes(event.id)).map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            quantity={bookingQuantities[event.id] || 1}
                            onQuantityChange={handleQuantityChange}
                            onBook={handleBookTicket}
                            isSaved={savedEventIds.includes(event.id)}
                            onToggleSave={handleToggleSaveEvent}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>
        )}

        {activePage === PAGES.ADMIN && (
          <section className="admin-page">
            {!isAdmin ? (
              <div className="message-panel">Bạn không có quyền truy cập vào trang quản trị.</div>
            ) : (
              <>
                <div className="admin-grid">
                  <div
                    className="admin-panel"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      minHeight: 'calc(100% + 10px)',
                      paddingBottom: '30px',
                      boxSizing: 'border-box',
                      marginTop: '30px'
                    }}
                  >
                    <AdminForm
                      values={adminValues}
                      onChange={updateAdminValues}
                      onSubmit={selectedEvent ? handleSaveEvent : handleCreateEvent}
                      loading={adminLoading}
                      submitLabel={selectedEvent ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
                    />
                    {selectedEvent && (
                      <button
                        className="secondary"
                        type="button"
                        onClick={handleCancelEdit}
                        style={{
                          width: '100%',
                          height: '42px',
                          background: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          color: '#475569',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          marginTop: '-8px',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
                      >
                        Hủy chỉnh sửa
                      </button>
                    )}
                  </div>

                  <div className="admin-events" style={{marginTop: '50px'}}>
                    <div className="section-heading">
                      <h2>Thống kê quản trị</h2>
                      <p>Thông tin tổng quan về người dùng, sự kiện và đặt vé.</p>
                    </div>
                    {adminStats ? (
                      <>
                        <div className="admin-stats-grid">
                          <article className="stat-card admin-stat-card">
                            <span>Tổng người dùng</span>
                            <strong>{adminStats.totalUsers}</strong>
                          </article>
                          <article className="stat-card admin-stat-card">
                            <span>Tổng sự kiện</span>
                            <strong>{adminStats.totalEvents}</strong>
                          </article>
                          <article className="stat-card admin-stat-card">
                            <span>Tổng đơn đặt</span>
                            <strong>{adminStats.totalBookings}</strong>
                          </article>
                          <article className="stat-card admin-stat-card">
                            <span>Đang giữ chỗ</span>
                            <strong>{adminStats.reservedBookings}</strong>
                          </article>
                          <article className="stat-card admin-stat-card">
                            <span>Đã bán</span>
                            <strong>{adminStats.soldBookings}</strong>
                          </article>
                          <article className="stat-card admin-stat-card">
                            <span>Vé khả dụng</span>
                            <strong>{adminStats.availableTickets}</strong>
                          </article>
                          <article className="stat-card admin-stat-card">
                            <span>Doanh thu đã xác nhận</span>
                            <strong>{Number(adminStats.totalRevenue || 0).toLocaleString('vi-VN')} đ</strong>
                          </article>
                          <article className="stat-card admin-stat-card">
                            <span>Người dùng hoạt động (7 ngày)</span>
                            <strong>{adminStats.activeUsers}</strong>
                          </article>
                          <article className="stat-card admin-stat-card">
                            <span>Sự kiện bán chạy nhất</span>
                            <strong>{adminStats.topEvent || 'Chưa có dữ liệu'}</strong>
                          </article>
                        </div>
                        <div className="admin-analytics-panel">
                          <div className="analytics-card">
                            <div className="analytics-card-header">
                              <span>Doanh thu hôm nay</span>
                              <strong>{Number(adminStats.dailyRevenue || 0).toLocaleString('vi-VN')} đ</strong>
                            </div>
                            <div className="analytics-bar">
                              <div className="analytics-bar-fill" style={{ width: `${Math.min(Number(adminStats.dailyRevenue || 0) / Math.max(Number(adminStats.monthlyRevenue || 1), 1) * 100, 100)}%` }} />
                            </div>
                          </div>
                          <div className="analytics-card">
                            <div className="analytics-card-header">
                              <span>Doanh thu tuần</span>
                              <strong>{Number(adminStats.weeklyRevenue || 0).toLocaleString('vi-VN')} đ</strong>
                            </div>
                            <div className="analytics-bar">
                              <div className="analytics-bar-fill" style={{ width: `${Math.min(Number(adminStats.weeklyRevenue || 0) / Math.max(Number(adminStats.monthlyRevenue || 1), 1) * 100, 100)}%` }} />
                            </div>
                          </div>
                          <div className="analytics-card">
                            <div className="analytics-card-header">
                              <span>Doanh thu tháng</span>
                              <strong>{Number(adminStats.monthlyRevenue || 0).toLocaleString('vi-VN')} đ</strong>
                            </div>
                            <div className="analytics-bar">
                              <div className="analytics-bar-fill" style={{ width: "100%" }} />
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="message-panel">Đang tải thống kê...</div>
                    )}
                    <div className="section-heading" style={{ marginTop: '24px' }}>
                      <h2>Quản lý sự kiện</h2>
                      <p>Xem và chỉnh sửa các sự kiện hiện có.</p>
                    </div>
                    {events.length === 0 ? (
                      <div className="message-panel">Không có sự kiện nào.</div>
                    ) : (
                      <div className="admin-event-list">
                        {events.map((event) => (
                          <article key={event.id} className="admin-event-card">
                            <div>
                              <h3>{event.title}</h3>
                              <p>{event.location} • {new Date(event.dateTime).toLocaleString('vi-VN')}</p>
                            </div>
                            <div className="admin-event-actions">
                              <button type="button" onClick={() => handleEditEvent(event)}>
                                Sửa
                              </button>
                              <button type="button" className="danger" onClick={() => handleDeleteEvent(event.id)}>
                                Xóa
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
