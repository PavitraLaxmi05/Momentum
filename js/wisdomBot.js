// Wisdom Bot Frontend Chat Widget
// Requires: markdown-it (for rendering bot responses)

const wisdomBotWidget = (() => {
  const chatContainer = document.createElement('div');
  chatContainer.id = 'wisdom-bot-chat';
  chatContainer.className = 'fixed bottom-6 right-6 z-50 w-80 max-w-full bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col';
  chatContainer.style.display = 'none'; // start hidden
  chatContainer.innerHTML = `
    <div class="flex items-center justify-between px-4 py-2 bg-green-600 dark:bg-green-700 rounded-t-lg">
      <span class="font-bold text-white">Wisdom Bot</span>
      <button id="wisdom-bot-close" class="text-white hover:text-gray-200">&times;</button>
    </div>
    <div id="wisdom-bot-messages" class="flex-1 overflow-y-auto px-4 py-2 space-y-2" style="max-height: 300px;"></div>
    <form id="wisdom-bot-form" class="flex items-center px-4 py-2 border-t border-gray-200 dark:border-gray-700">
      <input id="wisdom-bot-input" type="text" placeholder="Ask Sage..." class="flex-1 px-3 py-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none" maxlength="500" required />
      <button type="submit" class="ml-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Send</button>
    </form>
    <div id="wisdom-bot-typing" class="px-4 py-2 text-sm text-gray-500 dark:text-gray-300 hidden">Sage is typing...</div>
  `;

  document.body.appendChild(chatContainer);

  // Accessibility
  chatContainer.setAttribute('role', 'dialog');
  chatContainer.setAttribute('aria-label', 'Wisdom Bot Chat');

  // Collapsible widget
  document.getElementById('wisdom-bot-close').onclick = () => {
    chatContainer.style.display = 'none';
  };

  const messagesDiv = document.getElementById('wisdom-bot-messages');
  const form = document.getElementById('wisdom-bot-form');
  const input = document.getElementById('wisdom-bot-input');
  const typingDiv = document.getElementById('wisdom-bot-typing');

  // Markdown renderer
  const md = window.markdownit();

  // Chat history in session
  let chatHistory = JSON.parse(sessionStorage.getItem('wisdomBotHistory') || '[]');
  function renderHistory() {
    messagesDiv.innerHTML = '';
    chatHistory.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `p-2 rounded ${msg.sender === 'user' ? 'bg-gray-100 dark:bg-gray-800 text-right' : 'bg-green-50 dark:bg-green-900 text-left'}`;
      msgDiv.innerHTML = msg.sender === 'user'
        ? `<span class='font-semibold'>You:</span> ${md.renderInline(msg.text)}`
        : `<span class='font-semibold text-green-700 dark:text-green-400'>Sage:</span> ${md.render(msg.text)}`;
      messagesDiv.appendChild(msgDiv);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
  renderHistory();

  // Send message
  form.onsubmit = async (e) => {
    e.preventDefault();
    const userMsg = input.value.trim();
    if (!userMsg) return;
    chatHistory.push({ sender: 'user', text: userMsg });
    sessionStorage.setItem('wisdomBotHistory', JSON.stringify(chatHistory));
    renderHistory();
    input.value = '';
    typingDiv.classList.remove('hidden');
    form.querySelector('button').disabled = true;
    try {
      // Check if we're in development mode (using local server)
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      let data;
      
      if (isDev) {
        // In development mode, use mock wisdom responses
        console.log('Development mode: Using mock wisdom response');
        
        // Create mock wisdom responses based on user input
        const mockResponses = {
          default: "Wisdom comes to those who seek it with an open heart and mind.",
          hello: "Greetings, seeker of wisdom. How may I illuminate your path today?",
          sustainability: "The Earth does not belong to us; we belong to the Earth. What we do to the planet, we do to ourselves.",
          recycling: "When we reuse what we have, we honor both the past and the future.",
          climate: "Climate action is not just about saving the planet, but about creating a more just and equitable world for all.",
          energy: "The most sustainable energy is the energy we don't use. Conservation is the foundation of true sustainability."
        };
        
        // Determine which response to use based on keywords in the user message
        const lowerMsg = userMsg.toLowerCase();
        let response = mockResponses.default;
        
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
          response = mockResponses.hello;
        } else if (lowerMsg.includes('sustain')) {
          response = mockResponses.sustainability;
        } else if (lowerMsg.includes('recycl')) {
          response = mockResponses.recycling;
        } else if (lowerMsg.includes('climate') || lowerMsg.includes('warming')) {
          response = mockResponses.climate;
        } else if (lowerMsg.includes('energy') || lowerMsg.includes('power')) {
          response = mockResponses.energy;
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        data = { success: true, wisdom: response };
      } else {
        // In production mode, use real API
        const res = await fetch('/api/wisdom/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMsg })
        });
        data = await res.json();
      }
      
      if (data.success && data.wisdom) {
        chatHistory.push({ sender: 'sage', text: data.wisdom });
        sessionStorage.setItem('wisdomBotHistory', JSON.stringify(chatHistory));
        renderHistory();
      } else {
        chatHistory.push({ sender: 'sage', text: 'Sorry, I could not fetch wisdom right now.' });
        renderHistory();
      }
    } catch (err) {
      chatHistory.push({ sender: 'sage', text: 'Error connecting to Sage. Please try again.' });
      renderHistory();
    }
    typingDiv.classList.add('hidden');
    form.querySelector('button').disabled = false;
  };

  // Typing indicator
  input.oninput = () => {
    typingDiv.classList.add('hidden');
  };

  // Responsive
  window.addEventListener('resize', () => {
    chatContainer.style.maxWidth = window.innerWidth < 500 ? '95vw' : '320px';
  });
})();

// 🔗 Link the navbar button to open the widget
document.addEventListener("DOMContentLoaded", () => {
  const wisdomBtn = document.getElementById("open-wisdom-bot");
  const chatContainer = document.getElementById("wisdom-bot-chat");

  if (wisdomBtn && chatContainer) {
    wisdomBtn.addEventListener("click", (e) => {
      e.preventDefault();
      chatContainer.style.display = "flex"; // show widget
    });
  }
});
