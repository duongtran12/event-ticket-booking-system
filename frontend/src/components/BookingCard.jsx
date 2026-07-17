export function BookingCard({ booking, onPay, onCancel }) {
  const totalPrice = booking.totalPrice ? Number(booking.totalPrice) : 0;
  const statusClass = (booking.status || '').toLowerCase();

  const statusLabelMap = {
    RESERVED: 'Chờ thanh toán',
    SOLD: 'Đã thanh toán',
    AVAILABLE: 'Sẵn sàng',
    EXPIRED: 'Hết hạn thanh toán',
    CANCELLED: 'Đã hủy',
    PENDING: 'Đang xử lý',
    CONFIRMED: 'Xác nhận'
  };

  const statusColors = {
    RESERVED: { text: '#b45309', bg: '#fef3c7', border: '#fde68a' },
    SOLD: { text: '#15803d', bg: '#dcfce7', border: '#bbf7d0' },
    CONFIRMED: { text: '#15803d', bg: '#dcfce7', border: '#bbf7d0' },
    AVAILABLE: { text: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe' },
    PENDING: { text: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe' },
    EXPIRED: { text: '#b91c1c', bg: '#fee2e2', border: '#fecaca' },
    CANCELLED: { text: '#4b5563', bg: '#f3f4f6', border: '#e5e7eb' }
  };

  const statusLabel = statusLabelMap[booking.status] || booking.status;
  const currentStatusColors = statusColors[booking.status] || { text: '#374151', bg: '#f3f4f6', border: '#e5e7eb' };

  return (
    <article
      className={`booking-card booking-card-${statusClass}`}
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f3f4f6',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        maxWidth: '700px',
        margin: '24px auto 24px auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="booking-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            lineHeight: '1.4',
            flex: 1
          }}
        >
          {booking.eventTitle}
        </h3>
        <span
          className={`status-pill status-${statusClass}`}
          style={{
            fontSize: '13px',
            fontWeight: '600',
            padding: '6px 14px',
            borderRadius: '9999px',
            whiteSpace: 'nowrap',
            color: currentStatusColors.text,
            backgroundColor: currentStatusColors.bg,
            border: `1px solid ${currentStatusColors.border}`
          }}
        >
          {statusLabel}
        </span>
      </div>

      <hr style={{ border: 0, borderTop: '1px dashed #e5e7eb', margin: 0 }} />

      <div
        className="booking-details"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', color: '#6b7280' }}>Số lượng vé:</span>
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>{booking.quantity} vé</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '15px', color: '#6b7280' }}>Đặt lúc:</span>
          <span style={{ fontSize: '14px', color: '#4b5563' }}>
            {new Date(booking.createdAt).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <span style={{ fontSize: '15px', color: '#6b7280' }}>Tổng giá tiền:</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444' }}>
            {totalPrice.toLocaleString('vi-VN')}₫
          </span>
        </div>
      </div>

      {booking.status === 'RESERVED' && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="primary"
            onClick={() => onPay(booking.id)}
            style={{
              width: '100%',
              backgroundColor: '#006af5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxShadow: '0 4px 12px rgba(0, 106, 245, 0.2)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#0056c6';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 106, 245, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#006af5';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 106, 245, 0.2)';
            }}
          >
            Thanh toán qua VNPay
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => onCancel?.(booking.id)}
            style={{
              width: '100%',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              outline: 'none',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
            }}
          >
            Hủy vé
          </button>
        </div>
      )}
    </article>
  );
}