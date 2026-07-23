import { useState } from 'react';

export function AdminForm({ values, onChange, onSubmit, loading, submitLabel = 'Tạo sự kiện' }) {
  const isCreateMode = submitLabel === 'Tạo sự kiện';

  return (
    <div
      className="admin-panel-card"
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      <div className="admin-panel-card-title">
        <div>
          <h2>{isCreateMode ? 'Tạo sự kiện mới' : 'Chỉnh sửa sự kiện'}</h2>
          <p>
            {isCreateMode
              ? 'Điền đầy đủ thông tin để phát hành sự kiện mới trên hệ thống.'
              : 'Cập nhật thông tin chi tiết của sự kiện đã chọn.'}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="admin-form-grid">
        <div style={{ gridColumn: '1 / -1', ...fieldContainerStyle }}>
          <label style={labelStyle}>
            <span> Tiêu đề sự kiện</span> <span style={{ color: '#ef4444' }}>*</span>
          </label>
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
          <label style={labelStyle}>
            <span> Địa điểm diễn ra</span> <span style={{ color: '#ef4444' }}>*</span>
          </label>
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
          <label style={labelStyle}>
            <span> Thời gian tổ chức</span> <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            value={values.dateTime}
            onChange={(e) => onChange('dateTime', e.target.value)}
            type="datetime-local"
            required
            style={{ ...inputStyle, height: '44px' }}
          />
        </div>

        <div style={fieldContainerStyle}>
          <label style={labelStyle}>
            <span> Giá vé (VNĐ)</span> <span style={{ color: '#ef4444' }}>*</span>
          </label>
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
          <label style={labelStyle}>
            <span> Tổng số lượng vé</span> <span style={{ color: '#ef4444' }}>*</span>
          </label>
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
          <label style={labelStyle}>
            <span> Đường dẫn ảnh nền (URL)</span>
          </label>
          <input
            value={values.imageUrl}
            onChange={(e) => onChange('imageUrl', e.target.value)}
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            style={inputStyle}
          />
          {values.imageUrl && (
            <div style={{ marginTop: '10px', borderRadius: '12px', overflow: 'hidden', height: '140px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <img
                src={values.imageUrl}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}
        </div>

        <div style={{ gridColumn: '1 / -1', ...fieldContainerStyle }}>
          <label style={labelStyle}>
            <span> Mô tả sự kiện chi tiết</span>
          </label>
          <textarea
            value={values.description}
            onChange={(e) => onChange('description', e.target.value)}
            placeholder="Mô tả tóm tắt nội dung chương trình, dàn nghệ sĩ tham gia, lịch trình..."
            rows="4"
            style={{
              ...inputStyle,
              resize: 'vertical',
              minHeight: '110px',
              lineHeight: '1.6'
            }}
          />
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              background: loading
                ? '#cbd5e1'
                : isCreateMode
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isCreateMode
                ? '0 4px 14px rgba(16, 185, 129, 0.3)'
                : '0 4px 14px rgba(59, 130, 246, 0.3)'
            }}
          >
            {loading ? '⏳ Đang xử lý...' : submitLabel}
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
  color: '#475569',
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
};

const inputStyle = {
  width: '100%',
  padding: '11px 15px',
  borderRadius: '10px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#0f172a',
  background: '#ffffff',
  transition: 'border-color 0.2s, box-shadow 0.2s'
};