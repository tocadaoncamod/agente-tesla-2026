const EventEmitter = require('events');
const express = require('express');

/**
 * EventBus - Sistema de eventos centralizado
 * Permite comunicação entre componentes via eventos e webhooks
 */
class EventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(100); // Aumentar limite de listeners
        this.webhookRouter = express.Router();
        this.eventHistory = [];
        this.maxHistorySize = 1000;

        this.setupWebhooks();
        this.setupEventLogging();
    }

    /**
     * Configuração de rotas de webhook
     */
    setupWebhooks() {
        // Webhook genérico
        this.webhookRouter.post('/webhook/:event', (req, res) => {
            const eventName = req.params.event;
            const payload = req.body;
            const source = req.headers['x-source'] || 'webhook';

            console.log(`[EventBus] 📥 Webhook recebido: ${eventName}`, { source });

            this.emit(eventName, { ...payload, _source: source, _timestamp: new Date().toISOString() });

            res.json({
                success: true,
                message: `Event ${eventName} triggered`,
                timestamp: new Date().toISOString()
            });
        });

        // Endpoint para testar webhooks
        this.webhookRouter.get('/webhook/test', (req, res) => {
            res.json({
                message: 'Webhook system operational',
                endpoints: {
                    trigger: 'POST /webhook/:event',
                    list: 'GET /events',
                    history: 'GET /events/history'
                }
            });
        });

        console.log('[EventBus] ✅ Webhooks configurados');
    }

    /**
     * Logging automático de eventos
     */
    setupEventLogging() {
        // Intercepta todos os eventos para logging
        const originalEmit = this.emit.bind(this);

        this.emit = function (eventName, ...args) {
            // Não loga eventos internos do Node
            if (!eventName.startsWith('new') && eventName !== 'removeListener') {
                this.logEvent(eventName, args[0]);
            }

            return originalEmit(eventName, ...args);
        };
    }

    /**
     * Registra evento no histórico
     */
    logEvent(eventName, payload) {
        this.eventHistory.unshift({
            event: eventName,
            payload: payload,
            timestamp: new Date().toISOString()
        });

        // Limita tamanho do histórico
        if (this.eventHistory.length > this.maxHistorySize) {
            this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
        }
    }

    /**
     * Registra listener com condição
     * Só executa se a condição retornar true
     */
    onCondition(eventName, condition, handler) {
        this.on(eventName, async (payload) => {
            try {
                const shouldTrigger = await condition(payload);

                if (shouldTrigger) {
                    console.log(`[EventBus] ✅ Condição atendida para: ${eventName}`);
                    await handler(payload);
                } else {
                    console.log(`[EventBus] ⏭️ Condição NÃO atendida para: ${eventName}`);
                }
            } catch (error) {
                console.error(`[EventBus] ❌ Erro no handler condicional de ${eventName}:`, error);
            }
        });
    }

    /**
     * Registra listener com debounce
     * Evita execuções múltiplas em curto período
     */
    onDebounced(eventName, handler, delay = 1000) {
        let timeoutId = null;

        this.on(eventName, (payload) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(async () => {
                try {
                    await handler(payload);
                } catch (error) {
                    console.error(`[EventBus] Erro no handler debounced de ${eventName}:`, error);
                }
            }, delay);
        });
    }

    /**
     * Emite múltiplos eventos de uma vez
     */
    async emitMultiple(events) {
        for (const { name, payload } of events) {
            this.emit(name, payload);
        }
    }

    /**
     * Emite evento com delay
     */
    async emitLater(eventName, payload, delayMs) {
        setTimeout(() => {
            this.emit(eventName, payload);
        }, delayMs);
    }

    /**
     * Obtém histórico de eventos
     */
    getHistory(eventName = null, limit = 50) {
        let history = this.eventHistory;

        if (eventName) {
            history = history.filter(item => item.event === eventName);
        }

        return history.slice(0, limit);
    }

    /**
     * Obtém estatísticas de eventos
     */
    getStats() {
        const eventCounts = {};

        this.eventHistory.forEach(item => {
            eventCounts[item.event] = (eventCounts[item.event] || 0) + 1;
        });

        return {
            totalEvents: this.eventHistory.length,
            uniqueEvents: Object.keys(eventCounts).length,
            eventCounts,
            oldestEvent: this.eventHistory[this.eventHistory.length - 1],
            newestEvent: this.eventHistory[0],
            activeListeners: this.eventNames().length
        };
    }

    /**
     * Lista todos os eventos ativos (com listeners)
     */
    getActiveEvents() {
        return this.eventNames().map(name => ({
            name,
            listenerCount: this.listenerCount(name)
        }));
    }

    /**
     * Limpa histórico de eventos
     */
    clearHistory() {
        const count = this.eventHistory.length;
        this.eventHistory = [];
        console.log(`[EventBus] 🗑️ Histórico limpo (${count} eventos removidos)`);
        return count;
    }

    /**
     * Retorna router do Express para webhooks
     */
    getWebhookRouter() {
        return this.webhookRouter;
    }
}

// Export singleton
module.exports = new EventBus();
