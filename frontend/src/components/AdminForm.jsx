export function AdminForm({ values, onChange, onSubmit, loading, submitLabel = 'Tạo sự kiện' }) {
  const isCreateMode = submitLabel === 'Tạo sự kiện';

  return (
    <div
      className="form-card"
      style={{
        width: '100%',
        maxWidth: '720px',
        margin: '40px auto',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
          {isCreateMode ? '📅 Tạo sự kiện mới' : '✏️ Chỉnh sửa sự kiện'}
        </h2>
        <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#64748b', lineHeight: '1.4' }}>
          {isCreateMode ? 'Điền đầy đủ thông tin để thêm sự kiện vào hệ thống.' : 'Cập nhật thông tin chi tiết của sự kiện hiện tại.'}
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="admin-form-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '20px'
        }}
      >
        <div style={{ gridColumn: '1 / -1', ...fieldContainerStyle }}>
          <label style={labelStyle}>Tiêu đề sự kiện <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            value={values.title}
            onChange={(e) => onChange('title', e.target.value)}
            type="text"
            placeholder="Ví dụ: Đại nhạc hội Sound of Summer 2026"
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Địa điểm diễn ra <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            value={values.location}
            onChange={(e) => onChange('location', e.target.value)}
            type="text"
            placeholder="Hà Nội, TP. HCM, Đà Nẵng..."
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Thời gian tổ chức <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            value={values.dateTime}
            onChange={(e) => onChange('dateTime', e.target.value)}
            type="datetime-local"
            required
            style={{ ...inputStyle, height: '42px' }}
          />
        </div>

        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Giá vé (VNĐ) <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            value={values.price}
            onChange={(e) => onChange('price', e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Ví dụ: 500000"
            required
            style={inputStyle}
          />
        </div>

        <div style={fieldContainerStyle}>
          <label style={labelStyle}>Tổng số lượng vé <span style={{ color: '#ef4444' }}>*</span></label>
          <input
            value={values.totalTickets}
            onChange={(e) => onChange('totalTickets', e.target.value)}
            type="number"
            min="0"
            placeholder="Ví dụ: 200"
            required
            style={inputStyle}
          />
        </div>

        <div style={{ gridColumn: '1 / -1', ...fieldContainerStyle }}>
          <label style={labelStyle}>Đường dẫn ảnh nền (URL)</label>
          <input
            value={values.imageUrl}
            onChange={(e) => onChange('imageUrl', e.target.value)}
            type="url"
            placeholder="https://example.com/images/banner.jpg"
            style={inputStyle}
          />
        </div>

        <div style={{ gridColumn: '1 / -1', ...fieldContainerStyle }}>
          <label style={labelStyle}>Mô tả sự kiện chi tiết</label>
          <textarea
            value={values.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Mô tả tóm tắt nội dung chương trình, các mốc thời gian, nghệ sĩ tham gia..."
            rows="4"
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '100px',
              lineHeight: '1.5'
            }}
          />
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '46px',
              background: loading ? '#cbd5e1' : '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s ease',
              boxShadow: '0 2px 4px rgba(5, 150, 105, 0.1)'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.background = '#047857';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.background = '#059669';
            }}
          >
            {loading ? 'Đang xử lý...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

const fieldContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#475569'
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#334155',
  transition: 'border-color 0.2s'
};