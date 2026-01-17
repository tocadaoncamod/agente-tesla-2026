const WebResearchAgent = require('./WebResearchAgent');
const memorySystem = require('./MemorySystem');

/**
 * LearningLoop - Loop de aprendizado contínuo
 * Combina research + memória para aprendizado automático
 */
class LearningLoop {
    constructor() {
        this.researchAgent = new WebResearchAgent();
        this.isLearning = false;
        this.learningTopics = [
            'artificial intelligence 2026',
            'new technologies',
            'business automation',
            'productivity tools'
        ];
    }

    /**
     * Inicia loop de aprendizado
     */
    async start(intervalHours = 24) {
        if (this.isLearning) {
            console.log('[LearningLoop] ⚠️ Já está aprendendo');
            return;
        }

        this.isLearning = true;
        console.log('[LearningLoop] 🧠 Loop de aprendizado iniciado');
        console.log(`[LearningLoop] Intervalo: a cada ${intervalHours}h`);

        // Primeira execução imediata
        await this.executeResearch();

        // Agendar próximas execuções
        this.learningInterval = setInterval(
            () => this.executeResearch(),
            intervalHours * 60 * 60 * 1000
        );
    }

    /**
     * Para loop de aprendizado
     */
    stop() {
        if (this.learningInterval) {
            clearInterval(this.learningInterval);
            this.isLearning = false;
            console.log('[LearningLoop] ⏸️ Loop de aprendizado parado');
        }
    }

    /**
     * Executa ciclo de pesquisa e aprendizado
     */
    async executeResearch() {
        console.log('\n🧠 ========================================');
        console.log('🧠  INICIANDO CICLO DE APRENDIZADO');
        console.log('🧠 ========================================\n');

        try {
            for (const topic of this.learningTopics) {
                console.log(`\n📚 Pesquisando: ${topic}...`);

                // 1. Pesquisar na web
                const research = await this.researchAgent.deepResearch(topic, 2);

                if (research.content.length === 0) {
                    console.log(`⚠️ Nenhum conteúdo encontrado para: ${topic}`);
                    continue;
                }

                // 2. Processar e salvar conhecimento
                for (const content of research.content) {
                    const summary = this.researchAgent.summarize(content.content, 300);

                    memorySystem.saveKnowledge(
                        topic,
                        summary,
                        content.url
                    );
                }

                console.log(`✅ ${research.content.length} novos conhecimentos salvos`);

                // Delay entre tópicos
                await this.sleep(3000);
            }

            console.log('\n✅ Ciclo de aprendizado concluído!');
            console.log('🧠 ========================================\n');

        } catch (error) {
            console.error('[LearningLoop] ❌ Erro no ciclo de aprendizado:', error);
        }
    }

    /**
     * Pesquisa específica sob demanda
     */
    async learnAbout(topic) {
        console.log(`[LearningLoop] 🎯 Aprendendo sobre: ${topic}`);

        try {
            const research = await this.researchAgent.deepResearch(topic, 3);

            if (research.content.length === 0) {
                return {
                    success: false,
                    message: 'Nenhum conteúdo encontrado'
                };
            }

            // Salvar conhecimentos
            let saved = 0;
            for (const content of research.content) {
                const summary = this.researchAgent.summarize(content.content, 400);

                if (memorySystem.saveKnowledge(topic, summary, content.url)) {
                    saved++;
                }
            }

            return {
                success: true,
                knowledgeSaved: saved,
                sources: research.results.length,
                message: `Aprendi ${saved} novos conhecimentos sobre ${topic}`
            };

        } catch (error) {
            console.error('[LearningLoop] Erro ao aprender:', error);
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Responde pergunta usando conhecimento acumulado
     */
    async answerFromMemory(question) {
        console.log(`[LearningLoop] ❓ Respondendo com memória: "${question}"`);

        // 1. Buscar na memória primeiro
        const context = memorySystem.getRelevantContext(question, 3);

        if (context && context.context.length > 0) {
            console.log(`[LearningLoop] ✅ Encontrado contexto na memória`);

            // Combina conhecimentos
            const answer = context.context
                .map(k => k.content)
                .join('\n\n');

            return {
                answer,
                source: 'memory',
                confidence: 0.8,
                references: context.context.map(k => ({
                    topic: k.topic,
                    source: k.source
                }))
            };
        }

        // 2. Se não encontrou na memória, pesquisa na web
        console.log(`[LearningLoop] 🔍 Não encontrado na memória, pesquisando...`);

        const webAnswer = await this.researchAgent.findAnswer(question);

        if (webAnswer && webAnswer.answer) {
            // Salva o novo conhecimento
            memorySystem.saveKnowledge(
                question,
                webAnswer.answer,
                'web_research'
            );

            return {
                answer: webAnswer.answer,
                source: 'web',
                confidence: 0.6,
                references: webAnswer.sources
            };
        }

        return {
            answer: null,
            source: null,
            confidence: 0,
            message: 'Não consegui encontrar uma resposta'
        };
    }

    /**
     * Adiciona tópico de aprendizado
     */
    addLearningTopic(topic) {
        if (!this.learningTopics.includes(topic)) {
            this.learningTopics.push(topic);
            console.log(`[LearningLoop] ➕ Tópico adicionado: ${topic}`);
            return true;
        }
        return false;
    }

    /**
     * Remove tópico de aprendizado
     */
    removeLearningTopic(topic) {
        const index = this.learningTopics.indexOf(topic);
        if (index > -1) {
            this.learningTopics.splice(index, 1);
            console.log(`[LearningLoop] ➖ Tópico removido: ${topic}`);
            return true;
        }
        return false;
    }

    /**
     * Obtém status do sistema de aprendizado
     */
    getStatus() {
        const memStats = memorySystem.getLearningStats();

        return {
            isLearning: this.isLearning,
            topics: this.learningTopics,
            memory: memStats,
            lastResearch: this.lastResearchTime
        };
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = new LearningLoop();
