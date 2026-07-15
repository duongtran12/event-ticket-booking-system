export function EventCard({ event, quantity, onQuantityChange, onBook }) {
  const priceValue = event.price ? Number(event.price) : 0;
  return (
    <article 
      className="event-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.06)',
        border: '1px solid #f1f5f9',
        width: '100%',
        minWidth: '280px',
        maxWidth: '380px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      {event.imageUrl && (
        <div 
          className="event-image-wrap"
          style={{
            width: '100%',
            height: '200px',
            overflow: 'hidden'
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
              ?? {event.location}
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
            <strong style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Th?i gian</strong>
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
              {priceValue.toLocaleString('vi-VN')} ?
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
          <span>Còn l?i: <strong style={{ color: event.availableTickets > 0 ? '#10b981' : '#ef4444' }}>{event.availableTickets}</strong></span>
          <span>T?ng vé: {event.totalTickets}</span>
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
            S? vé
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
          onClick={() => onBook(event.id)} 
          disabled={event.availableTickets <= 0}
          style={{
            flex: 1,
            height: '42px',
            backgroundColor: event.availableTickets > 0 ? '#006af5' : '#cbd5e1',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: event.availableTickets > 0 ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (event.availableTickets > 0) e.currentTarget.style.backgroundColor = '#0056c6';
          }}
          onMouseOut={(e) => {
            if (event.availableTickets > 0) e.currentTarget.style.backgroundColor = '#006af5';
          }}
        >
          {event.availableTickets > 0 ? 'Ð?t vé ngay' : 'H?t vé'}
        </button>
      </div>
    </article>
  );
}
