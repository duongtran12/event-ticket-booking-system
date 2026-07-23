import { useEffect, useState } from 'react';
import { NavBar } from './components/NavBar';
import { EventCard } from './components/EventCard';
import { BookingCard } from './components/BookingCard';
import { AuthForm } from './components/AuthForm';
import { AdminForm } from './components/AdminForm';
import { ProfilePage } from './components/ProfilePage';
import { ProfileEditForm } from './components/ProfileEditForm';
import { ChatBox } from './components/ChatBox';
import { checkInBooking, completePayment, createBooking, createEvent, createPayment, cancelBooking, deleteEvent, getAdminStats, getBookings, getEvents, getUserProfile, loginUser, registerUser, sendChatMessage, updateEvent, updateUserProfile } from './api';

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
  const eventCountLabel = events.length > 0 ? `${events.length.toLocaleString('vi-VN')} sự kiện` : 'Không có sự kiện';
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [bookingQuantities, setBookingQuantities] = useState({});
  const [token, setToken] = useState(localStorage.getItem('jwtToken') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');

  const getSavedEventsKey = (email) => (email ? `savedEventIds_${email}` : 'savedEventIds_guest');
  const loadSavedEvents = (email) => {
    try {
      return JSON.parse(localStorage.getItem(getSavedEventsKey(email)) || '[]');
    } catch {
      return [];
    }
  };
  const saveSavedEvents = (email, ids) => {
    try {
      localStorage.setItem(getSavedEventsKey(email), JSON.stringify(ids));
    } catch {
      // ignore localStorage failures
    }
  };

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
  const [savedEventIds, setSavedEventIds] = useState(() => loadSavedEvents(localStorage.getItem('userEmail') || ''));
  const [bookingsView, setBookingsView] = useState('history');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [checkInFile, setCheckInFile] = useState(null);
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [adminTab, setAdminTab] = useState('overview');

  const isAuthenticated = !!token;
  const isAdmin = userRole === 'ROLE_ADMIN';

  useEffect(() => {
    setSavedEventIds(loadSavedEvents(userEmail));
  }, [userEmail]);

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
      setSavedEventIds(loadSavedEvents(authValues.email));
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
    setAdminTab('form');
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
    setSavedEventIds(loadSavedEvents(''));
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
      setToken('');
      setUserEmail('');
      setUserRole('');
      setProfile(null);
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
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
      setMessage(`Đã giữ chỗ vé cho ${booking.eventTitle}. Vui lòng thanh toán trong 10 phút để giữ vé.`);
      setBookingQuantities((current) => ({ ...current, [eventId]: 1 }));
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === eventId
            ? { ...event, availableTickets: Math.max((event.availableTickets || 0) - quantity, 0) }
            : event
        )
      );
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
      const cancelledBooking = await cancelBooking(token, bookingId, reason.trim() || 'Hủy bởi người dùng');
      setMessage('Vé đã được hủy và trả về pool vé khả dụng.');
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === cancelledBooking.eventId
            ? { ...event, availableTickets: Math.max((event.availableTickets || 0) + cancelledBooking.quantity, 0) }
            : event
        )
      );
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
      saveSavedEvents(userEmail || '', next);
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
      if (!data?.paymentUrl) {
        setMessage('Vé này đã được thanh toán trước đó.');
        fetchBookings();
        return;
      }
      window.location.href = data.paymentUrl;
    } catch (e) {
      setError(e.message);
    }
  };

  const handleSendChat = async (text) => {
    const userMessage = { sender: 'user', text };
    setChatMessages((current) => [...current, userMessage]);

    try {
      const response = await sendChatMessage(text);
      const botText = typeof response === 'string'
        ? response
        : response?.message || response?.text || 'Không nhận được phản hồi.';
      setChatMessages((current) => [...current, { sender: 'bot', text: botText }]);
    } catch (e) {
      setChatMessages((current) => [...current, { sender: 'bot', text: 'Không thể kết nối tới chatbot: ' + e.message }]);
    }
  };

  const handleOpenChat = () => setChatOpen(true);
  const handleCloseChat = () => {
    setChatOpen(false);
    setChatMessages([]);
  };

  const handlePaymentCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');
    const responseCode = params.get('vnp_ResponseCode');

    if (!bookingId) {
      return;
    }

    const paymentResult = params.get('paymentResult');

    if (paymentResult === 'success') {
      setMessage('Thanh toán thành công. Vé đã chuyển sang trạng thái SOLD.');
      if (isAuthenticated) {
        fetchBookings();
        setActivePage(PAGES.BOOKINGS);
      }
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('bookingId');
        url.searchParams.delete('vnp_ResponseCode');
        url.searchParams.delete('paymentResult');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } catch (ignore) {}
      return;
    }

    if (paymentResult === 'failed' || responseCode !== '00') {
      setMessage('Thanh toán không hoàn tất. Vé vẫn giữ chỗ và bạn có thể thử lại.');
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('bookingId');
        url.searchParams.delete('vnp_ResponseCode');
        url.searchParams.delete('paymentResult');
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
      if (isAuthenticated) {
        fetchBookings();
        setActivePage(PAGES.BOOKINGS);
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

  const handleCheckIn = async (event) => {
    event.preventDefault();
    if (!checkInFile) {
      setCheckInResult({ success: false, message: 'Vui lòng chọn ảnh QR trước.' });
      return;
    }

    setCheckInLoading(true);
    setCheckInResult(null);
    try {
      const data = await checkInBooking(token, checkInFile);
      setCheckInResult(data);
    } catch (e) {
      setCheckInResult({ success: false, message: e.message || 'Không thể xử lý check-in.' });
    } finally {
      setCheckInLoading(false);
    }
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

        <button
          type="button"
          onClick={handleOpenChat}
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '24px',
            zIndex: 9998,
            background: '#0ea5e9',
            border: 'none',
            borderRadius: '999px',
            color: '#ffffff',
            padding: '14px 20px',
            boxShadow: '0 14px 30px rgba(14, 165, 233, 0.24)',
            cursor: 'pointer'
          }}
        >
          {chatOpen ? 'Chat đang mở' : 'Mở chatbot hỗ trợ'}
        </button>

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
                    <option value="dateTime,asc">Cũ nhất</option>
                    <option value="dateTime,desc">Mới nhất</option>
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
                    {eventCountLabel}
                  </span>
                </div>
              </div>
            </div>

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
          <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 0' }}>
            <div className="section-heading" style={{ marginBottom: '24px' }}>
              <h2> Vé của tôi</h2>
              <p>Quản lý các vé sự kiện bạn đã đặt, thanh toán và sự kiện đã lưu.</p>
            </div>

            {!isAuthenticated ? (
              <div className="message-panel">Vui lòng đăng nhập để xem danh sách vé của bạn.</div>
            ) : (
              <>
                {/* TICKETS STATS SUMMARY BAR */}
                <div className="tickets-stats-bar">
                  <div className="tickets-stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
                    <div className="tickets-stat-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span>TỔNG VÉ</span>
                      <strong>{bookings.length}</strong>
                    </div>
                  </div>

                  <div className="tickets-stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
                    <div className="tickets-stat-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span>ĐÃ THANH TOÁN</span>
                      <strong>{bookings.filter((b) => b.status === 'SOLD').length}</strong>
                    </div>
                  </div>

                  <div className="tickets-stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
                    <div className="tickets-stat-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span>CHỜ THANH TOÁN</span>
                      <strong>{bookings.filter((b) => b.status === 'RESERVED').length}</strong>
                    </div>
                  </div>

                  <div className="tickets-stat-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
                    <div className="tickets-stat-info" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span>SỰ KIỆN ĐÃ LƯU</span>
                      <strong>{savedEventIds.length}</strong>
                    </div>
                  </div>
                </div>

                {/* SEGMENTED FILTER TABS */}
                <div className="ticket-filter-tabs">
                  <button
                    type="button"
                    className={`ticket-filter-btn ${bookingsView === 'history' || bookingsView === 'all' ? 'active' : ''}`}
                    onClick={() => setBookingsView('all')}
                  >
                    <span>Tất cả vé</span>
                    <span className="ticket-filter-count">{bookings.length}</span>
                  </button>

                  <button
                    type="button"
                    className={`ticket-filter-btn ${bookingsView === 'reserved' ? 'active' : ''}`}
                    onClick={() => setBookingsView('reserved')}
                  >
                    <span>Chờ thanh toán</span>
                    <span className="ticket-filter-count">{bookings.filter((b) => b.status === 'RESERVED').length}</span>
                  </button>

                  <button
                    type="button"
                    className={`ticket-filter-btn ${bookingsView === 'sold' ? 'active' : ''}`}
                    onClick={() => setBookingsView('sold')}
                  >
                    <span>Đã thanh toán</span>
                    <span className="ticket-filter-count">{bookings.filter((b) => b.status === 'SOLD').length}</span>
                  </button>

                  <button
                    type="button"
                    className={`ticket-filter-btn ${bookingsView === 'cancelled' ? 'active' : ''}`}
                    onClick={() => setBookingsView('cancelled')}
                  >
                    <span>Đã hủy</span>
                    <span className="ticket-filter-count">{bookings.filter((b) => b.status === 'CANCELLED').length}</span>
                  </button>

                  <button
                    type="button"
                    className={`ticket-filter-btn ${bookingsView === 'saved' ? 'active' : ''}`}
                    onClick={() => setBookingsView('saved')}
                  >
                    <span>⭐ Sự kiện đã lưu</span>
                    <span className="ticket-filter-count">{savedEventIds.length}</span>
                  </button>
                </div>

                {/* CONTENT AREA BASED ON TAB */}
                {bookingsView === 'saved' ? (
                  <>
                    {events.filter((event) => savedEventIds.includes(event.id)).length === 0 ? (
                      <div className="message-panel">
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
                        Bạn chưa lưu trữ sự kiện nào.
                      </div>
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
                        {events
                          .filter((event) => savedEventIds.includes(event.id))
                          .map((event) => (
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
                ) : (
                  <>
                    {(() => {
                      const filteredBookings = bookings.filter((b) => {
                        if (bookingsView === 'reserved') return b.status === 'RESERVED';
                        if (bookingsView === 'sold') return b.status === 'SOLD';
                        if (bookingsView === 'cancelled') return b.status === 'CANCELLED';
                        return true; // 'all' or 'history'
                      });

                      if (filteredBookings.length === 0) {
                        return (
                          <div className="message-panel">
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎫</div>
                            {bookingsView === 'reserved'
                              ? 'Không có vé nào đang chờ thanh toán.'
                              : bookingsView === 'sold'
                              ? 'Bạn chưa có vé nào đã thanh toán.'
                              : bookingsView === 'cancelled'
                              ? 'Không có vé nào bị hủy.'
                              : 'Bạn chưa có đơn đặt vé nào.'}
                          </div>
                        );
                      }

                      return (
                        <div className="booking-list">
                          {filteredBookings.map((booking) => (
                            <BookingCard
                              key={booking.id}
                              booking={booking}
                              onPay={handlePayBooking}
                              onCancel={handleCancelBooking}
                            />
                          ))}
                        </div>
                      );
                    })()}
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
              <div className="admin-dashboard">
                {/* SIDEBAR NAVIGATION */}
                <aside className="admin-sidebar">
                  <div className="admin-sidebar-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%' }}>
                    <div className="admin-sidebar-brand-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <strong>ADMIN PORTAL</strong>
                      <span>Quản lý hệ thống</span>
                    </div>
                  </div>

                  <div className="admin-nav-label">Menu Chính</div>

                  <button
                    type="button"
                    className={`admin-nav-item ${adminTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setAdminTab('overview')}
                  >
                    <span className="admin-nav-item-icon">📊</span>
                    <span>Tổng quan & Stats</span>
                  </button>

                  <button
                    type="button"
                    className={`admin-nav-item ${adminTab === 'events' ? 'active' : ''}`}
                    onClick={() => setAdminTab('events')}
                  >
                    <span className="admin-nav-item-icon">🎟️</span>
                    <span>Quản lý sự kiện</span>
                    <span className="admin-nav-item-badge">{events.length}</span>
                  </button>

                  <button
                    type="button"
                    className={`admin-nav-item ${adminTab === 'form' ? 'active' : ''}`}
                    onClick={() => {
                      if (adminTab !== 'form') {
                        handleCancelEdit();
                      }
                      setAdminTab('form');
                    }}
                  >
                    <span className="admin-nav-item-icon">{selectedEvent ? '✏️' : '➕'}</span>
                    <span>{selectedEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</span>
                  </button>

                  <div className="admin-nav-label" style={{ marginTop: '16px' }}>Công cụ</div>

                  <button
                    type="button"
                    className={`admin-nav-item ${adminTab === 'checkin' ? 'active' : ''}`}
                    onClick={() => setAdminTab('checkin')}
                  >
                    <span className="admin-nav-item-icon">📷</span>
                    <span>Quét QR Check-in</span>
                  </button>
                </aside>

                {/* MAIN DASHBOARD CONTENT */}
                <main className="admin-main">
                  {/* HEADER */}
                  <div className="admin-main-header">
                    <div>
                      <h1>
                        {adminTab === 'overview' && '📊 Thống kê & Tổng quan'}
                        {adminTab === 'events' && '🎟️ Danh sách sự kiện'}
                        {adminTab === 'form' && (selectedEvent ? '✏️ Chỉnh sửa sự kiện' : ' Tạo sự kiện mới')}
                        {adminTab === 'checkin' && '📷 Kiểm soát vé vào cổng (Check-in)'}
                      </h1>
                      <p>Chào mừng trở lại, Administrator! Quản lý hoạt động bán vé dễ dàng.</p>
                    </div>

                    <button
                      type="button"
                      className="admin-refresh-btn"
                      onClick={() => {
                        fetchAdminStats();
                        fetchEvents();
                      }}
                    >
                      🔄 Làm mới dữ liệu
                    </button>
                  </div>

                  {/* TAB 1: OVERVIEW & STATS */}
                  {adminTab === 'overview' && (
                    <>
                      {adminStats ? (
                        <>
                          <div className="admin-section-title">
                            <h2>Chỉ số quan trọng</h2>
{/*                             <span>Cập nhật thời gian thực</span> */}
                          </div>

                          <div className="admin-stats-grid">
                            <div className="admin-stat-card accent-blue">
                              <div className="admin-stat-card-top">
                                <span>Tổng người dùng</span>
                              </div>
                              <strong>{adminStats.totalUsers}</strong>
                            </div>

                            <div className="admin-stat-card accent-violet">
                              <div className="admin-stat-card-top">
                                <span>Tổng sự kiện</span>
                              </div>
                              <strong>{adminStats.totalEvents}</strong>
                            </div>

                            <div className="admin-stat-card accent-emerald">
                              <div className="admin-stat-card-top">
                                <span>Tổng đơn đặt</span>
                              </div>
                              <strong>{adminStats.totalBookings}</strong>
                            </div>

                            <div className="admin-stat-card accent-amber">
                              <div className="admin-stat-card-top">
                                <span>Đang giữ chỗ</span>
                              </div>
                              <strong>{adminStats.reservedBookings}</strong>
                            </div>

                            <div className="admin-stat-card accent-green">
                              <div className="admin-stat-card-top">
                                <span>Vé đã bán</span>
                              </div>
                              <strong>{adminStats.soldBookings}</strong>
                            </div>

                            <div className="admin-stat-card accent-sky">
                              <div className="admin-stat-card-top">
                                <span>Vé còn lại</span>
                              </div>
                              <strong>{adminStats.availableTickets}</strong>
                            </div>

                            <div className="admin-stat-card accent-indigo">
                              <div className="admin-stat-card-top">
                                <span>Doanh thu xác nhận</span>
                              </div>
                              <strong>{Number(adminStats.totalRevenue || 0).toLocaleString('vi-VN')} đ</strong>
                            </div>

                            <div className="admin-stat-card accent-rose">
                              <div className="admin-stat-card-top">
                                <span>User active (7 ngày)</span>
                              </div>
                              <strong>{adminStats.activeUsers}</strong>
                            </div>
                          </div>

                          <div className="admin-section-title" style={{ marginTop: '12px' }}>
                            <h2>Phân tích doanh thu & Sự kiện HOT</h2>
                          </div>

                          <div className="admin-analytics-panel">
                            <div className="analytics-card">
                              <div className="analytics-card-header">
                                <span>Doanh thu hôm nay</span>
                                <strong>{Number(adminStats.dailyRevenue || 0).toLocaleString('vi-VN')} đ</strong>
                              </div>
                              <div className="analytics-bar">
                                <div
                                  className="analytics-bar-fill bar-daily"
                                  style={{
                                    width: `${Math.min(
                                      (Number(adminStats.dailyRevenue || 0) /
                                        Math.max(Number(adminStats.monthlyRevenue || 1), 1)) *
                                        100,
                                      100
                                    )}%`
                                  }}
                                />
                              </div>
                            </div>

                            <div className="analytics-card">
                              <div className="analytics-card-header">
                                <span>Doanh thu tuần này</span>
                                <strong>{Number(adminStats.weeklyRevenue || 0).toLocaleString('vi-VN')} đ</strong>
                              </div>
                              <div className="analytics-bar">
                                <div
                                  className="analytics-bar-fill bar-weekly"
                                  style={{
                                    width: `${Math.min(
                                      (Number(adminStats.weeklyRevenue || 0) /
                                        Math.max(Number(adminStats.monthlyRevenue || 1), 1)) *
                                        100,
                                      100
                                    )}%`
                                  }}
                                />
                              </div>
                            </div>

                            <div className="analytics-card">
                              <div className="analytics-card-header">
                                <span>Doanh thu tháng này</span>
                                <strong>{Number(adminStats.monthlyRevenue || 0).toLocaleString('vi-VN')} đ</strong>
                              </div>
                              <div className="analytics-bar">
                                <div className="analytics-bar-fill bar-monthly" style={{ width: '100%' }} />
                              </div>
                            </div>
                          </div>

                          <div className="admin-panel-card" style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ fontSize: '32px' }}>🏆</div>
                              <div>
                                <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#0f172a' }}>Sự kiện bán chạy nhất</h3>
                                <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#6366f1' }}>
                                  {adminStats.topEvent || 'Chưa có dữ liệu'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="message-panel">⏳ Đang tải thông tin thống kê...</div>
                      )}
                    </>
                  )}

                  {/* TAB 2: EVENTS MANAGEMENT TABLE */}
                  {adminTab === 'events' && (
                    <div className="admin-panel-card">
                      <div className="admin-section-title">
                        <h2>Danh sách sự kiện ({events.length})</h2>
                        <button
                          type="button"
                          className="admin-btn-edit"
                          onClick={() => {
                            handleCancelEdit();
                            setAdminTab('form');
                          }}
                        >
                          ➕ Thêm sự kiện mới
                        </button>
                      </div>

                      {events.length === 0 ? (
                        <div className="message-panel">Chưa có sự kiện nào được tạo.</div>
                      ) : (
                        <div className="admin-table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Sự kiện</th>
                                <th>Địa điểm</th>
                                <th>Thời gian</th>
                                <th>Giá vé</th>
                                <th>Vé còn lại / Tổng</th>
                                <th>Hành động</th>
                              </tr>
                            </thead>
                            <tbody>
                              {events.map((ev) => (
                                <tr key={ev.id}>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      {ev.imageUrl ? (
                                        <img
                                          src={ev.imageUrl}
                                          alt={ev.title}
                                          style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e2e8f0', display: 'grid', placeItems: 'center', fontSize: 18 }}>
                                          🎪
                                        </div>
                                      )}
                                      <div>
                                        <strong>{ev.title}</strong>
                                        <span>ID: {ev.id}</span>
                                      </div>
                                    </div>
                                  </td>
                                  <td>{ev.location}</td>
                                  <td>{new Date(ev.dateTime).toLocaleString('vi-VN')}</td>
                                  <td>
                                    <strong style={{ color: '#059669' }}>
                                      {Number(ev.price).toLocaleString('vi-VN')} đ
                                    </strong>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: 700, color: ev.availableTickets > 0 ? '#0284c7' : '#ef4444' }}>
                                      {ev.availableTickets}
                                    </span>{' '}
                                    / {ev.totalTickets}
                                  </td>
                                  <td>
                                    <div className="admin-table-actions">
                                      <button type="button" className="admin-btn-edit" onClick={() => handleEditEvent(ev)}>
                                         Sửa
                                      </button>
                                      <button type="button" className="admin-btn-delete" onClick={() => handleDeleteEvent(ev.id)}>
                                         Xóa
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: CREATE / EDIT FORM */}
                  {adminTab === 'form' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <AdminForm
                        values={adminValues}
                        onChange={updateAdminValues}
                        onSubmit={async (e) => {
                          await (selectedEvent ? handleSaveEvent(e) : handleCreateEvent(e));
                          setAdminTab('events');
                        }}
                        loading={adminLoading}
                        submitLabel={selectedEvent ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
                      />
                      {selectedEvent && (
                        <div style={{ textAlign: 'center' }}>
                          <button
                            className="secondary"
                            type="button"
                            onClick={() => {
                              handleCancelEdit();
                              setAdminTab('events');
                            }}
                            style={{
                              padding: '10px 24px',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '10px',
                              color: '#475569',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            ❌ Hủy chỉnh sửa & quay lại danh sách
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: CHECK-IN */}
                  {adminTab === 'checkin' && (
                    <div className="admin-panel-card" style={{ maxWidth: '680px', margin: '0 auto', width: '100%' }}>
                      <div className="admin-panel-card-title">
                        <div className="admin-panel-card-title-icon" style={{ background: '#f0fdf4', color: '#0f766e' }}>
                          📷
                        </div>
                        <div>
                          <h2>Quét QR Code Check-in</h2>
                          <p>Tải lên hoặc quét mã QR trên vé của khách hàng để xác nhận vào cổng.</p>
                        </div>
                      </div>

                      <form onSubmit={handleCheckIn}>
                        <div className="checkin-dropzone">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => setCheckInFile(event.target.files?.[0] || null)}
                          />
                          <div className="checkin-dropzone-icon">📥</div>
                          <div className="checkin-dropzone-title">
                            {checkInFile ? 'Đã chọn ảnh vé QR' : 'Nhấp hoặc kéo thả ảnh QR vào đây'}
                          </div>
                          <div className="checkin-dropzone-sub">Hỗ trợ các định dạng PNG, JPG, JPEG</div>
                          {checkInFile && (
                            <div className="checkin-selected-name">
                              📄 {checkInFile.name}
                            </div>
                          )}
                        </div>

                        <button type="submit" disabled={checkInLoading || !checkInFile} className="checkin-submit-btn">
                          {checkInLoading ? '⏳ Đang quét & xử lý...' : ' Quét check-in ngay'}
                        </button>
                      </form>

                      {checkInResult && (
                        <div
                          className="checkin-result"
                          style={{
                            background: checkInResult.success ? '#f0fdf4' : '#fff1f2',
                            borderColor: checkInResult.success ? '#a7f3d0' : '#fecaca',
                            color: checkInResult.success ? '#065f46' : '#991b1b'
                          }}
                        >
                          <div className="checkin-result-header">
                            <div
                              className="checkin-result-icon"
                              style={{
                                background: checkInResult.success ? '#dcfce7' : '#fee2e2',
                                color: checkInResult.success ? '#166534' : '#991b1b'
                              }}
                            >
                              {checkInResult.success ? '✔' : '✖'}
                            </div>
                            <div>
                              <strong style={{ fontSize: '1.1rem', display: 'block' }}>
                                {checkInResult.success ? 'CHECK-IN THÀNH CÔNG' : 'CHECK-IN THẤT BẠI'}
                              </strong>
                              <span style={{ fontSize: '0.9rem' }}>{checkInResult.message}</span>
                            </div>
                          </div>

                          {checkInResult.success && (
                            <div className="checkin-result-body" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                              {checkInResult.customerName && (
                                <div className="checkin-result-item">
                                  <label>Tên khách hàng</label>
                                  <span>{checkInResult.customerName}</span>
                                </div>
                              )}
                              {checkInResult.eventTitle && (
                                <div className="checkin-result-item">
                                  <label>Sự kiện</label>
                                  <span>{checkInResult.eventTitle}</span>
                                </div>
                              )}
                              {checkInResult.eventLocation && (
                                <div className="checkin-result-item">
                                  <label>Địa điểm</label>
                                  <span>{checkInResult.eventLocation}</span>
                                </div>
                              )}
                              {checkInResult.checkedInAt && (
                                <div className="checkin-result-item">
                                  <label>Thời gian check-in</label>
                                  <span>{checkInResult.checkedInAt}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </main>
              </div>
            )}
          </section>
        )}
        <ChatBox open={chatOpen} messages={chatMessages} onClose={handleCloseChat} onSend={handleSendChat} />
      </main>
    </div>
  );
}

export default App;
