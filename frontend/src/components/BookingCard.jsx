import { useState } from 'react';

export function BookingCard({ booking, onPay, onCancel }) {
  const [showQrModal, setShowQrModal] = useState(false);
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
    RESERVED: { text: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: '⏳' },
    SOLD: { text: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '🎟️' },
    CONFIRMED: { text: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: '✅' },
    AVAILABLE: { text: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '⚡' },
    PENDING: { text: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '⏳' },
    EXPIRED: { text: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '⚠️' },
    CANCELLED: { text: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: '❌' }
  };

  const statusLabel = statusLabelMap[booking.status] || booking.status;
  const currentStatusColors = statusColors[booking.status] || { text: '#475569', bg: '#f8fafc', border: '#e2e8f0', icon: '🎫' };

  return (
    <>
      <article className="ticket-pass">
        {/* MAIN TICKET CONTENT */}
        <div className="ticket-pass-main">
          <div className="ticket-pass-header">
            <div>
              <div className="ticket-pass-id">MÃ VÉ #{booking.id}</div>
              <h3 className="ticket-pass-title">{booking.eventTitle}</h3>
            </div>

            <span
              className={`status-pill status-${statusClass}`}
              style={{
                fontSize: '12px',
                fontWeight: '700',
                padding: '6px 14px',
                borderRadius: '999px',
                whiteSpace: 'nowrap',
                color: currentStatusColors.text,
                backgroundColor: currentStatusColors.bg,
                border: `1px solid ${currentStatusColors.border}`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{currentStatusColors.icon}</span>
              <span>{statusLabel}</span>
            </span>
          </div>

          {/* FIELD GRID */}
          <div className="ticket-pass-grid">
            <div className="ticket-pass-field">
              <span> Địa điểm</span>
              <p>{booking.eventLocation || '---'}</p>
            </div>

            <div className="ticket-pass-field">
              <span> Thời gian diễn ra</span>
              <p>
                {booking.eventDateTime
                  ? new Date(booking.eventDateTime).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })
                  : '---'}
              </p>
            </div>

            <div className="ticket-pass-field">
              <span> Số lượng</span>
              <p>{booking.quantity} Vé</p>
            </div>

            <div className="ticket-pass-field">
              <span> Loại vé</span>
              <p>{booking.ticketTypeName || '---'}</p>
            </div>

            <div className="ticket-pass-field">
              <span> Giá vé</span>
              <p style={{ color: '#2563eb' }}>
                {Number(booking.eventPrice || 0).toLocaleString('vi-VN')}₫
              </p>
            </div>
          </div>

          {/* BUYER INFORMATION IF SOLD */}
          {booking.status === 'SOLD' && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '14px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                fontSize: '0.85rem'
              }}
            >
              <div>
                <strong style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>NGƯỜI SỞ HỮU</strong>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>{booking.buyerName || booking.userEmail}</span>
              </div>
              {booking.buyerPhone && (
                <div>
                  <strong style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>SĐT</strong>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{booking.buyerPhone}</span>
                </div>
              )}
              {booking.buyerCccd && (
                <div>
                  <strong style={{ color: '#64748b', fontSize: '0.78rem', display: 'block' }}>CCCD</strong>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{booking.buyerCccd}</span>
                </div>
              )}
            </div>
          )}

          {/* CANCEL REASON IF CANCELLED */}
          {booking.status === 'CANCELLED' && booking.cancelReason && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '14px',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#991b1b',
                fontSize: '0.85rem'
              }}
            >
              <strong>Lý do hủy:</strong> {booking.cancelReason}
            </div>
          )}
        </div>

        {/* TICKET STUB RIGHT (QR & ACTIONS) */}
        <div className="ticket-pass-stub">
          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            TỔNG CỘNG
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ef4444', lineHeight: 1 }}>
            {totalPrice.toLocaleString('vi-VN')}₫
          </div>

          {/* QR CODE DISPLAY IF SOLD */}
          {booking.status === 'SOLD' && booking.qrCodeImage && (
            <>
              <div className="ticket-qr-container" style={{ cursor: 'pointer' }} onClick={() => setShowQrModal(true)}>
                <img src={booking.qrCodeImage} alt="QR Code" className="ticket-qr-img" />
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🔍 Phóng to mã QR
              </button>
            </>
          )}

          {/* PAYMENT / CANCEL BUTTONS IF RESERVED */}
          {booking.status === 'RESERVED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <button
                type="button"
                onClick={() => onPay(booking.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #006af5, #0056c6)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 106, 245, 0.25)',
                  transition: 'transform 0.15s ease'
                }}
              >
                💳 Thanh toán VNPay
              </button>

              <button
                type="button"
                onClick={() => onCancel?.(booking.id)}
                style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: '10px',
                  border: '1px solid #fee2e2',
                  background: '#fff1f2',
                  color: '#ef4444',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ❌ Hủy giữ chỗ
              </button>
            </div>
          )}

          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 'auto' }}>
            Đặt lúc: {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
          </div>
        </div>
      </article>

      {/* QR MODAL PREVIEW RENDERED AS SIBLING (OUTSIDE OVERFLOW HIDDEN CONTAINER) */}
      {showQrModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowQrModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '28px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'grid',
                placeItems: 'center',
                color: '#64748b'
              }}
            >
              ✕
            </button>

            <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#0f172a', fontWeight: '800' }}>
              Mã QR Vé Vào Cổng
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '0.88rem', color: '#64748b' }}>
              Trình mã này tại quầy check-in để xác nhận vé
            </p>

            <div
              style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: '20px',
                border: '2px dashed #cbd5e1',
                boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                display: 'inline-block'
              }}
            >
              <img
                src={booking.qrCodeImage}
                alt="QR Code Large"
                style={{ width: '220px', height: '220px', display: 'block', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginTop: '18px', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', fontSize: '0.88rem', fontWeight: '700', color: '#1e293b' }}>
              Mã vé: #{booking.id} • {booking.eventTitle}
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '13px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #0f172a, #1e293b)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(15,23,42,0.2)'
              }}
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </>
  );
}