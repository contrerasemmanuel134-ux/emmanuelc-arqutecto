document.addEventListener('DOMContentLoaded', () => {
    const fab = document.getElementById('cliente-fab');
    const chatWindow = document.getElementById('cliente-chat-window');
    const closeBtn = document.getElementById('cliente-close-btn');
    const chatForm = document.getElementById('cliente-form');
    const chatInput = document.getElementById('cliente-input');
    const messagesContainer = document.getElementById('cliente-messages');
    const fabIconDefault = fab.querySelector('.cliente-fab__icon:not(.cliente-fab__icon--close)');
    const fabIconClose = fab.querySelector('.cliente-fab__icon--close');

    let chatHistory = []; // Aquí guardaremos la conversación

    // --- Funciones para manejar la visibilidad del chat ---
    const openChat = () => {
        chatWindow.classList.remove('hidden');
        fabIconDefault.classList.add('hidden');
        fabIconClose.classList.remove('hidden');
    };

    const closeChat = () => {
        chatWindow.classList.add('hidden');
        fabIconDefault.classList.remove('hidden');
        fabIconClose.classList.add('hidden');
    };

    fab.addEventListener('click', () => {
        chatWindow.classList.contains('hidden') ? openChat() : closeChat();
    });

    closeBtn.addEventListener('click', closeChat);

    // --- Funciones para manejar los mensajes ---
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `message-${sender}`);
        // Simple sanitization to prevent HTML injection
        const p = document.createElement('p');
        p.textContent = text;
        messageDiv.appendChild(p);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // --- Manejo del envío del formulario ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMessage(userMessage, 'user');
        chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        chatInput.value = '';
        chatInput.disabled = true;

        // Indicador de "escribiendo..."
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'message-ai');
        loadingDiv.innerHTML = '<p>...</p>';
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            // *** LLAMADA A LA NUEVA FIREBASE FUNCTION ***
            // Esta es la función "puente" que crearemos a continuación.
            const response = await fetch('http://127.0.0.1:5001/expanded-system-469904-v9/us-central1/chatConAgente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ history: chatHistory }),
            });

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            const assistantMessage = data.response;

            // Reemplazar el indicador de "escribiendo..." con la respuesta real
            loadingDiv.querySelector('p').textContent = assistantMessage;
            chatHistory.push({ role: 'model', parts: [{ text: assistantMessage }] });

        } catch (error) {
            console.error('Error al contactar al agente:', error);
            loadingDiv.querySelector('p').textContent = 'Lo siento, hubo un problema de conexión. Por favor, intenta de nuevo.';
        } finally {
            chatInput.disabled = false;
            chatInput.focus();
        }
    });
});
