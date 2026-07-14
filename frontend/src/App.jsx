import { useEffect, useState } from 'react';
import { NavBar } from './components/NavBar';
import { EventCard } from './components/EventCard';
import { BookingCard } from './components/BookingCard';
import { AuthForm } from './components/AuthForm';
import { AdminForm } from './components/AdminForm';
import { ProfilePage } from './components/ProfilePage';
import { completePayment, createBooking, createEvent, createPayment, deleteEvent, getAdminStats, getBookings, getEvents, getUserProfile, loginUser, registerUser, updateEvent } from './api';

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
  const [authValues, setAuthValues] = useState({ fullName: '', email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [adminValues, setAdminValues] = useState({
    title: '',
    description: '',
    location: '',
    dateTime: '',
    price: '',
    totalTickets: '',
  });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editMode, setEditMode] = useState(false);

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
      setAuthValues({ fullName: '', email: '', password: '' });
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
      await registerUser(authValues.fullName, authValues.email, authValues.password);
      setAuthValues({ fullName: '', email: '', password: '' });
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
        dateTime: adminValues.dateTime,
        price: Number(adminValues.price),
        totalTickets: Number(adminValues.totalTickets),
      };
      await createEvent(token, payload);
      setAdminValues({ title: '', description: '', location: '', dateTime: '', price: '', totalTickets: '' });
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
      dateTime: eventData.dateTime,
      price: eventData.price,
      totalTickets: eventData.totalTickets,
    });
    setActivePage(PAGES.ADMIN);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedEvent(null);
    setAdminValues({ title: '', description: '', location: '', dateTime: '', price: '', totalTickets: '' });
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
    if (!bookingId) {
      return;
    }

    try {
      await completePayment(token, bookingId);
      setMessage('Thanh toán thành công. Vé đã chuyển sang trạng thái SOLD.');
      if (activePage === PAGES.BOOKINGS) {
        fetchBookings();
      }
      // Remove bookingId from URL to avoid re-trigger on reload
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('bookingId');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      } catch (ignore) {}
    } catch (e) {
      const msg = e.message || '';
      // If already completed, treat as success and don't show error
      if (msg.includes('Only RESERVED bookings can be completed') || msg.includes('Current status: SOLD')) {
        setMessage('Thanh toán đã được xử lý trước đó.');
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('bookingId');
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

        {activePage === PAGES.PROFILE && (
          <ProfilePage profile={profile} isAdmin={isAdmin} onGoAdmin={() => setActivePage(PAGES.ADMIN)} />
        )}

        {activePage === PAGES.HOME && (
          <section>
            <div className="toolbar home-toolbar">
              <div className="home-intro">
                <p className="eyebrow">Khám phá ngay</p>
                <h2>Đặt vé sự kiện HOT nhất</h2>
                <p className="hero-description">Tìm nhanh sự kiện bạn yêu thích, so sánh vé và hoàn tất đặt vé chỉ trong vài bước.</p>
              </div>
            </div>
            <div className="toolbar">
              <form className="search-form" onSubmit={handleSearch}>
                <input
                  placeholder="Bạn tìm gì hôm nay?"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
                <button type="submit">Tìm kiếm</button>
              </form>

              <div className="sort-panel">
                <div>
                  <span className="sort-label">Sắp xếp theo</span>
                  <select id="sort" value={sort} onChange={(event) => setSort(event.target.value)}>
                    <option value="dateTime,asc">Ngày tăng dần</option>
                    <option value="dateTime,desc">Ngày giảm dần</option>
                    <option value="price,asc">Giá vé thấp đến cao</option>
                    <option value="price,desc">Giá vé cao đến thấp</option>
                  </select>
                </div>
                <div className="page-summary">
                  <span>{totalEventsCount.toLocaleString('vi-VN')} sự kiện</span>
                  <span>Trang {page + 1} / {Math.max(totalPages, 1)}</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="message-panel">Đang tải sự kiện...</div>
            ) : events.length === 0 ? (
              <div className="message-panel">Không tìm thấy sự kiện phù hợp.</div>
            ) : (
              <>
                <div className="event-grid">
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      quantity={bookingQuantities[event.id] || 1}
                      onQuantityChange={handleQuantityChange}
                      onBook={handleBookTicket}
                    />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="pagination">
                    <button type="button" className="secondary" onClick={() => setPage((current) => Math.max(current - 1, 0))} disabled={page <= 0}>
                      Trang trước
                    </button>
                    <span className="page-info">{page + 1} / {totalPages}</span>
                    <button type="button" className="secondary" onClick={() => setPage((current) => Math.min(current + 1, totalPages - 1))} disabled={page >= totalPages - 1}>
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
              <h2>Lịch sử đặt vé</h2>
              <p>Xem lại các đơn đặt và tình trạng vé của bạn.</p>
            </div>
            {!isAuthenticated ? (
              <div className="message-panel">Vui lòng đăng nhập để xem lịch sử đặt vé.</div>
            ) : bookings.length === 0 ? (
              <div className="message-panel">Bạn chưa có đơn đặt vé nào.</div>
            ) : (
              <div className="booking-list">
                {bookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onPay={handlePayBooking} />
                ))}
              </div>
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
                  <div className="admin-panel">
                    <AdminForm
                      values={adminValues}
                      onChange={updateAdminValues}
                      onSubmit={selectedEvent ? handleSaveEvent : handleCreateEvent}
                      loading={adminLoading}
                      submitLabel={selectedEvent ? 'Cập nhật sự kiện' : 'Tạo sự kiện'}
                    />
                    {selectedEvent && (
                      <button className="secondary" type="button" onClick={handleCancelEdit}>
                        Hủy chỉnh sửa
                      </button>
                    )}
                  </div>

                  <div className="admin-events">
                    <div className="section-heading">
                      <h2>Thống kê quản trị</h2>
                      <p>Thông tin tổng quan về người dùng, sự kiện và đặt vé.</p>
                    </div>
                    {adminStats ? (
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
                          <span>Khả dụng</span>
                          <strong>{adminStats.availableBookings}</strong>
                        </article>
                        <article className="stat-card admin-stat-card">
                          <span>Doanh thu đã xác nhận</span>
                          <strong>{Number(adminStats.totalRevenue || 0).toLocaleString('vi-VN')} đ</strong>
                        </article>
                      </div>
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
