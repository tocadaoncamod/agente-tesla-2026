const cron = require('node-cron');
const db = require('../database/db');

/**
 * TaskScheduler - Sistema de tarefas agendadas
 * Permite agendar tarefas recorrentes usando sintaxe cron
 */
class TaskScheduler {
    constructor() {
        this.jobs = new Map();
        this.initDatabase();
    }

    /**
     * Inicializa tabela de execuções de tarefas
     */
    initDatabase() {
        try {
            db.prepare(`
        CREATE TABLE IF NOT EXISTS task_executions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          task_name TEXT NOT NULL,
          status TEXT NOT NULL,
          error_message TEXT,
          executed_at TEXT NOT NULL
        )
      `).run();

            db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_task_name ON task_executions(task_name)
      `).run();

            console.log('[TaskScheduler] ✅ Database inicializado');
        } catch (error) {
            console.error('[TaskScheduler] Erro ao inicializar DB:', error);
        }
    }

    /**
     * Agendar tarefa com cron syntax
     * @param {string} name - Nome da tarefa
     * @param {string} cronExpression - Expressão cron (ex: '0 9 * * *')
     * @param {Function} action - Função a executar
     * @param {Object} options - Opções adicionais
     */
    scheduleTask(name, cronExpression, action, options = {}) {
        if (this.jobs.has(name)) {
            console.warn(`[TaskScheduler] Tarefa ${name} já existe, substituindo...`);
            this.stopTask(name);
        }

        const job = cron.schedule(cronExpression, async () => {
            const startTime = Date.now();
            console.log(`[TaskScheduler] ⚡ Executando: ${name}`);

            try {
                await action();
                const duration = Date.now() - startTime;

                this.logExecution(name, 'success', null, duration);
                console.log(`[TaskScheduler] ✅ ${name} concluído em ${duration}ms`);

                if (options.onSuccess) {
                    options.onSuccess();
                }
            } catch (error) {
                const duration = Date.now() - startTime;
                console.error(`[TaskScheduler] ❌ Erro em ${name}:`, error.message);

                this.logExecution(name, 'error', error.message, duration);

                if (options.onError) {
                    options.onError(error);
                }

                // Retry logic
                if (options.retry) {
                    const retryDelay = options.retryDelay || 60000;
                    console.log(`[TaskScheduler] 🔄 Retry em ${retryDelay}ms...`);
                    setTimeout(() => action(), retryDelay);
                }
            }
        }, {
            scheduled: options.autoStart !== false,
            timezone: options.timezone || "America/Sao_Paulo"
        });

        this.jobs.set(name, {
            job,
            cronExpression,
            options,
            createdAt: new Date().toISOString()
        });

        console.log(`[TaskScheduler] ✅ Tarefa agendada: ${name} (${cronExpression})`);
        return job;
    }

    /**
     * Para uma tarefa agendada
     */
    stopTask(name) {
        const taskInfo = this.jobs.get(name);
        if (taskInfo) {
            taskInfo.job.stop();
            this.jobs.delete(name);
            console.log(`[TaskScheduler] ⏸️ Tarefa parada: ${name}`);
            return true;
        }
        return false;
    }

    /**
     * Lista todas as tarefas ativas
     */
    listTasks() {
        return Array.from(this.jobs.entries()).map(([name, info]) => ({
            name,
            cronExpression: info.cronExpression,
            createdAt: info.createdAt,
            options: info.options
        }));
    }

    /**
     * Obtém informações de uma tarefa específica
     */
    getTask(name) {
        const taskInfo = this.jobs.get(name);
        if (!taskInfo) return null;

        return {
            name,
            cronExpression: taskInfo.cronExpression,
            createdAt: taskInfo.createdAt,
            options: taskInfo.options,
            history: this.getHistory(name, 10)
        };
    }

    /**
     * Registra execução da tarefa
     */
    logExecution(taskName, status, errorMsg = null, duration = 0) {
        try {
            db.prepare(`
        INSERT INTO task_executions (task_name, status, error_message, executed_at)
        VALUES (?, ?, ?, ?)
      `).run(
                taskName,
                status,
                errorMsg,
                new Date().toISOString()
            );
        } catch (error) {
            console.error('[TaskScheduler] Erro ao logar execução:', error);
        }
    }

    /**
     * Obtém histórico de execuções
     */
    getHistory(taskName = null, limit = 50) {
        try {
            if (taskName) {
                return db.prepare(`
          SELECT * FROM task_executions 
          WHERE task_name = ? 
          ORDER BY executed_at DESC 
          LIMIT ?
        `).all(taskName, limit);
            } else {
                return db.prepare(`
          SELECT * FROM task_executions 
          ORDER BY executed_at DESC 
          LIMIT ?
        `).all(limit);
            }
        } catch (error) {
            console.error('[TaskScheduler] Erro ao obter histórico:', error);
            return [];
        }
    }

    /**
     * Obtém estatísticas de uma tarefa
     */
    getStats(taskName) {
        try {
            const stats = db.prepare(`
        SELECT 
          COUNT(*) as total_executions,
          SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
          SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed,
          MAX(executed_at) as last_execution
        FROM task_executions
        WHERE task_name = ?
      `).get(taskName);

            return stats;
        } catch (error) {
            console.error('[TaskScheduler] Erro ao obter stats:', error);
            return null;
        }
    }

    /**
     * Limpa histórico antigo
     */
    cleanOldHistory(daysToKeep = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            const result = db.prepare(`
        DELETE FROM task_executions
        WHERE executed_at < ?
      `).run(cutoffDate.toISOString());

            console.log(`[TaskScheduler] 🗑️ Removidas ${result.changes} execuções antigas`);
            return result.changes;
        } catch (error) {
            console.error('[TaskScheduler] Erro ao limpar histórico:', error);
            return 0;
        }
    }
}

// Export singleton
module.exports = new TaskScheduler();
