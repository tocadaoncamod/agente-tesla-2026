const db = require('../database/db');

/**
 * MemorySystem - Sistema de memória de longo prazo
 * Armazena e recupera conhecimento acumulado
 */
class MemorySystem {
    constructor() {
        this.initDatabase();
    }

    /**
     * Inicializa tabelas de memória
     */
    initDatabase() {
        try {
            // Tabela de conhecimento
            db.prepare(`
        CREATE TABLE IF NOT EXISTS knowledge_base (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          topic TEXT NOT NULL,
          content TEXT NOT NULL,
          source TEXT,
          relevance REAL DEFAULT 1.0,
          access_count INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          last_accessed TEXT
        )
      `).run();

            // Tabela de aprendizados
            db.prepare(`
        CREATE TABLE IF NOT EXISTS learnings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          context TEXT NOT NULL,
          input TEXT NOT NULL,
          output TEXT NOT NULL,
          feedback TEXT,
          success_score REAL,
          created_at TEXT NOT NULL
        )
      `).run();

            // Tabela de preferências do usuário
            db.prepare(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          preference_key TEXT NOT NULL,
          preference_value TEXT NOT NULL,
          confidence REAL DEFAULT 0.5,
          updated_at TEXT NOT NULL
        )
      `).run();

            // Índices
            db.prepare(`CREATE INDEX IF NOT EXISTS idx_topic ON knowledge_base(topic)`).run();
            db.prepare(`CREATE INDEX IF NOT EXISTS idx_created ON knowledge_base(created_at)`).run();

            console.log('[MemorySystem] ✅ Database de memória inicializado');
        } catch (error) {
            console.error('[MemorySystem] Erro ao inicializar:', error);
        }
    }

    /**
     * Salva conhecimento na base
     */
    saveKnowledge(topic, content, source = 'web') {
        try {
            db.prepare(`
        INSERT INTO knowledge_base (topic, content, source, created_at)
        VALUES (?, ?, ?, ?)
      `).run(topic, content, source, new Date().toISOString());

            console.log(`[MemorySystem] 💾 Conhecimento salvo: ${topic}`);
            return true;
        } catch (error) {
            console.error('[MemorySystem] Erro ao salvar conhecimento:', error);
            return false;
        }
    }

    /**
     * Busca conhecimento por tópico
     */
    searchKnowledge(query, limit = 5) {
        try {
            const results = db.prepare(`
        SELECT * FROM knowledge_base
        WHERE topic LIKE ? OR content LIKE ?
        ORDER BY relevance DESC, access_count DESC
        LIMIT ?
      `).all(`%${query}%`, `%${query}%`, limit);

            // Atualiza contador de acesso
            results.forEach(result => {
                db.prepare(`
          UPDATE knowledge_base
          SET access_count = access_count + 1,
              last_accessed = ?
          WHERE id = ?
        `).run(new Date().toISOString(), result.id);
            });

            console.log(`[MemorySystem] 🔍 Encontrados ${results.length} conhecimentos`);
            return results;

        } catch (error) {
            console.error('[MemorySystem] Erro na busca:', error);
            return [];
        }
    }

    /**
     * Registra aprendizado de interação
     */
    recordLearning(context, input, output, feedback = null, successScore = null) {
        try {
            db.prepare(`
        INSERT INTO learnings (context, input, output, feedback, success_score, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
                context,
                input,
                output,
                feedback,
                successScore,
                new Date().toISOString()
            );

            console.log('[MemorySystem] 📚 Aprendizado registrado');
            return true;
        } catch (error) {
            console.error('[MemorySystem] Erro ao registrar aprendizado:', error);
            return false;
        }
    }

    /**
     * Aprende preferência do usuário
     */
    learnPreference(category, key, value, confidence = 0.7) {
        try {
            // Verifica se já existe
            const existing = db.prepare(`
        SELECT * FROM user_preferences
        WHERE category = ? AND preference_key = ?
      `).get(category, key);

            if (existing) {
                // Atualiza com média ponderada
                const newConfidence = (existing.confidence + confidence) / 2;

                db.prepare(`
          UPDATE user_preferences
          SET preference_value = ?,
              confidence = ?,
              updated_at = ?
          WHERE id = ?
        `).run(value, newConfidence, new Date().toISOString(), existing.id);

            } else {
                // Insere novo
                db.prepare(`
          INSERT INTO user_preferences (category, preference_key, preference_value, confidence, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(category, key, value, confidence, new Date().toISOString());
            }

            console.log(`[MemorySystem] 🎯 Preferência aprendida: ${category}.${key} = ${value}`);
            return true;

        } catch (error) {
            console.error('[MemorySystem] Erro ao aprender preferência:', error);
            return false;
        }
    }

    /**
     * Obtém preferências do usuário
     */
    getPreferences(category = null) {
        try {
            if (category) {
                return db.prepare(`
          SELECT * FROM user_preferences
          WHERE category = ?
          ORDER BY confidence DESC
        `).all(category);
            } else {
                return db.prepare(`
          SELECT * FROM user_preferences
          ORDER BY category, confidence DESC
        `).all();
            }
        } catch (error) {
            console.error('[MemorySystem] Erro ao obter preferências:', error);
            return [];
        }
    }

    /**
     * Obtém estatísticas de aprendizado
     */
    getLearningStats() {
        try {
            const stats = {
                totalKnowledge: db.prepare('SELECT COUNT(*) as count FROM knowledge_base').get().count,
                totalLearnings: db.prepare('SELECT COUNT(*) as count FROM learnings').get().count,
                totalPreferences: db.prepare('SELECT COUNT(*) as count FROM user_preferences').get().count,
                mostAccessedKnowledge: db.prepare(`
          SELECT topic, access_count FROM knowledge_base
          ORDER BY access_count DESC
          LIMIT 5
        `).all(),
                recentLearnings: db.prepare(`
          SELECT * FROM learnings
          ORDER BY created_at DESC
          LIMIT 5
        `).all()
            };

            return stats;
        } catch (error) {
            console.error('[MemorySystem] Erro ao obter stats:', error);
            return null;
        }
    }

    /**
     * Limpa conhecimentos pouco relevantes
     */
    cleanLowRelevance(threshold = 0.3) {
        try {
            const result = db.prepare(`
        DELETE FROM knowledge_base
        WHERE relevance < ? AND access_count < 2
      `).run(threshold);

            console.log(`[MemorySystem] 🗑️ Removidos ${result.changes} conhecimentos pouco relevantes`);
            return result.changes;
        } catch (error) {
            console.error('[MemorySystem] Erro ao limpar:', error);
            return 0;
        }
    }

    /**
     * Obtém contexto relevante para uma pergunta
     */
    getRelevantContext(query, limit = 3) {
        const knowledge = this.searchKnowledge(query, limit);

        if (knowledge.length === 0) return null;

        return {
            query,
            context: knowledge.map(k => ({
                topic: k.topic,
                content: k.content,
                source: k.source,
                relevance: k.relevance
            })),
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = new MemorySystem();
