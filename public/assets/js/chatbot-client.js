// public/assets/js/chatbot-client.js
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js";

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('chatbot-toggle-btn');
    const chatWindow = document.getElementById('chatbot-window');
    const chatForm = document.getElementById('chatbot-form');
    const chatInput = document.getElementById('chatbot-input');
    const messagesContainer = document.getElementById('chatbot-messages');

    if (!toggleBtn || !chatWindow || !chatForm || !chatInput || !messagesContainer) {
        console.error('Elementos del chatbot no encontrados.');
        return;
    }

    // Alternar visibilidad de la ventana de chat
    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
    });

    // Manejar envío del formulario
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        // Añadir mensaje del usuario a la UI
        addMessage(userMessage, 'user-message');
        chatInput.value = '';
        chatInput.disabled = true;

        // Mostrar indicador de "pensando"
        const thinkingIndicator = addMessage('...', 'bot-message thinking');

        try {
            // Llamar a la Cloud Function
            const functions = getFunctions();
            const askChatbot = httpsCallable(functions, 'askChatbot');
            const result = await askChatbot({ query: userMessage });

            // Reemplazar "pensando" con la respuesta real
            thinkingIndicator.remove();
            const botResponse = result.data.reply;
            addMessage(botResponse, 'bot-message');

        } catch (error) {
            console.error("Error al llamar a la Cloud Function:", error);
            thinkingIndicator.remove();
            addMessage('Lo siento, ocurrió un error. Por favor, intenta de nuevo.', 'bot-message');
        } finally {
            chatInput.disabled = false;
            chatInput.focus();
        }
    });

    /**
     * Añade un mensaje al contenedor de mensajes.
     * @param {string} text - El texto del mensaje.
     * @param {string} className - La clase CSS para el mensaje (user-message o bot-message).
     * @returns {HTMLElement} El elemento del mensaje creado.
     */
    function addMessage(text, className) {
        const messageWrapper = document.createElement('div');
        messageWrapper.className = `message ${className}`;

        const messageP = document.createElement('p');
        messageP.textContent = text;

        messageWrapper.appendChild(messageP);
        messagesContainer.appendChild(messageWrapper);

        // Scroll hacia el final
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        return messageWrapper;
    }
});