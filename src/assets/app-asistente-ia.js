// src/assets/app-asistente-ia.js
document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('asistente-fab');
  const chatWindow = document.getElementById('asistente-chat-window');
  const closeBtn = document.getElementById('asistente-close-btn');
  const form = document.getElementById('asistente-form');
  const input = document.getElementById('asistente-input');
  const messagesContainer = document.getElementById('asistente-messages');

  // --- State ---
  let chatHistory = []; // [{ role: 'user' | 'model', parts: [{ text: '...' }] }]

  // --- Event Listeners ---
  fab.addEventListener('click', () => toggleChatWindow(true));
  closeBtn.addEventListener('click', () => toggleChatWindow(false));
  form.addEventListener('submit', handleFormSubmit);

  // --- Functions ---
  function toggleChatWindow(show) {
    if (show) {
      chatWindow.classList.remove('hidden');
      fab.classList.add('hidden');
    } else {
      chatWindow.classList.add('hidden');
      fab.classList.remove('hidden');
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const userMessage = input.value.trim();
    if (!userMessage) return;

    // Add user message to UI and history
    addMessage(userMessage, 'user');
    chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    input.value = '';

    // Add loading indicator
    const loadingElement = addMessage('', 'ai', true);

    try {
      // --- IMPORTANT ---
      // The URL for the cloud function needs to be updated after deployment.
      // This is a placeholder URL.
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: userMessage,
          history: chatHistory.slice(0, -1) // Send history without the current user message
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const aiMessage = data.text;

      // Remove loading and add AI response
      loadingElement.remove();
      addMessage(aiMessage, 'ai');
      chatHistory.push({ role: 'model', parts: [{ text: aiMessage }] });

    } catch (error) {
      console.error('Error fetching AI response:', error);
      loadingElement.remove();
      addMessage(`Lo siento, ocurrió un error. Por favor, revisa la consola para más detalles.`, 'ai');
    }
  }

  function addMessage(text, sender, isLoading = false) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `message message-${sender}`;
    if (isLoading) {
        messageWrapper.classList.add('loading');
    }

    const p = document.createElement('p');
    p.textContent = text;
    messageWrapper.appendChild(p);
    
    messagesContainer.appendChild(messageWrapper);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return messageWrapper;
  }

  // Initially hide the chat window and show the FAB
  toggleChatWindow(false);
});
