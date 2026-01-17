const EventEmitter = require('events');

/**
 * AutonomousLoop - Loop de execução contínua 24/7
 * Executa verificações e ações automáticas em background
 */
class AutonomousLoop extends EventEmitter {
    constructor() {
        super();
        this.isRunning = false;
        this.loopInterval = 60000; // 1 minuto padrão
        this.checks = new Map();
        this.stats = {
            startedAt: null,
            totalCycles: 0,
            totalChecks: 0,
            errors: 0
        };
    }

    /**
     * Inicia o loop autônomo
     */
    async start() {
        if (this.isRunning) {
            console.log('[AutonomousLoop] ⚠️ Já está rodando');
            return false;
        }

        this.isRunning = true;
        this.stats.startedAt = new Date().toISOString();

        console.log('[AutonomousLoop] 🚀 Sistema autônomo iniciado');
        console.log(`[AutonomousLoop] Intervalo: ${this.loopInterval}ms`);
        console.log(`[AutonomousLoop] Checks registrados: ${this.checks.size}`);

        this.emit('started');
        this.runLoop();

        return true;
    }

    /**
     * Loop principal de execução
     */
    async runLoop() {
        while (this.isRunning) {
            const cycleStart = Date.now();
            this.stats.totalCycles++;

            try {
                // Executa todos os checks registrados
                for (const [name, checkData] of this.checks.entries()) {
                    try {
                        // Verifica se o check deve ser executado
                        const shouldRun = !checkData.condition || await checkData.condition();

                        if (shouldRun) {
                            await this.executeCheck(name, checkData);
                        }
                    } catch (error) {
                        this.stats.errors++;
                        console.error(`[AutonomousLoop] ❌ Erro no check ${name}:`, error.message);
                        this.emit('check-error', { name, error });
                    }
                }

                const cycleDuration = Date.now() - cycleStart;

                if (cycleDuration > this.loopInterval * 0.8) {
                    console.warn(`[AutonomousLoop] ⚠️ Ciclo lento: ${cycleDuration}ms`);
                }

                // Aguarda próximo ciclo
                await this.sleep(Math.max(0, this.loopInterval - cycleDuration));

            } catch (error) {
                this.stats.errors++;
                console.error('[AutonomousLoop] ❌ Erro crítico no loop:', error);
                this.emit('critical-error', error);

                // Auto-recovery: aguarda 5 segundos antes de continuar
                await this.sleep(5000);
            }
        }

        console.log('[AutonomousLoop] Loop finalizado');
        this.emit('stopped');
    }

    /**
     * Executa um check individual
     */
    async executeCheck(name, checkData) {
        const startTime = Date.now();

        try {
            await checkData.fn();
            this.stats.totalChecks++;

            const duration = Date.now() - startTime;

            // Atualiza estatísticas do check
            checkData.lastRun = new Date().toISOString();
            checkData.lastDuration = duration;
            checkData.successCount = (checkData.successCount || 0) + 1;

            this.emit('check-completed', { name, duration });

        } catch (error) {
            checkData.errorCount = (checkData.errorCount || 0) + 1;
            checkData.lastError = {
                message: error.message,
                timestamp: new Date().toISOString()
            };
            throw error;
        }
    }

    /**
     * Registra um check/ação autônoma
     * @param {string} name - Nome do check
     * @param {Function} fn - Função a executar
     * @param {Object} options - Opções (condition, priority, etc)
     */
    registerCheck(name, fn, options = {}) {
        if (this.checks.has(name)) {
            console.warn(`[AutonomousLoop] ⚠️ Check ${name} já existe, substituindo...`);
        }

        this.checks.set(name, {
            fn,
            condition: options.condition,
            priority: options.priority || 0,
            createdAt: new Date().toISOString(),
            successCount: 0,
            errorCount: 0
        });

        console.log(`[AutonomousLoop] ✅ Check registrado: ${name}`);
        this.emit('check-registered', { name });

        return true;
    }

    /**
     * Remove um check
     */
    unregisterCheck(name) {
        const removed = this.checks.delete(name);
        if (removed) {
            console.log(`[AutonomousLoop] 🗑️ Check removido: ${name}`);
            this.emit('check-unregistered', { name });
        }
        return removed;
    }

    /**
     * Para o loop
     */
    stop() {
        if (!this.isRunning) {
            console.log('[AutonomousLoop] ⚠️ Já está parado');
            return false;
        }

        this.isRunning = false;
        console.log('[AutonomousLoop] ⏸️ Parando sistema autônomo...');

        return true;
    }

    /**
     * Altera o intervalo do loop
     */
    setInterval(ms) {
        const oldInterval = this.loopInterval;
        this.loopInterval = ms;
        console.log(`[AutonomousLoop] 🔄 Intervalo alterado: ${oldInterval}ms → ${ms}ms`);
        this.emit('interval-changed', { oldInterval, newInterval: ms });
    }

    /**
     * Obtém status atual do loop
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            interval: this.loopInterval,
            checks: Array.from(this.checks.entries()).map(([name, data]) => ({
                name,
                successCount: data.successCount,
                errorCount: data.errorCount,
                lastRun: data.lastRun,
                lastDuration: data.lastDuration,
                lastError: data.lastError
            })),
            stats: {
                ...this.stats,
                uptime: this.stats.startedAt ? Date.now() - new Date(this.stats.startedAt).getTime() : 0
            }
        };
    }

    /**
     * Obtém estatísticas de um check específico
     */
    getCheckStats(name) {
        const checkData = this.checks.get(name);
        if (!checkData) return null;

        return {
            name,
            successCount: checkData.successCount,
            errorCount: checkData.errorCount,
            successRate: checkData.successCount / (checkData.successCount + checkData.errorCount) * 100,
            lastRun: checkData.lastRun,
            lastDuration: checkData.lastDuration,
            lastError: checkData.lastError,
            createdAt: checkData.createdAt
        };
    }

    /**
     * Helper: sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Força execução de todos os checks agora
     */
    async runNow() {
        console.log('[AutonomousLoop] ⚡ Execução manual de todos os checks...');

        for (const [name, checkData] of this.checks.entries()) {
            try {
                await this.executeCheck(name, checkData);
            } catch (error) {
                console.error(`[AutonomousLoop] Erro em ${name}:`, error.message);
            }
        }

        console.log('[AutonomousLoop] ✅ Execução manual concluída');
    }
}

// Export singleton
module.exports = new AutonomousLoop();
