// Environment configuration (using defaults)
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./database/db');
const Agent = require('./agent');

// 🤖 AUTONOMOUS SYSTEM IMPORTS
const taskScheduler = require('./autonomy/TaskScheduler');
const autonomousLoop = require('./autonomy/AutonomousLoop');
const eventBus = require('./autonomy/EventBus');

// 🧠 LEARNING SYSTEM IMPORTS
const WebResearchAgent = require('./learning/WebResearchAgent');
const memorySystem = require('./learning/MemorySystem');
const learningLoop = require('./learning/LearningLoop');

// 💰 REVENUE GENERATION IMPORTS
const opportunityHunter = require('./revenue/OpportunityHunter');
const contentCreator = require('./revenue/ContentCreator');
const revenueOptimizer = require('./revenue/RevenueOptimizer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
const db = new Database();

// Initialize Agent
const agent = new Agent(db);

// 🌐 Integrate EventBus webhooks
app.use('/api/webhooks', eventBus.getWebhookRouter());

// 🌐 ROTA RAIZ - INTERFACE COMPLETA TESLA
const publicRouter = require('./routes/public');
app.use('/', publicRouter);



// Routes
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        message: 'Agente Tesla 2026 Backend Running',
        version: '1.0.0',
        autonomous: {
            loopRunning: autonomousLoop.isRunning,
            scheduledTasks: taskScheduler.listTasks().length,
            checks: autonomousLoop.getStatus().checks.length
        },
        learning: {
            isLearning: learningLoop.isLearning,
            topics: learningLoop.learningTopics.length,
            totalKnowledge: memorySystem.getLearningStats()?.totalKnowledge || 0
        },
        revenue: {
            opportunities: opportunityHunter.getSavedOpportunities().length,
            contentCreated: contentCreator.getCreatedContent().length,
            experiments: revenueOptimizer.experiments.length
        }
    });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('📨 Received message:', message);

        // Process message with agent
        const response = await agent.processMessage(message);

        // Save to conversation history
        db.saveConversation('user', message);
        db.saveConversation('agent', response.message);

        res.json(response);
    } catch (error) {
        console.error('❌ Error processing message:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Credentials endpoints
app.get('/api/credentials', (req, res) => {
    try {
        const credentials = db.getAllCredentials();
        res.json(credentials);
    } catch (error) {
        console.error('Error getting credentials:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/credentials', (req, res) => {
    try {
        const { toolName, data } = req.body;

        if (!toolName || !data) {
            return res.status(400).json({ error: 'toolName and data are required' });
        }

        db.saveCredential(toolName, data);
        res.json({ success: true, message: 'Credential saved' });
    } catch (error) {
        console.error('Error saving credential:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/credentials/:toolName', (req, res) => {
    try {
        const { toolName } = req.params;
        db.deleteCredential(toolName);
        res.json({ success: true, message: 'Credential deleted' });
    } catch (error) {
        console.error('Error deleting credential:', error);
        res.status(500).json({ error: error.message });
    }
});

// History endpoint
app.get('/api/history', (req, res) => {
    try {
        const history = db.getConversationHistory();
        res.json(history);
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Tools endpoint
app.get('/api/tools', (req, res) => {
    try {
        const tools = agent.getAvailableTools();
        res.json(tools);
    } catch (error) {
        console.error('Error getting tools:', error);
        res.status(500).json({ error: error.message });
    }
});

// Logs endpoint
app.get('/api/logs', (req, res) => {
    try {
        const logs = db.getActionLogs();
        res.json(logs);
    } catch (error) {
        console.error('Error getting logs:', error);
        res.status(500).json({ error: error.message });
    }
});

// 🤖 AUTONOMOUS SYSTEM ENDPOINTS

// Get autonomous system status
app.get('/api/autonomous/status', (req, res) => {
    try {
        res.json(autonomousLoop.getStatus());
    } catch (error) {
        console.error('Error getting autonomous status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Toggle autonomous loop
app.post('/api/autonomous/toggle', (req, res) => {
    try {
        if (autonomousLoop.isRunning) {
            autonomousLoop.stop();
            res.json({ status: 'stopped', message: 'Autonomous loop paused' });
        } else {
            autonomousLoop.start();
            res.json({ status: 'running', message: 'Autonomous loop started' });
        }
    } catch (error) {
        console.error('Error toggling autonomous loop:', error);
        res.status(500).json({ error: error.message });
    }
});

// List scheduled tasks
app.get('/api/tasks', (req, res) => {
    try {
        const tasks = taskScheduler.listTasks();
        res.json({ tasks });
    } catch (error) {
        console.error('Error listing tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get task history
app.get('/api/tasks/:name/history', (req, res) => {
    try {
        const history = taskScheduler.getHistory(req.params.name);
        const stats = taskScheduler.getStats(req.params.name);
        res.json({ history, stats });
    } catch (error) {
        console.error('Error getting task history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get event history
app.get('/api/events/history', (req, res) => {
    try {
        const { event, limit } = req.query;
        const history = eventBus.getHistory(event, parseInt(limit) || 50);
        const stats = eventBus.getStats();
        res.json({ history, stats });
    } catch (error) {
        console.error('Error getting event history:', error);
        res.status(500).json({ error: error.message });
    }
});

// 🧠 LEARNING SYSTEM ENDPOINTS

// Get learning system status
app.get('/api/learning/status', (req, res) => {
    try {
        res.json(learningLoop.getStatus());
    } catch (error) {
        console.error('Error getting learning status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start/stop learning loop
app.post('/api/learning/toggle', (req, res) => {
    try {
        if (learningLoop.isLearning) {
            learningLoop.stop();
            res.json({ status: 'stopped', message: 'Learning loop paused' });
        } else {
            const { intervalHours } = req.body;
            learningLoop.start(intervalHours || 24);
            res.json({ status: 'running', message: 'Learning loop started' });
        }
    } catch (error) {
        console.error('Error toggling learning:', error);
        res.status(500).json({ error: error.message });
    }
});

// Learn about a specific topic
app.post('/api/learning/learn', async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const result = await learningLoop.learnAbout(topic);
        res.json(result);
    } catch (error) {
        console.error('Error learning topic:', error);
        res.status(500).json({ error: error.message });
    }
});

// Search knowledge base
app.get('/api/knowledge/search', (req, res) => {
    try {
        const { q, limit } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const results = memorySystem.searchKnowledge(q, parseInt(limit) || 5);
        res.json({ query: q, results });
    } catch (error) {
        console.error('Error searching knowledge:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ask question (uses memory + web research)
app.post('/api/learning/ask', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const answer = await learningLoop.answerFromMemory(question);
        res.json(answer);
    } catch (error) {
        console.error('Error answering question:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add learning topic
app.post('/api/learning/topics', (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({ error: 'Topic is required' });
        }

        const added = learningLoop.addLearningTopic(topic);
        res.json({
            success: added,
            message: added ? 'Topic added' : 'Topic already exists'
        });
    } catch (error) {
        console.error('Error adding topic:', error);
        res.status(500).json({ error: error.message });
    }
});

// Remove learning topic
app.delete('/api/learning/topics/:topic', (req, res) => {
    try {
        const { topic } = req.params;
        const removed = learningLoop.removeLearningTopic(topic);

        res.json({
            success: removed,
            message: removed ? 'Topic removed' : 'Topic not found'
        });
    } catch (error) {
        console.error('Error removing topic:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get memory statistics
app.get('/api/memory/stats', (req, res) => {
    try {
        const stats = memorySystem.getLearningStats();
        res.json(stats);
    } catch (error) {
        console.error('Error getting memory stats:', error);
        res.status(500).json({ error: error.message });
    }
});

// 💰 REVENUE GENERATION ENDPOINTS

// Test revenue system
app.get('/api/revenue/test', (req, res) => {
    res.json({
        message: 'Sistema de geração de renda ATIVO! 💰',
        endpoints: [
            'GET /api/revenue/arbitrage',
            'POST /api/revenue/create-article',
            'POST /api/revenue/optimize-price'
        ]
    });
});

// 🚀 AUTONOMOUS SYSTEM INITIALIZATION
async function startAutonomousSystem() {
    console.log('\n🤖 ============================================');
    console.log('🤖  INICIANDO SISTEMA AUTÔNOMO');
    console.log('🤖 ============================================\n');

    try {
        // Example 1: VPS Health Check (every 6 hours)
        taskScheduler.scheduleTask(
            'vps-health-check',
            '0 */6 * * *', // Every 6 hours
            async () => {
                console.log('🔍 Verificando saúde da VPS...');
                const VPSRecoveryAgent = require('./tools/vpsRecoveryAgent');
                const vpsAgent = new VPSRecoveryAgent();
                const result = await vpsAgent.testSSHConnection();

                if (result.status !== 'success') {
                    eventBus.emit('vps-down', result);
                    console.log('⚠️ VPS com problemas!');
                } else {
                    console.log('✅ VPS online e funcionando');
                }
            },
            {
                onError: (error) => {
                    console.error('❌ Erro ao verificar VPS:', error.message);
                }
            }
        );

        // Example 2: Clean old task history (daily at 3 AM)
        taskScheduler.scheduleTask(
            'cleanup-history',
            '0 3 * * *', // Daily at 3 AM
            async () => {
                console.log('🗑️ Limpando histórico antigo...');
                const removed = taskScheduler.cleanOldHistory(30); // Keep 30 days
                console.log(`✅ ${removed} registros removidos`);
            }
        );

        // Example 3: System health check in autonomous loop
        autonomousLoop.registerCheck('system-health', async () => {
            const memUsage = process.memoryUsage();
            const memPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

            if (memPercent > 90) {
                eventBus.emit('high-memory-usage', {
                    percent: memPercent,
                    heapUsed: memUsage.heapUsed,
                    heapTotal: memUsage.heapTotal
                });
                console.warn(`⚠️ Uso de memória alto: ${memPercent.toFixed(2)}%`);
            }
        });

        // Event listener: Handle VPS down
        eventBus.on('vps-down', async (data) => {
            console.log('🚨 ALERTA: VPS está offline!');
            console.log('Dados:', data);
            // Aqui você pode adicionar notificação por voz, email, etc.
        });

        // Event listener: Handle high memory
        eventBus.on('high-memory-usage', (data) => {
            console.log(`⚠️ Memória crítica: ${data.percent.toFixed(2)}%`);
            // Trigger garbage collection ou outras ações
        });

        // Start autonomous loop
        await autonomousLoop.start();

        console.log('\n✅ Sistema Autônomo Inicializado!');
        console.log(`✅ Tarefas agendadas: ${taskScheduler.listTasks().length}`);
        console.log(`✅ Checks registrados: ${autonomousLoop.getStatus().checks.length}`);
        console.log('🤖 ============================================\n');

    } catch (error) {
        console.error('❌ Erro ao iniciar sistema autônomo:', error);
    }
}

// 🧠 LEARNING SYSTEM INITIALIZATION
async function startLearningSystem() {
    console.log('\n🧠 ============================================');
    console.log('🧠  INICIANDO SISTEMA DE APRENDIZADO');
    console.log('🧠 ============================================\n');

    try {
        // Iniciar loop de aprendizado (a cada 24 horas)
        await learningLoop.start(24);

        // Adicionar evento: aprender quando usuário faz pergunta
        eventBus.on('user-question', async (data) => {
            console.log(`[Learning] 📚 Nova pergunta detectada: ${data.question}`);

            // Tenta responder com conhecimento
            const answer = await learningLoop.answerFromMemory(data.question);

            if (answer.source === 'web') {
                console.log('[Learning] 🌐 Resposta obtida da web e salva na memória');
            } else if (answer.source === 'memory') {
                console.log('[Learning] 💾 Resposta obtida da memória');
            }
        });

        console.log('\n✅ Sistema de Aprendizado Inicializado!');
        console.log(`✅ Tópicos de aprendizado: ${learningLoop.learningTopics.length}`);
        console.log(`✅ Conhecimento acumulado: ${memorySystem.getLearningStats()?.totalKnowledge || 0} itens`);
        console.log('🧠 ============================================\n');

    } catch (error) {
        console.error('❌ Erro ao iniciar sistema de aprendizado:', error);
    }
}

// Start server
app.listen(PORT, async () => {
    console.log('⚡ ============================================');
    console.log('⚡  AGENTE TESLA 2026 - BACKEND SERVER');
    console.log('⚡ ============================================');
    console.log(`⚡  Server running on: http://localhost:${PORT}`);
    console.log('⚡  Status: ONLINE');
    console.log('⚡  Database: Connected');
    console.log('⚡  AI Agent: Ready');
    console.log('⚡ ============================================');

    // Initialize autonomous system
    await startAutonomousSystem();

    // Initialize learning system
    await startLearningSystem();
});

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
