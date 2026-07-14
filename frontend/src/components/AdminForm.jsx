export function AdminForm({ values, onChange, onSubmit, loading, submitLabel = 'Tạo sự kiện' }) {
  return (
    <div className="form-card">
      <h2>{submitLabel === 'Tạo sự kiện' ? 'Tạo sự kiện mới' : 'Chỉnh sửa sự kiện'}</h2>
      <p>{submitLabel === 'Tạo sự kiện' ? 'Điền đầy đủ thông tin để thêm sự kiện cho hệ thống.' : 'Cập nhật thông tin sự kiện hiện tại.'}</p>
      <form onSubmit={onSubmit}>
        <label>
          Tiêu đề
          <input
            value={values.title}
            onChange={(e) => onChange('title', e.target.value)}
            type="text"
            placeholder="Tên sự kiện"
            required
          />
        </label>

        <label>
          Mô tả
          <textarea
            value={values.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Mô tả sự kiện"
            rows="4"
          />
        </label>

        <label>
          Địa điểm
          <input
            value={values.location}
            onChange={(e) => onChange('location', e.target.value)}
            type="text"
            placeholder="Hà Nội, TP. HCM..."
            required
          />
        </label>

        <label>
          Ngày giờ
          <input
            value={values.dateTime}
            onChange={(e) => onChange('dateTime', e.target.value)}
            type="datetime-local"
            required
          />
        </label>

        <label>
          Giá vé
          <input
            value={values.price}
            onChange={(e) => onChange('price', e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Ví dụ: 500000"
            required
          />
        </label>

        <label>
          Tổng số vé
          <input
            value={values.totalTickets}
            onChange={(e) => onChange('totalTickets', e.target.value)}
            type="number"
            min="0"
            required
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
        </button>
      </form>
    </div>
  );
}
