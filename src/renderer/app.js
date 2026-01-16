// Window Controls
document.getElementById('minimize-btn').addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
});

document.getElementById('maximize-btn').addEventListener('click', () => {
    window.electronAPI.maximizeWindow();
});

document.getElementById('close-btn').addEventListener('click', () => {
    window.electronAPI.closeWindow();
});

// Elements
const welcomeScreen = document.getElementById('welcome-screen');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const settingsModal = document.getElementById('settings-modal');
const settingsBtn = document.getElementById('settings-btn');
const closeSettings = document.getElementById('close-settings');

let isFirstMessage = true;

// Settings Modal
settingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});

closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

// Message Input
messageInput.addEventListener('input', () => {
    sendBtn.disabled = !messageInput.value.trim();
    autoResize(messageInput);
});

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (messageInput.value.trim()) {
            sendMessage();
        }
    }
});

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

sendBtn.addEventListener('click', sendMessage);

// Send Message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // Hide welcome screen on first message
    if (isFirstMessage) {
        welcomeScreen.style.display = 'none';
        messagesContainer.style.display = 'flex';
        isFirstMessage = false;
    }

    // Add user message to UI
    addMessageToUI('user', message);
    messageInput.value = '';
    messageInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Update status
    updateStatus('processing', 'Processando...');

    try {
        // Send to backend
        const response = await window.electronAPI.sendMessage(message);

        // Add agent response to UI
        addMessageToUI('agent', response.message);

        // Update status
        updateStatus('online', 'Pronto para ajudar');

        // Update tools list if credentials were saved
        if (response.credentialsSaved) {
            loadTools();
        }
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        addMessageToUI('agent', '❌ Erro ao processar mensagem. Verifique se o backend está rodando.');
        updateStatus('error', 'Erro na comunicação');
    }
}

// Add Message to UI
function addMessageToUI(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '👤' : '⚡';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Update Status
function updateStatus(type, message) {
    const statusElement = document.getElementById('status');
    const dot = statusElement.querySelector('.status-dot');

    dot.className = 'status-dot';

    if (type === 'online') {
        dot.classList.add('online');
    } else if (type === 'processing') {
        dot.style.background = 'var(--warning)';
        dot.style.boxShadow = '0 0 8px var(--warning)';
    } else if (type === 'error') {
        dot.style.background = 'var(--error)';
        dot.style.boxShadow = '0 0 8px var(--error)';
    }

    statusElement.innerHTML = `<span class="status-dot ${type === 'online' ? 'online' : ''}"></span> ${message}`;
}

// Load Tools
async function loadTools() {
    try {
        const tools = await window.electronAPI.getTools();
        const toolsList = document.getElementById('tools-list');
        toolsList.innerHTML = '';

        tools.slice(0, 5).forEach(tool => {
            const toolItem = document.createElement('div');
            toolItem.className = 'tool-item';
            toolItem.innerHTML = `
        <span class="tool-icon">${tool.icon || '🔧'}</span>
        <span class="tool-name">${tool.name}</span>
        <span class="tool-status ${tool.connected ? 'connected' : 'disconnected'}">
          ${tool.connected ? '✓' : '○'}
        </span>
      `;
            toolsList.appendChild(toolItem);
        });
    } catch (error) {
        console.error('Erro ao carregar ferramentas:', error);
    }
}

// Load History
async function loadHistory() {
    try {
        const history = await window.electronAPI.getHistory();
        const chatHistory = document.getElementById('chat-history');
        chatHistory.innerHTML = '';

        // Show latest 5 conversations
        history.slice(-5).forEach(conv => {
            const historyItem = document.createElement('div');
            historyItem.className = 'chat-history-item';
            historyItem.textContent = conv.preview || 'Nova conversa';
            historyItem.style.padding = '8px';
            historyItem.style.background = 'var(--bg-tertiary)';
            historyItem.style.borderRadius = '6px';
            historyItem.style.cursor = 'pointer';
            historyItem.style.fontSize = '13px';
            chatHistory.appendChild(historyItem);
        });
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('⚡ Agente Tesla 2026 - Frontend Initialized');
    updateStatus('online', 'Pronto para ajudar');
    loadTools();
    loadHistory();
});

// New Chat Button
document.querySelector('.new-chat-btn').addEventListener('click', () => {
    messagesContainer.innerHTML = '';
    messagesContainer.style.display = 'none';
    welcomeScreen.style.display = 'flex';
    isFirstMessage = true;
});
