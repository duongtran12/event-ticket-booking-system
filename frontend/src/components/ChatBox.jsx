import { useEffect, useRef, useState } from 'react';

export function ChatBox({ open, messages, onClose, onSend }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  if (!open) return null;

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
    <aside className="chat-panel" aria-label="Chat hỗ trợ AI">
      <header className="chat-panel-header">
        <div className="chat-panel-heading">
          <span className="chat-panel-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
              <path d="M8 9h8M8 13h5" />
            </svg>
          </span>
          <div>
            <strong>Trợ lý TicketBox</strong>
            <span><i /> Trực tuyến · hỗ trợ tức thì</span>
          </div>
        </div>
        <button className="chat-close-button" type="button" onClick={onClose} aria-label="Đóng chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </header>

      <div className="chat-messages" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <span className="chat-welcome-icon">AI</span>
            <strong>Xin chào, mình có thể giúp gì?</strong>
            <p>Hỏi về sự kiện, giá vé, cách đặt vé hoặc thanh toán.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              className={`chat-message-row ${message.sender === 'user' ? 'is-user' : 'is-assistant'}`}
              key={`${message.sender}-${index}`}
            >
              <div className="chat-message-bubble">{message.text}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="chat-composer">
        <div className="chat-input-wrap">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi của bạn..."
            rows={2}
          />
          <button type="button" onClick={handleSend} disabled={!input.trim()} aria-label="Gửi tin nhắn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>
        <div className="chat-composer-meta">
          <span>Enter để gửi · Shift + Enter để xuống dòng</span>
          <button type="button" onClick={onClose}>Kết thúc</button>
        </div>
      </footer>
    </aside>
  );
}
