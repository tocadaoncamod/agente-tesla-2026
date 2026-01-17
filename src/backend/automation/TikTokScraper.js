const browserController = require('./BrowserController');

/**
 * TikTokScraper - Busca produtos no TikTok Shopping
 * Você VÊ o Tesla procurando produtos na sua tela!
 */
class TikTokScraper {
    constructor() {
        this.page = null;
        this.productsFound = [];
    }

    /**
     * Inicializa scraper com página do navegador
     */
    async initialize() {
        this.page = await browserController.start(false); // Navegador VISÍVEL!
        return this.page;
    }

    /**
     * Busca produtos por categoria
     */
    async scrapeProducts(categories = ['masculino', 'feminino', 'infantil']) {
        console.log('[TikTokScraper] 🔍 Iniciando busca de produtos...');

        const searchTerms = {
            masculino: [
                'camiseta masculina',
                'calça masculina',
                'tênis masculino',
                'jaqueta masculina',
                'shorts masculino'
            ],
            feminino: [
                'blusa feminina',
                'vestido feminino',
                'bolsa feminina',
                'sapato feminino',
                'saia feminina'
            ],
            infantil: [
                'roupa infantil',
                'sapato infantil',
                'mochila infantil',
                'conjunto infantil'
            ]
        };

        for (const category of categories) {
            console.log(`\n[TikTokScraper] 📦 Buscando: ${category.toUpperCase()}`);

            const terms = searchTerms[category] || [];

            for (const term of terms) {
                await this.searchTerm(term, category);
                await this.sleep(3000); // Delay anti-ban
            }
        }

        console.log(`\n[TikTokScraper] ✅ TOTAL: ${this.productsFound.length} produtos encontrados!`);
        return this.productsFound;
    }

    /**
     * Busca um termo específico
     */
    async searchTerm(searchTerm, category) {
        try {
            console.log(`[TikTokScraper] 🔎 Pesquisando: "${searchTerm}"`);

            // Encontra campo de busca
            const searchInput = await this.page.$('input[type="search"], input[placeholder*="Search"]');

            if (searchInput) {
                // Limpa campo
                await searchInput.click({ clickCount: 3 });
                await searchInput.press('Backspace');

                // Digita busca
                await searchInput.type(searchTerm, { delay: 100 });
                await this.page.keyboard.press('Enter');

                console.log('[TikTokScraper] ⏳ Aguardando resultados...');
                await this.sleep(4000);

                // Scroll para carregar mais produtos
                await this.autoScroll(3);

                // Extrai produtos
                const products = await this.extractProducts(category, searchTerm);

                console.log(`[TikTokScraper] ✅ Encontrados: ${products.length} produtos`);

                this.productsFound.push(...products);

            } else {
                console.log('[TikTokScraper] ⚠️ Campo de busca não encontrado');
            }

        } catch (error) {
            console.error(`[TikTokScraper] ❌ Erro na busca "${searchTerm}":`, error.message);
        }
    }

    /**
     * Extrai produtos da página
     */
    async extractProducts(category, searchTerm) {
        try {
            const products = await this.page.evaluate((cat, term) => {
                const items = [];

                // Seletores possíveis para produtos
                const selectors = [
                    '[data-e2e="product-card"]',
                    '.product-card',
                    '[class*="ProductCard"]',
                    '[class*="product-item"]'
                ];

                let productCards = [];

                for (const selector of selectors) {
                    productCards = document.querySelectorAll(selector);
                    if (productCards.length > 0) break;
                }

                console.log(`Encontrados ${productCards.length} cards na página`);

                productCards.forEach((card, index) => {
                    if (index >= 30) return; // Máximo 30 por busca

                    try {
                        // Tenta diferentes seletores
                        const title =
                            card.querySelector('.product-title')?.innerText ||
                            card.querySelector('[class*="title"]')?.innerText ||
                            card.querySelector('h3')?.innerText ||
                            card.querySelector('h2')?.innerText ||
                            '';

                        const price =
                            card.querySelector('.product-price')?.innerText ||
                            card.querySelector('[class*="price"]')?.innerText ||
                            card.querySelector('[class*="Price"]')?.innerText ||
                            '';

                        const image =
                            card.querySelector('img')?.src ||
                            card.querySelector('[class*="image"] img')?.src ||
                            '';

                        const link =
                            card.querySelector('a')?.href ||
                            card.closest('a')?.href ||
                            window.location.href;

                        if (title && image) {
                            items.push({
                                title: title.trim(),
                                price: price.trim(),
                                image: image,
                                link: link,
                                category: cat,
                                searchTerm: term,
                                type: title.toLowerCase().includes('acessório') ||
                                    title.toLowerCase().includes('bolsa') ||
                                    title.toLowerCase().includes('sapato') ||
                                    title.toLowerCase().includes('tênis') ? 'acessorio' : 'roupa'
                            });
                        }
                    } catch (e) {
                        console.error('Erro ao extrair produto:', e);
                    }
                });

                return items;
            }, category, searchTerm);

            return products;

        } catch (error) {
            console.error('[TikTokScraper] Erro ao extrair produtos:', error.message);
            return [];
        }
    }

    /**
     * Auto-scroll para carregar mais produtos
     */
    async autoScroll(scrolls = 3) {
        console.log('[TikTokScraper] 📜 Scrolling para carregar mais...');

        for (let i = 0; i < scrolls; i++) {
            await this.page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
            await this.sleep(1500);
        }

        await this.page.evaluate(() => {
            window.scrollTo(0, 0);
        });
    }

    /**
     * Captura screenshot de demonstração
     */
    async takeScreenshot(name) {
        return await browserController.screenshot(name);
    }

    /**
     * Fecha scraper
     */
    async close() {
        await browserController.close();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = TikTokScraper;
