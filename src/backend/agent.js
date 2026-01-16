const Database = require('./database/db');
const ToolRouter = require('./tools/toolRouter');
const SystemCommands = require('./tools/systemCommands');

class Agent {
    constructor(database) {
        this.db = database;
        this.toolRouter = new ToolRouter(database);
        this.systemCommands = new SystemCommands();
    }

    async processMessage(userMessage) {
        const startTime = Date.now();

        try {
            console.log('🤖 Agent processing:', userMessage);

            // Analyze intent
            const intent = this.analyzeIntent(userMessage);
            console.log('🎯 Intent detected:', intent.type);

            // Get appropriate tool
            const tool = await this.selectTool(intent);

            if (!tool) {
                return {
                    message: this.getHelpfulResponse(userMessage, intent),
                    intent: intent.type,
                    duration: Date.now() - startTime
                };
            }

            // Execute action
            const result = await this.executeAction(tool, intent, userMessage);

            // Save log
            this.db.saveActionLog(tool.name, intent.type, true, Date.now() - startTime);

            return {
                message: result.message,
                tool: tool.name,
                intent: intent.type,
                duration: Date.now() - startTime,
                credentialsSaved: result.credentialsSaved || false
            };

        } catch (error) {
            console.error('❌ Agent error:', error);

            this.db.saveActionLog('unknown', 'error', false, Date.now() - startTime);

            return {
                message: `❌ Erro ao processar: ${error.message}`,
                error: true,
                duration: Date.now() - startTime
            };
        }
    }

    analyzeIntent(message) {
        const lowerMessage = message.toLowerCase();

        // Email
        if (lowerMessage.includes('email') || lowerMessage.includes('enviar mensagem')) {
            return { type: 'send_email', keywords: ['email', 'enviar'] };
        }

        // File management
        if (lowerMessage.includes('arquivo') || lowerMessage.includes('pasta') || lowerMessage.includes('backup')) {
            return { type: 'file_management', keywords: ['arquivo', 'pasta', 'backup'] };
        }

        // GitHub
        if (lowerMessage.includes('repositório') || lowerMessage.includes('github') || lowerMessage.includes('git')) {
            return { type: 'github', keywords: ['github', 'repositório'] };
        }

        // Calendar
        if (lowerMessage.includes('agenda') || lowerMessage.includes('reunião') || lowerMessage.includes('evento')) {
            return { type: 'calendar', keywords: ['agenda', 'reunião'] };
        }

        // Task management
        if (lowerMessage.includes('tarefa') || lowerMessage.includes('todo') || lowerMessage.includes('lembrete')) {
            return { type: 'tasks', keywords: ['tarefa', 'lembrete'] };
        }

        // System commands
        if (lowerMessage.includes('executar') || lowerMessage.includes('comando') || lowerMessage.includes('abrir')) {
            return { type: 'system_command', keywords: ['executar', 'comando', 'abrir'] };
        }

        // General question
        return { type: 'general', keywords: [] };
    }

    async selectTool(intent) {
        const toolMapping = {
            'send_email': { name: 'Gmail', icon: '📧' },
            'file_management': { name: 'Drive', icon: '📂' },
            'github': { name: 'GitHub', icon: '💻' },
            'calendar': { name: 'Calendar', icon: '📅' },
            'tasks': { name: 'Todoist', icon: '✓' },
            'system_command': { name: 'System', icon: '⚙️' }
        };

        return toolMapping[intent.type] || null;
    }

    async executeAction(tool, intent, message) {
        // Check if credentials exist
        const credential = this.db.getCredential(tool.name);

        if (!credential && tool.name !== 'System') {
            return {
                message: `🔐 Para usar ${tool.icon} ${tool.name}, preciso de credenciais.\n\n` +
                    `Por favor, configure em: Configurações > API Keys\n\n` +
                    `Após configurar, suas credenciais serão salvas de forma segura (AES-256) ` +
                    `e não precisará fornecer novamente!`,
                credentialsSaved: false
            };
        }

        // Execute based on tool
        switch (tool.name) {
            case 'System':
                return this.executeSystemCommand(message);

            case 'Gmail':
                return {
                    message: `📧 Email será enviado via Gmail!\n\n` +
                        `✅ Credenciais carregadas\n` +
                        `🎯 Processando: "${message}"\n\n` +
                        `(Integração completa será implementada em breve)`,
                    credentialsSaved: true
                };

            case 'GitHub':
                return {
                    message: `💻 Ação no GitHub será executada!\n\n` +
                        `✅ Credenciais carregadas\n` +
                        `🎯 Processando: "${message}"\n\n` +
                        `(Integração completa será implementada em breve)`,
                    credentialsSaved: true
                };

            default:
                return {
                    message: `${tool.icon} Ferramenta ${tool.name} identificada!\n\n` +
                        `Ação: "${message}"\n\n` +
                        `✅ Sistema pronto para executar\n` +
                        `(Integração em desenvolvimento)`,
                    credentialsSaved: true
                };
        }
    }

    executeSystemCommand(message) {
        const lowerMessage = message.toLowerCase();

        // Detect command type
        if (lowerMessage.includes('abrir')) {
            return {
                message: `⚙️ Comando do sistema detectado!\n\n` +
                    `📝 Mensagem: "${message}"\n\n` +
                    `Para segurança, comandos do sistema requerem confirmação explícita.\n` +
                    `Funcionalidade completa será implementada em breve.`,
                credentialsSaved: false
            };
        }

        return {
            message: `⚙️ Comando: "${message}"\n\n` +
                `Sistema pronto para execução.\n` +
                `(Comandos requerem confirmação por segurança)`,
            credentialsSaved: false
        };
    }

    getHelpfulResponse(message, intent) {
        const responses = {
            general: `Olá! Sou o Agente Tesla 2026 ⚡\n\n` +
                `Pergunta: "${message}"\n\n` +
                `Posso ajudar você com:\n` +
                `📧 Emails (Gmail, Outlook)\n` +
                `💻 GitHub (repositórios, issues)\n` +
                `📂 Arquivos (Drive, backup)\n` +
                `📅 Agenda (Calendar, eventos)\n` +
                `✓ Tarefas (Todoist, listas)\n` +
                `⚙️ Comandos do sistema\n\n` +
                `Como posso ajudar especificamente?`
        };

        return responses[intent.type] || responses.general;
    }

    getAvailableTools() {
        return [
            { name: 'Gmail', icon: '📧', category: 'Email', connected: !!this.db.getCredential('Gmail') },
            { name: 'GitHub', icon: '💻', category: 'Dev', connected: !!this.db.getCredential('GitHub') },
            { name: 'Drive', icon: '📂', category: 'Files', connected: !!this.db.getCredential('Drive') },
            { name: 'Calendar', icon: '📅', category: 'Productivity', connected: !!this.db.getCredential('Calendar') },
            { name: 'Slack', icon: '💬', category: 'Communication', connected: !!this.db.getCredential('Slack') },
            { name: 'Todoist', icon: '✓', category: 'Tasks', connected: !!this.db.getCredential('Todoist') },
            { name: 'System', icon: '⚙️', category: 'System', connected: true }
        ];
    }
}

module.exports = Agent;
