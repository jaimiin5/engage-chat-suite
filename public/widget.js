(function() {
  'use strict';

  // Get script element and its data attributes
  const script = document.currentScript;
  const botId = script.getAttribute('data-bot-id');
  const theme = script.getAttribute('data-theme') || 'dark';
  const position = script.getAttribute('data-position') || 'bottom-right';

  if (!botId) {
    console.error('EngageChat: data-bot-id is required');
    return;
  }

  // Supabase configuration
  const SUPABASE_URL = 'https://pwdubhogihazsgnibunw.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZHViaG9naWhhenNnbmlidW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTMxNDgsImV4cCI6MjA4MjQ2OTE0OH0.psLHd4a9Nt8AHYvN3I9jFMwBnLNXcdhbAozVx8ObXNo';

  // Theme colors
  const themes = {
    dark: {
      bg: '#1a1a2e',
      headerBg: '#16213e',
      text: '#ffffff',
      textSecondary: '#94a3b8',
      inputBg: '#0f0f1a',
      inputBorder: '#334155',
      userBubble: '#6366f1',
      assistantBubble: '#1e293b',
      buttonBg: '#6366f1',
      buttonHover: '#4f46e5'
    },
    light: {
      bg: '#ffffff',
      headerBg: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      inputBg: '#f1f5f9',
      inputBorder: '#e2e8f0',
      userBubble: '#6366f1',
      assistantBubble: '#f1f5f9',
      buttonBg: '#6366f1',
      buttonHover: '#4f46e5'
    }
  };

  const colors = themes[theme] || themes.dark;

  // Position styles
  const positions = {
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' }
  };

  const pos = positions[position] || positions['bottom-right'];

  // State
  let isOpen = false;
  let messages = [];
  let chatbotConfig = null;
  let qaPairs = [];
  let isLoading = false;

  // Fetch chatbot config and Q&A pairs
  async function fetchConfig() {
    try {
      const [configRes, qaRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/chatbots?id=eq.${botId}&select=*`, {
          headers: { 'apikey': SUPABASE_ANON_KEY }
        }),
        fetch(`${SUPABASE_URL}/rest/v1/chatbot_qa_pairs?chatbot_id=eq.${botId}&is_active=eq.true&select=*&order=priority.desc`, {
          headers: { 'apikey': SUPABASE_ANON_KEY }
        })
      ]);
      
      const configs = await configRes.json();
      const qaData = await qaRes.json();
      
      if (configs && configs.length > 0) {
        chatbotConfig = configs[0];
        if (chatbotConfig.welcome_message) {
          messages = [{ role: 'assistant', content: chatbotConfig.welcome_message }];
          renderMessages();
        }
      }
      
      if (qaData && Array.isArray(qaData)) {
        qaPairs = qaData;
      }
    } catch (error) {
      console.error('EngageChat: Error fetching config:', error);
    }
  }

  // Check if message matches any Q&A pair
  function findQAMatch(userMessage) {
    const normalizedMessage = userMessage.toLowerCase().trim();
    
    for (const qa of qaPairs) {
      const question = qa.question.toLowerCase().trim();
      
      switch (qa.match_type) {
        case 'exact':
          if (normalizedMessage === question) return qa.answer;
          break;
        case 'starts_with':
          if (normalizedMessage.startsWith(question)) return qa.answer;
          break;
        case 'contains':
        default:
          if (normalizedMessage.includes(question)) return qa.answer;
          break;
      }
    }
    return null;
  }

  // Create styles
  const style = document.createElement('style');
  style.textContent = `
    #engage-chat-widget * {
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #engage-chat-toggle {
      position: fixed;
      ${Object.entries(pos).map(([k, v]) => `${k}: ${v}`).join('; ')};
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${colors.buttonBg};
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, background 0.2s;
      z-index: 999999;
    }
    #engage-chat-toggle:hover {
      background: ${colors.buttonHover};
      transform: scale(1.05);
    }
    #engage-chat-toggle svg {
      width: 28px;
      height: 28px;
      fill: white;
    }
    #engage-chat-window {
      position: fixed;
      ${position === 'bottom-left' ? 'left: 20px' : 'right: 20px'};
      bottom: 90px;
      width: 380px;
      height: 520px;
      background: ${colors.bg};
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999999;
    }
    #engage-chat-window.open {
      display: flex;
    }
    #engage-chat-header {
      background: ${colors.headerBg};
      padding: 16px 20px;
      border-bottom: 1px solid ${colors.inputBorder};
    }
    #engage-chat-header h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: ${colors.text};
    }
    #engage-chat-header p {
      margin: 0;
      font-size: 13px;
      color: ${colors.textSecondary};
    }
    #engage-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .engage-message {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .engage-message.user {
      align-self: flex-end;
      background: ${colors.userBubble};
      color: white;
      border-bottom-right-radius: 4px;
    }
    .engage-message.assistant {
      align-self: flex-start;
      background: ${colors.assistantBubble};
      color: ${colors.text};
      border-bottom-left-radius: 4px;
    }
    #engage-chat-input-area {
      padding: 16px;
      border-top: 1px solid ${colors.inputBorder};
      display: flex;
      gap: 10px;
    }
    #engage-chat-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid ${colors.inputBorder};
      border-radius: 10px;
      background: ${colors.inputBg};
      color: ${colors.text};
      font-size: 14px;
      outline: none;
    }
    #engage-chat-input::placeholder {
      color: ${colors.textSecondary};
    }
    #engage-chat-input:focus {
      border-color: ${colors.buttonBg};
    }
    #engage-chat-send {
      padding: 10px 16px;
      background: ${colors.buttonBg};
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }
    #engage-chat-send:hover {
      background: ${colors.buttonHover};
    }
    #engage-chat-send:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .engage-typing {
      display: flex;
      gap: 4px;
      padding: 12px 14px;
    }
    .engage-typing span {
      width: 8px;
      height: 8px;
      background: ${colors.textSecondary};
      border-radius: 50%;
      animation: engage-bounce 1.4s ease-in-out infinite;
    }
    .engage-typing span:nth-child(2) { animation-delay: 0.2s; }
    .engage-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes engage-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
    @media (max-width: 480px) {
      #engage-chat-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 120px);
        bottom: 80px;
        ${position === 'bottom-left' ? 'left: 20px' : 'right: 20px'};
      }
    }
  `;
  document.head.appendChild(style);

  // Create widget container
  const container = document.createElement('div');
  container.id = 'engage-chat-widget';
  container.innerHTML = `
    <button id="engage-chat-toggle" aria-label="Open chat">
      <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.07L2 22l4.93-1.38C8.42 21.5 10.15 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm4 0h-2v-6h2v6zm0-8H9V7h6v2z"/></svg>
    </button>
    <div id="engage-chat-window">
      <div id="engage-chat-header">
        <h3>Chat with us</h3>
        <p>We're here to help</p>
      </div>
      <div id="engage-chat-messages"></div>
      <div id="engage-chat-input-area">
        <input type="text" id="engage-chat-input" placeholder="Type a message..." />
        <button id="engage-chat-send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Elements
  const toggle = document.getElementById('engage-chat-toggle');
  const chatWindow = document.getElementById('engage-chat-window');
  const messagesEl = document.getElementById('engage-chat-messages');
  const input = document.getElementById('engage-chat-input');
  const sendBtn = document.getElementById('engage-chat-send');
  const headerTitle = container.querySelector('#engage-chat-header h3');
  const headerSubtitle = container.querySelector('#engage-chat-header p');

  // Toggle chat
  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    chatWindow.classList.toggle('open', isOpen);
    if (isOpen) {
      input.focus();
      if (!chatbotConfig) fetchConfig();
    }
  });

  // Render messages
  function renderMessages() {
    messagesEl.innerHTML = messages.map(m => 
      `<div class="engage-message ${m.role}">${escapeHtml(m.content)}</div>`
    ).join('');
    if (isLoading) {
      messagesEl.innerHTML += `<div class="engage-message assistant engage-typing"><span></span><span></span><span></span></div>`;
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Send message
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isLoading) return;

    messages.push({ role: 'user', content: text });
    input.value = '';
    renderMessages();

    // Check for Q&A match first
    const qaMatch = findQAMatch(text);
    if (qaMatch) {
      messages.push({ role: 'assistant', content: qaMatch });
      renderMessages();
      return;
    }

    // No Q&A match, use AI
    isLoading = true;
    sendBtn.disabled = true;
    renderMessages();

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          messages: messages.filter(m => m.role !== 'assistant' || m !== messages[messages.length - 1])
            .map(m => ({ role: m.role, content: m.content })),
          botId: botId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      // Handle streaming
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                // Update the last message or add new
                const lastMsg = messages[messages.length - 1];
                if (lastMsg?.role === 'assistant') {
                  lastMsg.content = assistantMessage;
                } else {
                  messages.push({ role: 'assistant', content: assistantMessage });
                }
                isLoading = false;
                renderMessages();
              }
            } catch (e) { /* ignore parse errors */ }
          }
        }
      }

      if (!assistantMessage) {
        messages.push({ role: 'assistant', content: "I'm sorry, I couldn't generate a response." });
      }
    } catch (error) {
      console.error('EngageChat error:', error);
      messages.push({ role: 'assistant', content: error.message || "Sorry, something went wrong." });
    } finally {
      isLoading = false;
      sendBtn.disabled = false;
      renderMessages();
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Fetch config on load
  fetchConfig().then(() => {
    if (chatbotConfig) {
      headerTitle.textContent = chatbotConfig.name || 'Chat with us';
      headerSubtitle.textContent = chatbotConfig.description || "We're here to help";
    }
  });
})();
