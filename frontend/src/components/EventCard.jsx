export function EventCard({ event, quantity, onQuantityChange, onBook }) {
  const priceValue = event.price ? Number(event.price) : 0;
  return (
    <article className="event-card">
      <div className="event-header">
        <h2>{event.title}</h2>
        <span className="badge">{event.location}</span>
      </div>
      <p className="event-description">{event.description}</p>

      <div className="event-details">
        <div>
          <strong>Thời gian</strong>
          <p>{new Date(event.dateTime).toLocaleString('vi-VN')}</p>
        </div>
        <div>
          <strong>Giá vé</strong>
          <p>{priceValue.toLocaleString('vi-VN')} ₫</p>
        </div>
      </div>

      <div className="event-stats">
        <span>Còn lại: {event.availableTickets}</span>
        <span>Tổng vé: {event.totalTickets}</span>
      </div>

      <div className="event-actions">
        <label htmlFor={`quantity-${event.id}`}>Số vé</label>
        <input
          id={`quantity-${event.id}`}
          type="number"
          min="1"
          max={event.availableTickets || 10}
          value={quantity}
          onChange={(e) => onQuantityChange(event.id, Number(e.target.value))}
        />
        <button type="button" onClick={() => onBook(event.id)} disabled={event.availableTickets <= 0}>
          {event.availableTickets > 0 ? 'Đặt vé' : 'Hết vé'}
        </button>
      </div>
    </article>
  );
}
