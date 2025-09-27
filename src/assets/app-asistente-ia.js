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
            const requestBody = JSON.stringify({ input: { query: userMessage } });
            console.log('Client-side request body:', requestBody); // Add this line
            const response = await fetch('http://127.0.0.1:5001/expanded-system-469904-v9/us-central1/generalKnowledgeQueryFlow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Remove loading indicator
            messagesContainer.removeChild(loadingMessageDiv);

            const assistantMessage = data.output ? data.output.answer : "No se recibió respuesta del asistente.";
            addMessage(assistantMessage, 'ai');
            chatHistory.push({ role: 'model', parts: [{ text: assistantMessage }] });

        } catch (error) {
            console.error('Error al comunicarse con el asistente de IA:', error);
            // Remove loading indicator
            messagesContainer.removeChild(loadingMessageDiv);
            addMessage('Lo siento, hubo un error al obtener la respuesta del asistente.', 'ai');
        }
    });
});