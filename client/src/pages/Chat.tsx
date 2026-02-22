import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';

export function Chat() {
  const {
    messages,
    isLoading,
    isSending,
    error,
    fetchMessages,
    pollMessages,
    sendMessage,
    clearError,
  } = useChatStore();
  const { username } = useAuthStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Fetch messages on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      pollMessages();
    }, 3000);
    return () => clearInterval(interval);
  }, [pollMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Detect if user scrolled up (disable auto-scroll)
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    setAutoScroll(true);
    await sendMessage(trimmed);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: typeof messages }[] = [];
  let lastDate = '';
  for (const msg of messages) {
    const date = formatDate(msg.createdAt);
    if (date !== lastDate) {
      groupedMessages.push({ date, msgs: [] });
      lastDate = date;
    }
    groupedMessages[groupedMessages.length - 1].msgs.push(msg);
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-adr-gold flex items-center gap-2">
            💬 Global Chat
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Chat with fellow adventurers • Use /me for emotes
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {messages.length} messages
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 text-red-300 px-4 py-2 rounded-lg mb-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-400 hover:text-red-300 ml-2">✕</button>
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="card flex-1 overflow-y-auto p-4 space-y-1 min-h-0"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="animate-spin text-3xl mb-2">⚔️</div>
              <p>Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🏰</div>
              <p>No messages yet. Be the first to speak!</p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 border-t border-gray-700/50"></div>
                <span className="text-xs text-gray-500 font-medium">{group.date}</span>
                <div className="flex-1 border-t border-gray-700/50"></div>
              </div>

              {group.msgs.map((msg) => {
                const isMe = msg.username === username;
                const isEmote = msg.message.startsWith('*') && msg.message.endsWith('*');

                if (isEmote) {
                  return (
                    <div key={msg.id} className="py-1 px-3 text-sm">
                      <span className="text-purple-400 italic">
                        {msg.message}
                      </span>
                      <span className="text-gray-600 text-xs ml-2">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`py-1.5 px-3 rounded-lg hover:bg-gray-800/30 transition-colors ${
                      isMe ? 'bg-adr-blue/5' : ''
                    }`}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className={`font-semibold text-sm ${
                        isMe ? 'text-adr-blue' : 'text-adr-gold'
                      }`}>
                        {msg.username}
                      </span>
                      <span className="text-gray-300 text-sm break-all">
                        {msg.message}
                      </span>
                      <span className="text-gray-600 text-xs whitespace-nowrap ml-auto flex-shrink-0">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom indicator */}
      {!autoScroll && (
        <div className="relative">
          <button
            onClick={() => {
              setAutoScroll(true);
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="absolute -top-10 right-4 bg-adr-blue text-white text-xs px-3 py-1.5 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          >
            ↓ New messages
          </button>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message... (use /me for emotes)"
          maxLength={250}
          disabled={isSending}
          className="flex-1 bg-adr-darker border border-gray-700/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-adr-blue/50 focus:ring-1 focus:ring-adr-blue/25 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="btn-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? '...' : 'Send'}
        </button>
      </form>
      <div className="flex justify-between mt-1 text-xs text-gray-600 px-1">
        <span>{input.length}/250</span>
        <span>Messages auto-refresh every 3s</span>
      </div>
    </div>
  );
}
