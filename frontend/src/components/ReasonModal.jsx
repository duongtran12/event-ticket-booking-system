import { useEffect, useState } from 'react';

export function ReasonModal({ open, mode, loading, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const isCancel = mode === 'cancel';

  useEffect(() => {
    if (open) {
      setReason(isCancel ? 'Hủy vì thay đổi kế hoạch' : 'Yêu cầu hoàn vé vì thay đổi kế hoạch');
    }
  }, [open, isCancel]);

  if (!open) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(reason.trim());
  };

  return (
    <div className="reason-modal-backdrop" role="presentation" onMouseDown={() => !loading && onClose()}>
      <form className="reason-modal" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <div className={`reason-modal-icon ${isCancel ? 'cancel' : 'refund'}`}>
          {isCancel ? '✕' : '↩'}
        </div>
        <div className="reason-modal-heading">
          <h2>{isCancel ? 'Xác nhận hủy vé' : 'Yêu cầu hoàn vé'}</h2>
          <p>
            {isCancel
              ? 'Vé giữ chỗ sẽ được trả lại kho ngay sau khi hủy.'
              : 'Yêu cầu sẽ được ghi nhận và chờ hệ thống thanh toán xử lý.'}
          </p>
        </div>

        <label className="reason-modal-label" htmlFor="booking-reason">Lý do</label>
        <textarea
          id="booking-reason"
          className="reason-modal-textarea"
          value={reason}
          maxLength={500}
          rows={4}
          autoFocus
          onChange={(event) => setReason(event.target.value)}
          placeholder="Nhập lý do của bạn..."
        />
        <div className="reason-modal-counter">{reason.length}/500</div>

        <div className="reason-modal-actions">
          <button type="button" className="reason-modal-secondary" disabled={loading} onClick={onClose}>Đóng</button>
          <button type="submit" className={`reason-modal-primary ${isCancel ? 'cancel' : 'refund'}`} disabled={loading}>
            {loading ? 'Đang xử lý...' : isCancel ? 'Xác nhận hủy vé' : 'Gửi yêu cầu hoàn vé'}
          </button>
        </div>
      </form>
    </div>
  );
}
