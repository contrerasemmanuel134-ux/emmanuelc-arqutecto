import { db } from '../../firebase/client';
import {
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,
    limit
} from "firebase/firestore";

document.addEventListener('DOMContentLoaded', () => {
    const fab = document.getElementById('asistente-fab');
    const chatWindow = document.getElementById('asistente-chat-window');
    const closeBtn = document.getElementById('asistente-close-btn');
    const terminalForm = document.getElementById('terminal-form');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');

    const commandsCollection = collection(db, 'agent_commands');

    // --- Basic Window Interactivity ---

    fab.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            terminalInput.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.add('hidden');
    });

    terminalOutput.addEventListener('click', () => {
        terminalInput.focus();
    });

    // --- Terminal Logic ---

    function addTerminalLine(text, className) {
        const line = document.createElement('div');
        line.classList.add('terminal-line');
        if (className) {
            line.classList.add(className);
        }
        line.appendChild(document.createTextNode(text));
        terminalOutput.appendChild(line);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    addTerminalLine("Conectando con el agente...", "agent-response");
    const unsubscribe = onSnapshot(query(collection(db, 'agent_commands'), limit(1)), 
        () => {
            addTerminalLine("Conexión establecida. Listo para enviar comandos.", "agent-response");
            unsubscribe();
        },
        () => {
            addTerminalLine("Error: No se pudo conectar con la base de datos.", "agent-response");
            unsubscribe();
        }
    );

    // Handle form submission
    terminalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const commandText = terminalInput.value.trim();
        if (!commandText) return;

        addTerminalLine(commandText, 'user-command');
        terminalInput.value = '';

        sendCommandToAgent(commandText);
    });

    async function sendCommandToAgent(commandText) {
        try {
            // Send command to Firestore
            await addDoc(commandsCollection, {
                command: commandText,
                timestamp: serverTimestamp()
            });

            // Display local confirmation
            addTerminalLine(`> Comando "${commandText}" enviado al agente.`, 'agent-response');

        } catch (error) {
            console.error("Error sending command:", error);
            addTerminalLine("Error: No se pudo enviar el comando a Firestore.", "agent-response");
        }
    }
});
