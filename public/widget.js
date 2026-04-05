(function() {
  'use strict';

  function init() {
    const scripts = document.querySelectorAll('script[data-bot-id]');
    const script = scripts[scripts.length - 1];
    
    if (!script) {
      console.error('EngageChat: No script with data-bot-id found.');
      return;
    }

    const botId = script.getAttribute('data-bot-id');
    const theme = script.getAttribute('data-theme') || 'dark';
    const position = script.getAttribute('data-position') || 'bottom-right';
    const primaryColor = script.getAttribute('data-primary-color') || '#000000';
    const iconType = script.getAttribute('data-icon-type') || 'icon';
    const iconText = script.getAttribute('data-icon-text') || '';

    if (!botId) {
      console.error('EngageChat: data-bot-id is required');
      return;
    }

    console.log('EngageChat: Initializing widget', { botId, theme, position, primaryColor, iconType });

    const SUPABASE_URL = 'https://pwdubhogihazsgnibunw.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZHViaG9naWhhenNnbmlidW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4OTMxNDgsImV4cCI6MjA4MjQ2OTE0OH0.psLHd4a9Nt8AHYvN3I9jFMwBnLNXcdhbAozVx8ObXNo';

    // Determine text color contrast
    function isLightColor(hex) {
      const c = hex.replace('#', '');
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 > 150;
    }

    const textOnPrimary = isLightColor(primaryColor) ? '#111827' : '#ffffff';
    const isDark = theme === 'dark';

    const colors = {
      bg: isDark ? '#030712' : '#ffffff',
      headerBg: primaryColor,
      headerText: textOnPrimary,
      text: isDark ? '#ffffff' : '#1e293b',
      textSecondary: isDark ? '#9ca3af' : '#64748b',
      inputBg: isDark ? '#1f2937' : '#f3f4f6',
      inputBorder: isDark ? '#374151' : '#e5e7eb',
      userBubble: primaryColor,
      userBubbleText: textOnPrimary,
      assistantBubble: isDark ? '#1f2937' : '#ffffff',
      assistantBubbleText: isDark ? '#f3f4f6' : '#1e293b',
      assistantBorder: isDark ? 'transparent' : '#e5e7eb',
      buttonBg: primaryColor,
      buttonHover: primaryColor,
    };

    const positions = {
      'bottom-right': { bottom: '20px', right: '20px' },
      'bottom-left': { bottom: '20px', left: '20px' }
    };
    const pos = positions[position] || positions['bottom-right'];

    let isOpen = false;
    let messages = [];
    let chatbotConfig = null;
    let qaPairs = [];
    let isLoading = false;

    // Bot icon SVG
    const botIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>';
    const chatIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>';
    const closeIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';
    const sendIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg>';
    const minimizeIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" x2="21" y1="10" y2="3"></line><line x1="3" x2="10" y1="21" y2="14"></line></svg>';

    function getToggleContent() {
      if (iconType === 'alphabet' && iconText) {
        return '<span style="font-size:18px;font-weight:600;">' + iconText.toUpperCase() + '</span>';
      }
      return chatIconSVG;
    }

    function getBotAvatarContent(size) {
      if (iconType === 'alphabet' && iconText) {
        const fontSize = size === 'sm' ? '11px' : '13px';
        return '<span style="font-size:' + fontSize + ';font-weight:600;">' + iconText.toUpperCase() + '</span>';
      }
      return botIconSVG;
    }

    async function fetchConfig() {
      try {
        const [configRes, qaRes] = await Promise.all([
          fetch(SUPABASE_URL + '/rest/v1/chatbots?id=eq.' + botId + '&select=*', {
            headers: { 'apikey': SUPABASE_ANON_KEY }
          }),
          fetch(SUPABASE_URL + '/rest/v1/chatbot_qa_pairs?chatbot_id=eq.' + botId + '&is_active=eq.true&select=*&order=priority.desc', {
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

    const style = document.createElement('style');
    style.textContent = `
      #engage-chat-widget * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin: 0;
        padding: 0;
      }
      #engage-chat-toggle {
        position: fixed;
        ${Object.entries(pos).map(function(e) { return e[0] + ': ' + e[1]; }).join('; ')};
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: ${colors.buttonBg};
        color: ${textOnPrimary};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
        z-index: 999999;
      }
      #engage-chat-toggle:hover {
        transform: scale(1.05);
      }
      #engage-chat-window {
        position: fixed;
        ${position === 'bottom-left' ? 'left: 20px' : 'right: 20px'};
        bottom: 90px;
        width: 360px;
        max-height: 500px;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 999999;
        background: ${colors.bg};
        border: 1px solid ${colors.inputBorder};
      }
      #engage-chat-window.open {
        display: flex;
        animation: engage-fade-in 0.2s ease-out;
      }
      @keyframes engage-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      #engage-chat-header {
        background: ${colors.headerBg};
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .engage-header-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${textOnPrimary};
        flex-shrink: 0;
      }
      .engage-header-info {
        flex: 1;
      }
      .engage-header-info h3 {
        font-size: 15px;
        font-weight: 600;
        color: ${textOnPrimary};
        margin: 0;
      }
      .engage-header-info p {
        font-size: 12px;
        color: ${textOnPrimary};
        opacity: 0.8;
        margin: 0;
      }
      .engage-minimize-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255,255,255,0.1);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${textOnPrimary};
        transition: background 0.2s;
      }
      .engage-minimize-btn:hover {
        background: rgba(255,255,255,0.2);
      }
      #engage-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 280px;
        max-height: 320px;
        background: ${isDark ? '#030712' : '#f9fafb'};
      }
      .engage-msg-row {
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }
      .engage-msg-row.user {
        justify-content: flex-end;
      }
      .engage-bot-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${primaryColor};
        color: ${textOnPrimary};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 11px;
      }
      .engage-user-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${isDark ? '#374151' : '#e5e7eb'};
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .engage-user-avatar svg {
        width: 14px;
        height: 14px;
        color: ${isDark ? '#d1d5db' : '#6b7280'};
      }
      .engage-message {
        max-width: 80%;
        padding: 10px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.5;
        word-wrap: break-word;
      }
      .engage-message.user {
        background: ${colors.userBubble};
        color: ${colors.userBubbleText};
        border-top-right-radius: 4px;
      }
      .engage-message.assistant {
        background: ${colors.assistantBubble};
        color: ${colors.assistantBubbleText};
        border-top-left-radius: 4px;
        ${colors.assistantBorder !== 'transparent' ? 'border: 1px solid ' + colors.assistantBorder + ';' : ''}
      }
      #engage-chat-input-area {
        padding: 12px;
        border-top: 1px solid ${colors.inputBorder};
        display: flex;
        align-items: center;
        gap: 8px;
        background: ${colors.bg};
      }
      .engage-input-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 12px;
        background: ${colors.inputBg};
      }
      #engage-chat-input {
        flex: 1;
        border: none;
        background: transparent;
        color: ${colors.text};
        font-size: 14px;
        outline: none;
      }
      #engage-chat-input::placeholder {
        color: ${colors.textSecondary};
      }
      #engage-chat-send {
        width: 32px;
        height: 32px;
        background: ${primaryColor};
        color: ${textOnPrimary};
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s;
        flex-shrink: 0;
      }
      #engage-chat-send:hover {
        opacity: 0.9;
      }
      #engage-chat-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .engage-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
      }
      .engage-typing span {
        width: 7px;
        height: 7px;
        background: ${colors.textSecondary};
        border-radius: 50%;
        animation: engage-bounce 1.4s ease-in-out infinite;
      }
      .engage-typing span:nth-child(2) { animation-delay: 0.15s; }
      .engage-typing span:nth-child(3) { animation-delay: 0.3s; }
      @keyframes engage-bounce {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
        30% { transform: translateY(-4px); opacity: 1; }
      }
      @media (max-width: 480px) {
        #engage-chat-window {
          width: calc(100vw - 40px);
          max-height: calc(100vh - 120px);
          bottom: 80px;
        }
      }
    `;
    document.head.appendChild(style);

    const userIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';

    const container = document.createElement('div');
    container.id = 'engage-chat-widget';
    container.innerHTML = 
      '<button id="engage-chat-toggle" aria-label="Open chat">' + getToggleContent() + '</button>' +
      '<div id="engage-chat-window">' +
        '<div id="engage-chat-header">' +
          '<div class="engage-header-avatar">' + getBotAvatarContent('md') + '</div>' +
          '<div class="engage-header-info"><h3>Chat with us</h3><p>Always online</p></div>' +
          '<button class="engage-minimize-btn" id="engage-chat-minimize">' + minimizeIconSVG + '</button>' +
        '</div>' +
        '<div id="engage-chat-messages"></div>' +
        '<div id="engage-chat-input-area">' +
          '<div class="engage-input-wrapper">' +
            '<input type="text" id="engage-chat-input" placeholder="Type a message..." />' +
            '<button id="engage-chat-send">' + sendIconSVG + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(container);

    const toggle = document.getElementById('engage-chat-toggle');
    const chatWindow = document.getElementById('engage-chat-window');
    const messagesEl = document.getElementById('engage-chat-messages');
    const input = document.getElementById('engage-chat-input');
    const sendBtn = document.getElementById('engage-chat-send');
    const minimizeBtn = document.getElementById('engage-chat-minimize');
    const headerTitle = container.querySelector('.engage-header-info h3');
    const headerSubtitle = container.querySelector('.engage-header-info p');

    function toggleChat() {
      isOpen = !isOpen;
      chatWindow.classList.toggle('open', isOpen);
      toggle.innerHTML = isOpen ? closeIconSVG : getToggleContent();
      if (isOpen) {
        input.focus();
        if (!chatbotConfig) fetchConfig();
      }
    }

    toggle.addEventListener('click', toggleChat);
    minimizeBtn.addEventListener('click', function() {
      isOpen = false;
      chatWindow.classList.remove('open');
      toggle.innerHTML = getToggleContent();
    });

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function renderMessages() {
      var html = '';
      for (var i = 0; i < messages.length; i++) {
        var m = messages[i];
        if (m.role === 'user') {
          html += '<div class="engage-msg-row user">' +
            '<div class="engage-message user">' + escapeHtml(m.content) + '</div>' +
            '<div class="engage-user-avatar">' + userIconSVG + '</div>' +
          '</div>';
        } else {
          var content = m.content ? escapeHtml(m.content) : '<div class="engage-typing"><span></span><span></span><span></span></div>';
          html += '<div class="engage-msg-row">' +
            '<div class="engage-bot-avatar">' + getBotAvatarContent('sm') + '</div>' +
            '<div class="engage-message assistant">' + content + '</div>' +
          '</div>';
        }
      }
      if (isLoading) {
        html += '<div class="engage-msg-row">' +
          '<div class="engage-bot-avatar">' + getBotAvatarContent('sm') + '</div>' +
          '<div class="engage-message assistant"><div class="engage-typing"><span></span><span></span><span></span></div></div>' +
        '</div>';
      }
      messagesEl.innerHTML = html;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    async function sendMessage() {
      var text = input.value.trim();
      if (!text || isLoading) return;

      messages.push({ role: 'user', content: text });
      input.value = '';
      renderMessages();

      var qaMatch = findQAMatch(text);
      if (qaMatch) {
        messages.push({ role: 'assistant', content: qaMatch });
        renderMessages();
        return;
      }

      isLoading = true;
      sendBtn.disabled = true;
      renderMessages();

      try {
        var response = await fetch(SUPABASE_URL + '/functions/v1/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            messages: messages.filter(function(m) { return m.role !== 'assistant' || m !== messages[messages.length - 1]; })
              .map(function(m) { return { role: m.role, content: m.content }; }),
            botId: botId
          })
        });

        if (!response.ok) {
          var error = await response.json();
          throw new Error(error.error || 'Failed to get response');
        }

        var contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          var data = await response.json();
          var content = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : "I couldn't find relevant information.";
          messages.push({ role: 'assistant', content: content });
        } else {
          var reader = response.body.getReader();
          var decoder = new TextDecoder();
          var assistantMessage = '';
          var buffer = '';

          while (true) {
            var result = await reader.read();
            if (result.done) break;

            buffer += decoder.decode(result.value, { stream: true });
            var lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (var j = 0; j < lines.length; j++) {
              var line = lines[j];
              if (line.startsWith('data: ')) {
                var lineData = line.slice(6).trim();
                if (lineData === '[DONE]') continue;
                try {
                  var parsed = JSON.parse(lineData);
                  var deltaContent = parsed.choices && parsed.choices[0] && parsed.choices[0].delta ? parsed.choices[0].delta.content : null;
                  if (deltaContent) {
                    assistantMessage += deltaContent;
                    var lastMsg = messages[messages.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      lastMsg.content = assistantMessage;
                    } else {
                      messages.push({ role: 'assistant', content: assistantMessage });
                    }
                    isLoading = false;
                    renderMessages();
                  }
                } catch (e) {}
              }
            }
          }

          if (!assistantMessage) {
            messages.push({ role: 'assistant', content: "I'm sorry, I couldn't generate a response." });
          }
        }
      } catch (error) {
        console.error('EngageChat error:', error);
        messages.push({ role: 'assistant', content: error.message || 'Sorry, something went wrong.' });
      } finally {
        isLoading = false;
        sendBtn.disabled = false;
        renderMessages();
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sendMessage();
    });

    fetchConfig().then(function() {
      if (chatbotConfig) {
        headerTitle.textContent = chatbotConfig.name || 'Chat with us';
        headerSubtitle.textContent = chatbotConfig.description || 'Always online';
      }
    });

    console.log('EngageChat: Widget initialized successfully');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();