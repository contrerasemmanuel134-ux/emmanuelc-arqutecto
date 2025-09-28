document.addEventListener('DOMContentLoaded', () => {
    const fab = document.getElementById('asistente-fab');
    const chatWindow = document.getElementById('asistente-chat-window');
    const closeBtn = document.getElementById('asistente-close-btn');
    const chatForm = document.getElementById('asistente-form');
    const chatInput = document.getElementById('asistente-input');
    const messagesContainer = document.getElementById('asistente-messages');

    let chatHistory = [];

    // Toggle chat window visibility
    fab.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    // Function to add a message to the chat window
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `message-${sender}`);
        messageDiv.innerHTML = `<p>${text}</p>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to bottom
    }

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;

        addMessage(userMessage, 'user');
        chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        chatInput.value = '';

        // Add a loading indicator
        const loadingMessageDiv = document.createElement('div');
        loadingMessageDiv.classList.add('message', 'message-ai', 'loading');
        loadingMessageDiv.innerHTML = `<p>...</p>`;
        messagesContainer.appendChild(loadingMessageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            // The new agent expects the entire chat history
            const requestBody = JSON.stringify({ history: chatHistory });
            
            const response = await fetch('http://localhost:8080/api/chatConAgente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido sin JSON.' }));
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
            }

            const data = await response.json();
            
            // Remove loading indicator
            messagesContainer.removeChild(loadingMessageDiv);

            // The new agent returns a 'response' field
            const assistantMessage = data.response ? data.response : "No se recibió respuesta del asistente.";
            addMessage(assistantMessage, 'ai');
            // The agent manages history, but we'll keep it here for the UI
            chatHistory.push({ role: 'model', parts: [{ text: assistantMessage }] });

        } catch (error) {
            console.error('Error al comunicarse con el asistente de IA:', error);
            // Remove loading indicator
            messagesContainer.removeChild(loadingMessageDiv);
            addMessage('Lo siento, hubo un error al obtener la respuesta del asistente.', 'ai');
        }
    });
});