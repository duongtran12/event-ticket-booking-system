import { useState, useEffect, useRef } from 'react';

const cannedReply = (text) => {
  const normalized = text.toLowerCase();
  if (normalized.includes('vé') || normalized.includes('dat')) {
    return 'Hiện tại mình có thể giúp bạn hỏi về cách đặt vé, trạng thái đặt vé và thông tin sự kiện. Bạn có thể nói rõ event hoặc câu hỏi của bạn nhé.';
  }
  if (normalized.includes('hủy') || normalized.includes('huỷ')) {
    return 'Bạn có thể hủy vé của mình trên trang Vé của tôi nếu trạng thái vẫn là Chờ thanh toán. Nếu đã thanh toán, hãy liên hệ bộ phận hỗ trợ.';
  }
  if (normalized.includes('thanh toán') || normalized.includes('vnpay') || normalized.includes('thanh toan')) {
    return 'Bạn cần thanh toán trong 10 phút sau khi giữ chỗ để hoàn tất. Nếu chưa thanh toán, vé sẽ bị hết hạn.';
  }
  if (normalized.includes('địa điểm') || normalized.includes('địa chỉ')) {
    return 'Mỗi event có thông tin địa điểm hiển thị trong chi tiết sự kiện. Bạn có thể mở event và xem phần Thời gian/Địa điểm.';
  }
  return 'Mình là chatbot trợ lý demo. Bạn có thể hỏi về event, đặt vé, hủy vé hoặc cách thanh toán.';
};

export function ChatBox({ open, messages, onClose, onSend }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  if (!open) {
    return null;
  }

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '24px',
        width: '360px',
        maxWidth: 'calc(100vw - 32px)',
        zIndex: 9999,
        borderRadius: '24px',
        boxShadow: '0 24px 80px rgba(15, 23, 42, 0.18)',
        overflow: 'hidden',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #e2e8f0'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px',
          background: '#0f172a',
          color: '#ffffff'
        }}
      >
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>Chat hỗ trợ AI</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            Trả lời theo dữ liệu hiện tại, xoá khi đóng.
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ffffff',
            fontSize: '18px',
            cursor: 'pointer'
          }}
          aria-label="Đóng chat"
        >
          ×
        </button>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: '250px',
          maxHeight: '420px',
          overflowY: 'auto',
          padding: '16px',
          background: '#f8fafc'
        }}
      >
        {messages.length === 0 ? (
          <div style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6 }}>
            Xin chào! Bạn có thể hỏi về cách đặt vé, thông tin sự kiện hoặc thanh toán.
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                marginBottom: '12px',
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '82%',
                  background: message.sender === 'user' ? '#0f172a' : '#ffffff',
                  color: message.sender === 'user' ? '#ffffff' : '#0f172a',
                  border: message.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                  borderRadius: '18px',
                  padding: '12px 14px',
                  boxShadow: message.sender === 'user' ? '0 8px 24px rgba(15, 23, 42, 0.12)' : 'none',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div
        style={{
          padding: '14px 18px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0'
        }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi..."
          rows={2}
          style={{
            width: '100%',
            resize: 'none',
            borderRadius: '14px',
            border: '1px solid #cbd5e1',
            padding: '12px 14px',
            fontSize: '14px',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <button
            type="button"
            onClick={handleSend}
            style={{
              background: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 18px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Gửi
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Kết thúc & xóa
          </button>
        </div>
      </div>
    </div>
  );
}
