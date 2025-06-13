import { useState, useEffect } from 'react';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Chat {
  id: number;
  title: string;
  messages: Message[];
}

export default function ChatPage({ onBack }: { onBack: () => void }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [input, setInput] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const createChat = () => {
    const id = chats.length ? chats[chats.length - 1].id + 1 : 1;
    const chat: Chat = { id, title: `Chat ${id}`, messages: [] };
    setChats((c) => [...c, chat]);
    setActive(id);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || active === null) return;
    setChats((cs) =>
      cs.map((c) =>
        c.id === active
          ? { ...c, messages: [...c.messages, { role: 'user', content: input }] }
          : c
      )
    );
    setInput('');
  };

  useEffect(() => {
    if (!chats.length) {
      createChat();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const messages = chats.find((c) => c.id === active)?.messages ?? [];

  return (
    <main className="main editor-page chat-page">
      <div className="page-header editor-header">
        <button className="back-btn" onClick={onBack} aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <polyline
              points="15 18 9 12 15 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h2 className="editor-title">Chat</h2>
      </div>
      <div className="chat-main">
        <aside className={clsx('chat-sidebar', { collapsed })}>
          <div className="chat-sidebar-header">
            <button
              type="button"
              className="collapse-btn"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? '▶' : '◀'}
            </button>
            {!collapsed && (
              <>
                <h3 className="chat-history-title">History</h3>
                <button
                  type="button"
                  className="create-btn"
                  title="New Chat"
                  onClick={createChat}
                >
                  <svg width="16" height="16" viewBox="0 0 12 12" aria-hidden="true">
                    <line
                      x1="1"
                      y1="6"
                      x2="11"
                      y2="6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="6"
                      y1="1"
                      x2="6"
                      y2="11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="create-label">New</span>
                </button>
              </>
            )}
          </div>
          {!collapsed && (
            <ul className="chat-history-list">
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  className={clsx('chat-history-item', { active: chat.id === active })}
                  onClick={() => setActive(chat.id)}
                >
                  {chat.title}
                </li>
              ))}
            </ul>
          )}
        </aside>
        <section className="chat-window">
          <div className="messages">
            {messages.map((m, i) => (
              <div key={i} className={clsx('message', m.role)}>
                {m.content}
              </div>
            ))}
          </div>
          {active !== null && (
            <form className="chat-input" onSubmit={sendMessage}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
