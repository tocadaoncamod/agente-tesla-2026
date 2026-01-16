const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Função para iniciar backend SILENCIOSAMENTE (sem janela)
function startBackendSilent() {
    const backendPath = path.join(__dirname, 'backend/server.js');

    // Spawn com windowsHide para não mostrar janela preta
    backendProcess = spawn('node', [backendPath], {
        windowsHide: true,  // ESCONDE janela no Windows
        detached: false,
        stdio: 'ignore'     // Ignora output (sem logs visíveis)
    });

    console.log('⚡ Backend iniciado silenciosamente');

    backendProcess.on('error', (err) => {
        console.error('Erro no backend:', err);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        icon: path.join(__dirname, '../assets/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'hidden',
        frame: false,
        backgroundColor: '#0a0a0a',
        show: false  // Não mostrar até estar pronto
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

    // Mostrar apenas quando estiver completamente carregado
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        console.log('✨ Interface pronta!');
    });

    // Abrir DevTools apenas em modo development
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Inicializar aplicação
app.whenReady().then(() => {
    console.log('🚀 Agente Tesla 2026 - Iniciando...');

    // 1. Iniciar backend PRIMEIRO (silencioso)
    startBackendSilent();

    // 2. Aguardar 3 segundos para backend iniciar
    setTimeout(() => {
        // 3. Criar janela principal
        createWindow();
    }, 3000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Fechar aplicação COMPLETA
app.on('window-all-closed', () => {
    // Matar backend
    if (backendProcess) {
        try {
            process.kill(backendProcess.pid);
            console.log('🛑 Backend encerrado');
        } catch (err) {
            console.error('Erro ao encerrar backend:', err);
        }
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Garantir que backend seja morto ao fechar app
app.on('before-quit', () => {
    if (backendProcess) {
        try {
            process.kill(backendProcess.pid);
        } catch (err) {
            // Ignorar erro
        }
    }
});

// IPC Handlers
ipcMain.handle('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.handle('close-window', () => {
    if (mainWindow) mainWindow.close();
});

console.log('⚡ Agente Tesla 2026 - Main Process Ready');
