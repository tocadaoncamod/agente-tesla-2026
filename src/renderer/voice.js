// Voice Recognition Manager for Agente Tesla 2026

class VoiceManager {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.isSpeaking = false;
        this.autoListen = false;

        this.init();
    }

    init() {
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Navegador não suporta reconhecimento de voz');
            return;
        }

        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();

        // Configure recognition
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'pt-BR';
        this.recognition.maxAlternatives = 1;

        // Event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateUI('listening');
            console.log('🎤 Escutando...');
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update interim transcript in UI
            if (interimTranscript) {
                this.showInterimText(interimTranscript);
            }

            // Process final transcript
            if (finalTranscript) {
                this.processFinalTranscript(finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Erro no reconhecimento de voz:', event.error);
            this.updateUI('error');

            if (event.error === 'no-speech') {
                console.log('Nenhuma fala detectada');
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateUI('idle');
            console.log('🎤 Parou de escutar');

            // Restart if auto-listen is on
            if (this.autoListen) {
                setTimeout(() => this.start(), 500);
            }
        };
    }

    start() {
        if (!this.recognition) {
            alert('Reconhecimento de voz não disponível neste navegador');
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Erro ao iniciar reconhecimento:', error);
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    toggleAutoListen() {
        this.autoListen = !this.autoListen;

        if (this.autoListen) {
            this.start();
        } else {
            this.stop();
        }

        return this.autoListen;
    }

    speak(text) {
        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.updateUI('speaking');
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateUI('idle');
        };

        this.synthesis.speak(utterance);
    }

    showInterimText(text) {
        const voiceIndicator = document.getElementById('voice-interim');
        if (voiceIndicator) {
            voiceIndicator.textContent = text;
            voiceIndicator.style.display = 'block';
        }
    }

    processFinalTranscript(text) {
        console.log('📝 Texto reconhecido:', text);

        // Clear interim text
        const voiceIndicator = document.getElementById('voice-interim');
        if (voiceIndicator) {
            voiceIndicator.style.display = 'none';
        }

        // Put text in input field
        const messageInput = document.getElementById('message-input');
        if (messageInput) {
            messageInput.value = text;
            messageInput.dispatchEvent(new Event('input'));

            // Auto-send if enabled
            if (this.autoSend) {
                setTimeout(() => {
                    const sendBtn = document.getElementById('send-btn');
                    if (sendBtn && !sendBtn.disabled) {
                        sendBtn.click();
                    }
                }, 500);
            }
        }
    }

    updateUI(state) {
        const micBtn = document.getElementById('mic-btn');
        const voiceStatus = document.getElementById('voice-status');

        if (!micBtn || !voiceStatus) return;

        switch (state) {
            case 'listening':
                micBtn.classList.add('listening');
                micBtn.classList.remove('speaking', 'error');
                voiceStatus.textContent = '🎤 Escutando...';
                voiceStatus.className = 'voice-status listening';
                break;

            case 'speaking':
                micBtn.classList.add('speaking');
                micBtn.classList.remove('listening', 'error');
                voiceStatus.textContent = '🔊 Falando...';
                voiceStatus.className = 'voice-status speaking';
                break;

            case 'error':
                micBtn.classList.add('error');
                micBtn.classList.remove('listening', 'speaking');
                voiceStatus.textContent = '❌ Erro';
                voiceStatus.className = 'voice-status error';
                setTimeout(() => this.updateUI('idle'), 2000);
                break;

            default:
                micBtn.classList.remove('listening', 'speaking', 'error');
                voiceStatus.textContent = this.autoListen ? '⚡ Modo voz ativo' : '';
                voiceStatus.className = 'voice-status';
        }
    }
}

// Initialize voice manager
window.voiceManager = new VoiceManager();
console.log('🎤 Voice Manager initialized');
