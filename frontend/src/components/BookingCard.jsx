export function BookingCard({ booking, onPay }) {
  const totalPrice = booking.totalPrice ? Number(booking.totalPrice) : 0;
  const statusClass = (booking.status || '').toLowerCase();

  const statusLabelMap = {
    RESERVED: 'Chờ thanh toán',
    SOLD: 'Đã thanh toán',
    AVAILABLE: 'Sẵn sàng',
    EXPIRED: 'Hết hạn',
    CANCELLED: 'Đã hủy',
    PENDING: 'Đang xử lý',
    CONFIRMED: 'Xác nhận'
  };

  const statusLabel = statusLabelMap[booking.status] || booking.status;

  return (
    <article className="booking-card">
      <div className="booking-header">
        <h3>{booking.eventTitle}</h3>
        <span className={`status-pill status-${statusClass}`}>{statusLabel}</span>
      </div>
      <div className="booking-details">
        <span>Số lượng: {booking.quantity}</span>
        <span>Tổng giá: {totalPrice.toLocaleString('vi-VN')}₫</span>
        <span>Đặt lúc: {new Date(booking.createdAt).toLocaleString('vi-VN')}</span>
      </div>
      {booking.status === 'RESERVED' && (
        <button type="button" className="primary" onClick={() => onPay(booking.id)}>
          Thanh toán VNPay
        </button>
      )}
    </article>
  );
}
