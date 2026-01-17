const WebResearchAgent = require('../learning/WebResearchAgent');
const memorySystem = require('../learning/MemorySystem');

/**
 * ContentCreator - Cria conteúdo automatizado para SEO e marketing
 * Gera artigos, posts, descrições otimizadas
 */
class ContentCreator {
    constructor() {
        this.researchAgent = new WebResearchAgent();
        this.createdContent = [];
    }

    /**
     * Gera artigo SEO sobre um tópico
     */
    async generateSEOArticle(topic, keywords = []) {
        console.log(`[ContentCreator] ✍️ Criando artigo SEO: ${topic}`);

        try {
            // 1. Pesquisar informações
            const research = await this.researchAgent.deepResearch(topic, 3);

            if (research.content.length === 0) {
                return null;
            }

            // 2. Combinar conteúdos
            const combinedContent = research.content
                .map(c => c.content)
                .join('\n\n');

            // 3. Criar estrutura do artigo
            const article = {
                title: this.generateTitle(topic, keywords),
                meta_description: this.generateMetaDescription(topic),
                introduction: this.generateIntroduction(topic, combinedContent),
                body: this.generateBody(combinedContent),
                conclusion: this.generateConclusion(topic),
                keywords: keywords,
                word_count: 0,
                seo_score: 0,
                sources: research.results.map(r => r.link),
                createdAt: new Date().toISOString()
            };

            // 4. Calcular word count
            const fullText = `${article.introduction} ${article.body} ${article.conclusion}`;
            article.word_count = fullText.split(/\s+/).length;
            article.seo_score = this.calculateSEOScore(article, keywords);

            // 5. Salvar
            this.createdContent.push(article);

            memorySystem.saveKnowledge(
                `seo_article_${topic}`,
                JSON.stringify(article),
                'content_creation'
            );

            console.log(`[ContentCreator] ✅ Artigo criado: ${article.word_count} palavras`);
            return article;

        } catch (error) {
            console.error('[ContentCreator] Erro ao criar artigo:', error.message);
            return null;
        }
    }

    /**
     * Gera título otimizado
     */
    generateTitle(topic, keywords) {
        const templates = [
            `O Guia Completo sobre ${topic} em 2026`,
            `${topic}: Tudo o Que Você Precisa Saber`,
            `Como Dominar ${topic} - Guia Definitivo`,
            `${topic} - Estratégias e Melhores Práticas`
        ];

        let title = templates[Math.floor(Math.random() * templates.length)];

        // Adiciona keyword principal se fornecida
        if (keywords.length > 0) {
            title = `${keywords[0]}: ${title}`;
        }

        return title;
    }

    /**
     * Gera meta description
     */
    generateMetaDescription(topic) {
        return `Descubra tudo sobre ${topic}. Guia completo, atualizado e prático para você dominar este assunto. Leia mais!`;
    }

    /**
     * Gera introdução
     */
    generateIntroduction(topic, content) {
        const intro = this.researchAgent.summarize(content, 300);
        return `# Introdução\n\n${intro}\n\nNeste artigo, você aprenderá tudo sobre ${topic} de forma prática e objetiva.`;
    }

    /**
     * Gera corpo do artigo
     */
    generateBody(content) {
        // Divide conteúdo em seções
        const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
        const sections = [];

        // Cria 3-5 seções
        const sectionCount = Math.min(5, Math.floor(sentences.length / 3));
        const sentencesPerSection = Math.floor(sentences.length / sectionCount);

        for (let i = 0; i < sectionCount; i++) {
            const sectionSentences = sentences.slice(
                i * sentencesPerSection,
                (i + 1) * sentencesPerSection
            );

            sections.push({
                heading: `## Seção ${i + 1}`,
                content: sectionSentences.join(' ')
            });
        }

        return sections.map(s => `${s.heading}\n\n${s.content}`).join('\n\n');
    }

    /**
     * Gera conclusão
     */
    generateConclusion(topic) {
        return `## Conclusão\n\nAgora você conhece os aspectos fundamentais sobre ${topic}. Continue aprendendo e aplicando esses conhecimentos para obter os melhores resultados.`;
    }

