
// ===== VOICE CONTROL INTEGRATION =====

// Microphone Button Handler
document.addEventListener('DOMContentLoaded', () => {
    const micBtn = document.getElementById('mic-btn');

    if (micBtn) {
        micBtn.addEventListener('click', () => {
            if (window.voiceManager) {
                const isActive = window.voiceManager.toggleAutoListen();

                if (isActive) {
                    console.log('🎤 Modo voz ATIVADO - Fale agora!');
                    updateStatus('online', '🎤 Modo voz ativo - Fale!');
                } else {
                    console.log('🎤 Modo voz DESATIVADO');
                    updateStatus('online', 'Pronto para ajudar');
                }
            } else {
                console.error('Voice Manager não disponível');
                alert('❌ Sistema de voz não está disponível.\n\nVerifique se o navegador suporta reconhecimento de voz.');
            }
        });
    }

    // Override addMessageToUI to add voice response
    if (window.voiceManager) {
        const originalSendMessage = window.sendMessage;

        window.sendMessage = async function () {
            await originalSendMessage();

            // Get last agent message and speak it
            const messages = document.querySelectorAll('.message.agent');
            if (messages.length > 0) {
                const lastMessage = messages[messages.length - 1];
                const messageText = lastMessage.querySelector('.message-content').textContent;

                if (window.voiceManager.autoListen) {
                    setTimeout(() => {
                        window.voiceManager.speak(messageText);
                    }, 500);
                }
            }
        };
    }
});

console.log('🎤 Voice integration loaded');
