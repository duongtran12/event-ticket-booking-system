export function EventCard({ event, quantity, onQuantityChange, onBook, isSaved, onToggleSave }) {
  const priceValue = event.price ? Number(event.price) : 0;
  const eventDate = event.dateTime ? new Date(event.dateTime) : null;
  const isClosed = eventDate ? eventDate.getTime() - Date.now() <= 2 * 60 * 60 * 1000 : false;
  const canBook = event.availableTickets > 0 && !isClosed;

  return (
    <article
      className="event-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(15, 23, 42, 0.05)',
        border: '1px solid #e2e8f0',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* CARD BANNER IMAGE */}
      <div
        className="event-image-wrap"
        style={{
          width: '100%',
          height: '210px',
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)'
        }}
      >
        {event.imageUrl ? (
          <img
            className="event-image"
            src={event.imageUrl}
            alt={event.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </div>
        )}

        {/* SAVE EVENT BUTTON (STAR SVG) */}
        <button
          type="button"
          onClick={() => onToggleSave?.(event.id)}
          title={isSaved ? 'Bỏ lưu trữ' : 'Lưu trữ sự kiện'}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            background: isSaved ? '#f59e0b' : 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? '#ffffff' : 'none'} stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        {/* LOCATION BADGE ON IMAGE */}
        {event.location && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{event.location}</span>
          </div>
        )}
      </div>

      {/* CARD CONTENT */}
      <div
        className="event-card-body"
        style={{
          padding: '20px',
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: '700',
            color: '#0f172a',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '48px'
          }}
        >
          {event.title}
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: '13px',
            color: '#64748b',
            lineHeight: '1.5',
            height: '58px',
            overflowY: 'auto'
          }}
        >
          {event.description || 'Chưa có mô tả chi tiết cho sự kiện này.'}
        </p>

        {/* DATE & PRICE INFO */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            padding: '12px 0',
            borderTop: '1px solid #f1f5f9',
            borderBottom: '1px solid #f1f5f9'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Thời gian
            </span>
            <p style={{ margin: '3px 0 0 0', fontSize: '13px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>
                {new Date(event.dateTime).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </p>
          </div>

          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Giá vé từ
            </span>
            <p style={{ margin: '3px 0 0 0', fontSize: '15px', fontWeight: '800', color: '#2563eb' }}>
              {priceValue.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>

        {/* TICKET AVAILABILITY */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748b' }}>
          <span>
            Còn lại:{' '}
            <strong style={{ color: event.availableTickets > 0 ? '#059669' : '#dc2626' }}>
              {event.availableTickets} vé
            </strong>
          </span>
          <span>Tổng: {event.totalTickets} vé</span>
        </div>
      </div>

      {/* CARD ACTION (QUANTITY & BOOK BUTTON) */}
      <div
        style={{
          padding: '0 20px 20px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <div style={{ width: '60px' }}>
          <input
            id={`quantity-${event.id}`}
            type="number"
            min="1"
            max={event.availableTickets || 10}
            value={quantity}
            onChange={(e) => onQuantityChange(event.id, Number(e.target.value))}
            style={{
              width: '100%',
              padding: '9px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              fontWeight: '700',
              textAlign: 'center',
              outline: 'none',
              color: '#0f172a',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => canBook && onBook(event.id)}
          disabled={!canBook}
          style={{
            flex: 1,
            height: '42px',
            backgroundColor: canBook ? '#2563eb' : '#cbd5e1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: '700',
            cursor: canBook ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            boxShadow: canBook ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none'
          }}
          onMouseOver={(e) => {
            if (canBook) e.currentTarget.style.backgroundColor = '#1d4ed8';
          }}
          onMouseOut={(e) => {
            if (canBook) e.currentTarget.style.backgroundColor = '#2563eb';
          }}
        >
          {event.availableTickets <= 0 ? 'Hết vé' : isClosed ? 'Đóng vé' : 'Đặt vé ngay'}
        </button>
      </div>
    </article>
  );
}