    /**
     * Calcula score SEO
     */
    calculateSEOScore(article, keywords) {
        let score = 0;

        // Título tem keywords? +20
        if (keywords.some(k => article.title.toLowerCase().includes(k.toLowerCase()))) {
            score += 20;
        }

        // Meta description tem keywords? +10
        if (keywords.some(k => article.meta_description.toLowerCase().includes(k.toLowerCase()))) {
            score += 10;
        }

        // Word count adequado (800-2000)? +30
        if (article.word_count >= 800 && article.word_count <= 2000) {
            score += 30;
        } else if (article.word_count > 500) {
            score += 15;
        }

        // Tem introdução e conclusão? +20
        if (article.introduction && article.conclusion) {
            score += 20;
        }

        // Tem fontes? +20
        if (article.sources && article.sources.length > 0) {
            score += 20;
        }

        return score;
    }

    /**
     * Gera descrição de produto
     */
    async generateProductDescription(productName, category) {
        console.log(`[ContentCreator] 📦 Criando descrição de produto: ${productName}`);

        try {
            const query = `${productName} ${category} features benefits`;
            const research = await this.researchAgent.search(query, 3);

            if (research.length === 0) {
                return null;
            }

            // Extrair informações
            const features = this.extractFeatures(research);
            const benefits = this.extractBenefits(research);

            const description = {
                product: productName,
                category,
                tagline: `${productName} - A melhor escolha em ${category}`,
                short_description: this.researchAgent.summarize(
                    research.map(r => r.snippet).join(' '),
                    150
                ),
                features,
                benefits,
                cta: `Garanta já o seu ${productName}!`,
                createdAt: new Date().toISOString()
            };

            this.createdContent.push(description);

            console.log(`[ContentCreator] ✅ Descrição criada`);
            return description;

        } catch (error) {
            console.error('[ContentCreator] Erro ao criar descrição:', error.message);
            return null;
        }
    }

    /**
     * Extrai features de pesquisa
     */
    extractFeatures(results) {
        // Simplificado - seria NLP real
        const features = [
            'Alta qualidade',
            'Tecnologia avançada',
            'Design moderno',
            'Fácil de usar'
        ];

        return features.slice(0, 3);
    }

    /**
     * Extrai benefits de pesquisa
     */
    extractBenefits(results) {
        const benefits = [
            'Economize tempo',
            'Aumente produtividade',
            'Melhore resultados',
            'Satisfação garantida'
        ];

        return benefits.slice(0, 3);
    }

    /**
     * Gera post para redes sociais
     */
    generateSocialPost(topic, platform = 'twitter') {
        console.log(`[ContentCreator] 📱 Criando post para ${platform}: ${topic}`);

        const posts = {
            twitter: {
                maxLength: 280,
                template: `🔥 ${topic}\n\n[conteúdo]\n\n#hashtag #trend`
            },
            linkedin: {
                maxLength: 1300,
                template: `💡 ${topic}\n\n[conteúdo]\n\nO que você acha? Comente abaixo!`
            },
            instagram: {
                maxLength: 2200,
                template: `✨ ${topic}\n\n[conteúdo]\n\n📸 #hashtag #inspiration`
            }
        };

        const config = posts[platform] || posts.twitter;

        const post = {
            platform,
            topic,
            content: config.template.replace('[conteúdo]', `Aprenda sobre ${topic}`),
            hashtags: this.generateHashtags(topic),
            createdAt: new Date().toISOString()
        };

        return post;
    }

    /**
     * Gera hashtags relevantes
     */
    generateHashtags(topic) {
        const words = topic.split(' ');
        const hashtags = words
            .filter(w => w.length > 3)
            .map(w => `#${w.replace(/[^a-zA-Z0-9]/g, '')}`)
            .slice(0, 5);

        return hashtags;
    }

    /**
     * Obtém conteúdo criado
     */
    getCreatedContent(limit = 20) {
        return this.createdContent.slice(0, limit);
    }

    /**
     * Estatísticas de conteúdo
     */
    getStats() {
        return {
            totalContent: this.createdContent.length,
            averageWordCount: this.createdContent.reduce((sum, c) => sum + (c.word_count || 0), 0) / this.createdContent.length || 0,
            averageSEOScore: this.createdContent.reduce((sum, c) => sum + (c.seo_score || 0), 0) / this.createdContent.length || 0,
            byType: this.createdContent.reduce((acc, c) => {
                const type = c.product ? 'product' : c.word_count ? 'article' : 'post';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {})
        };
    }
}

module.exports = new ContentCreator();
