const axios = require('axios');
const cheerio = require('cheerio');

/**
 * WebResearchAgent - Agente de pesquisa na web
 * Busca informações, aprende novidades, monitora trends
 */
class WebResearchAgent {
    constructor() {
        this.searchEngines = {
            google: 'https://www.google.com/search?q=',
            bing: 'https://www.bing.com/search?q='
        };
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    }

    /**
     * Pesquisa um tópico e retorna resultados
     */
    async search(query, maxResults = 5) {
        try {
            console.log(`[WebResearch] 🔍 Pesquisando: "${query}"`);

            const searchUrl = `${this.searchEngines.google}${encodeURIComponent(query)}`;

            const response = await axios.get(searchUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            const results = [];

            // Extrair resultados do Google
            $('.g').each((i, elem) => {
                if (i >= maxResults) return false;

                const title = $(elem).find('h3').text();
                const link = $(elem).find('a').attr('href');
                const snippet = $(elem).find('.VwiC3b').text();

                if (title && link) {
                    results.push({
                        title,
                        link,
                        snippet,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            console.log(`[WebResearch] ✅ Encontrados ${results.length} resultados`);
            return results;

        } catch (error) {
            console.error('[WebResearch] ❌ Erro na pesquisa:', error.message);
            return [];
        }
    }

    /**
     * Extrai conteúdo de uma página
     */
    async fetchPageContent(url) {
        try {
            console.log(`[WebResearch] 📄 Lendo página: ${url}`);

            const response = await axios.get(url, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });

            const $ = cheerio.load(response.data);

            // Remove scripts e estilos
            $('script, style, nav, footer, header').remove();

            // Pega texto principal
            const content = $('article, main, .content, body').first().text();
            const cleaned = content.replace(/\s+/g, ' ').trim().substring(0, 5000);

            console.log(`[WebResearch] ✅ Extraídos ${cleaned.length} caracteres`);

            return {
                url,
                content: cleaned,
                title: $('title').text(),
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error(`[WebResearch] ❌ Erro ao ler ${url}:`, error.message);
            return null;
        }
    }

    /**
     * Pesquisa e extrai conteúdo completo
     */
    async deepResearch(query, maxPages = 3) {
        try {
            console.log(`[WebResearch] 🧠 Pesquisa profunda: "${query}"`);

            // 1. Buscar resultados
            const searchResults = await this.search(query, maxPages);

            if (searchResults.length === 0) {
                return { query, results: [], content: [] };
            }

            // 2. Extrair conteúdo de cada página
            const contentPromises = searchResults.map(result =>
                this.fetchPageContent(result.link)
            );

            const contents = await Promise.all(contentPromises);
            const validContents = contents.filter(c => c !== null);

            console.log(`[WebResearch] ✅ Pesquisa profunda concluída: ${validContents.length} páginas lidas`);

            return {
                query,
                results: searchResults,
                content: validContents,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('[WebResearch] ❌ Erro na pesquisa profunda:', error.message);
            return { query, results: [], content: [], error: error.message };
        }
    }

    /**
     * Monitora trends e novidades
     */
    async monitorTrends(topics = ['AI', 'technology', 'startups']) {
        console.log('[WebResearch] 📊 Monitorando trends...');

        const trendsData = [];

        for (const topic of topics) {
            const query = `${topic} news latest 2026`;
            const results = await this.search(query, 3);

            trendsData.push({
                topic,
                results,
                timestamp: new Date().toISOString()
            });

            // Delay para não sobrecarregar
            await this.sleep(2000);
        }

        console.log(`[WebResearch] ✅ Trends coletados para ${topics.length} tópicos`);
        return trendsData;
    }

    /**
     * Resumir conteúdo (simples)
     */
    summarize(text, maxLength = 200) {
        if (!text || text.length <= maxLength) return text;

        // Pega primeiras sentenças até o limite
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        let summary = '';

        for (const sentence of sentences) {
            if ((summary + sentence).length > maxLength) break;
            summary += sentence;
        }

        return summary || text.substring(0, maxLength) + '...';
    }

    /**
     * Helper: sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Pesquisar respostas para perguntas específicas
     */
    async findAnswer(question) {
        console.log(`[WebResearch] ❓ Buscando resposta para: "${question}"`);

        const research = await this.deepResearch(question, 2);

        if (research.content.length === 0) {
            return null;
        }

        // Combina conteúdos
        const combinedContent = research.content
            .map(c => c.content)
            .join('\n\n');

        // Retorna resumo
        return {
            question,
            answer: this.summarize(combinedContent, 500),
            sources: research.results.map(r => ({
                title: r.title,
                url: r.link
            })),
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = WebResearchAgent;
