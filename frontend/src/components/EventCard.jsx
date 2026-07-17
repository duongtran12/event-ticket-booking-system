export function EventCard({ event, quantity, onQuantityChange, onBook, isSaved, onToggleSave }) {
  const priceValue = event.price ? Number(event.price) : 0;
  const eventDate = event.dateTime ? new Date(event.dateTime) : null;
  const isClosed = eventDate ? eventDate.getTime() - Date.now() <= 2 * 60 * 60 * 1000 : false;
  const canBook = event.availableTickets > 0 && !isClosed;
  return (
    <article 
      className="event-card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.06)',
        border: '1px solid #f1f5f9',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxSizing: 'border-box'
      }}
    >
      {event.imageUrl && (
        <div 
          className="event-image-wrap"
          style={{
            width: '100%',
            height: '200px',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <img 
            className="event-image" 
            src={event.imageUrl} 
            alt={event.title} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <button
            type="button"
            onClick={() => onToggleSave?.(event.id)}
            title={isSaved ? 'Bỏ lưu trữ' : 'Lưu trữ sự kiện'}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.7)',
              background: isSaved ? '#fbbf24' : 'rgba(255,255,255,0.85)',
              color: isSaved ? '#ffffff' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              cursor: 'pointer',
              boxShadow: '0 10px 20px rgba(15, 23, 42, 0.16)'
            }}
          >
            ★
          </button>
        </div>
      )}
      
      <div 
        className="event-card-body"
        style={{
          padding: '20px',
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div
          className="event-header"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <h2
            className="event-title"
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '700',
              color: '#0f172a',
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '75px'
            }}
          >
            {event.title}
          </h2>
          <div>
            <span 
              className="badge"
              style={{
                background: '#f1f5f9',
                color: '#475569',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-block'
              }}
            >
              📍 {event.location}
            </span>
          </div>
        </div>

        <p 
          className="event-description"
          style={{
            margin: 0,
            fontSize: '13.5px',
            color: '#64748b',
            lineHeight: '1.5',
            height: '60px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}
        >
          {event.description}
        </p>

        <div 
          className="event-details"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            padding: '12px 0',
            borderTop: '1px solid #f1f5f9',
            borderBottom: '1px solid #f1f5f9'
          }}
        >
          <div>
            <strong style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Thời gian</strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
              {new Date(event.dateTime).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </p>
          </div>
          <div>
            <strong style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Giá vé</strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: '800', color: '#ef4444' }}>
              {priceValue.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        </div>

        <div 
          className="event-stats"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: '#64748b'
          }}
        >
          <span>Còn lại: <strong style={{ color: event.availableTickets > 0 ? '#10b981' : '#ef4444' }}>{event.availableTickets}</strong></span>
          <span>Tổng vé: {event.totalTickets}</span>
        </div>
      </div>

      <div 
        className="event-actions"
        style={{
          padding: '0 20px 20px 20px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label 
            htmlFor={`quantity-${event.id}`}
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase'
            }}
          >
            Số vé
          </label>
          <input
            id={`quantity-${event.id}`}
            type="number"
            min="1"
            max={event.availableTickets || 10}
            value={quantity}
            onChange={(e) => onQuantityChange(event.id, Number(e.target.value))}
            style={{
              width: '65px',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '14px',
              fontWeight: '600',
              textAlign: 'center',
              outline: 'none',
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
            backgroundColor: canBook ? '#006af5' : '#cbd5c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: canBook ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (canBook) e.currentTarget.style.backgroundColor = '#0056c6';
          }}
          onMouseOut={(e) => {
            if (canBook) e.currentTarget.style.backgroundColor = '#006af5';
          }}
        >
          {event.availableTickets <= 0 ? 'Hết vé' : isClosed ? 'Đã đóng' : 'Đặt vé ngay'}
        </button>
      </div>
      {isClosed && event.availableTickets > 0 && (
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', color: '#b91c1c', fontWeight: '600', fontSize: '13px', textAlign: 'center' }}>
          Đã đóng cổng bán vé
        </div>
      )}
    </article>
  );
}
