const { contextBridge, ipcRenderer } = require('electron');

// Expor API segura para o renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Controles de janela
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),

    // Comunicação com backend
    sendMessage: (message) => {
        return fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        }).then(res => res.json());
    },

    // Gerenciar credenciais
    saveCredential: (toolName, data) => {
        return fetch('http://localhost:3000/api/credentials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ toolName, data })
        }).then(res => res.json());
    },

    getCredentials: () => {
        return fetch('http://localhost:3000/api/credentials')
            .then(res => res.json());
    },

    // Histórico
    getHistory: () => {
        return fetch('http://localhost:3000/api/history')
            .then(res => res.json());
    },

    // Ferramentas disponíveis
    getTools: () => {
        return fetch('http://localhost:3000/api/tools')
            .then(res => res.json());
    }
});

console.log('🔒 Preload Script - Security Bridge Active');
