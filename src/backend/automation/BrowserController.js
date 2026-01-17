const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

/**
 * BrowserController - Controla navegador de forma visível
 * TESLA abre navegador na sua tela para você VER trabalhando!
 */
class BrowserController {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    /**
     * Inicia navegador (VISÍVEL!)
     */
    async start(headless = false) {
        console.log('[Browser] 🌐 Abrindo navegador...');
        console.log('[Browser] 👀 Você vai VER o Tesla trabalhando!');

        this.browser = await puppeteer.launch({
            headless: headless,  // false = VOCÊ VÊ!
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--window-size=1920,1080',
                '--start-maximized'
            ],
            defaultViewport: null
        });

        this.page = await this.browser.newPage();

        console.log('[Browser] ✅ Navegador aberto e visível!');
        return this.page;
    }

    /**
     * Login no TikTok
     */
    async loginTikTok(username, password) {
        console.log('[Browser] 🔐 Fazendo login no TikTok...');

        try {
            await this.page.goto('https://www.tiktok.com/login', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            await this.sleep(2000);

            // Tenta encontrar botão de login
            try {
                await this.page.waitForSelector('[data-e2e="login-phone-or-email"]', { timeout: 5000 });
                await this.page.click('[data-e2e="login-phone-or-email"]');
            } catch (e) {
                console.log('[Browser] Usando método alternativo de login...');
            }

            await this.sleep(1000);

            // Digita credenciais
            const usernameInput = await this.page.$('input[name="username"], input[type="text"]');
            if (usernameInput) {
                await usernameInput.type(username, { delay: 100 });
                console.log('[Browser] ✅ Usuário digitado');
            }

            await this.sleep(500);

            const passwordInput = await this.page.$('input[type="password"]');
            if (passwordInput) {
                await passwordInput.type(password, { delay: 100 });
                console.log('[Browser] ✅ Senha digitada');
            }

            await this.sleep(1000);

            // Clica em entrar
            const loginButton = await this.page.$('button[type="submit"], button[data-e2e="login-button"]');
            if (loginButton) {
                await loginButton.click();
                console.log('[Browser] 🚀 Clicou em entrar...');
            }

            await this.sleep(3000);

            console.log('[Browser] ✅ Login realizado!');
            console.log('[Browser] ⚠️ Se houver captcha, resolva manualmente!');

        } catch (error) {
            console.error('[Browser] ❌ Erro no login:', error.message);
            throw error;
        }
    }

    /**
     * Navega para TikTok Shopping
     */
    async goToShopping() {
        console.log('[Browser] 🛍️ Navegando para TikTok Shopping...');

        await this.page.goto('https://shop.tiktok.com', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await this.sleep(2000);
        console.log('[Browser] ✅ Na página do Shopping!');
    }

    /**
     * Captura screenshot
     */
    async screenshot(filename) {
        const path = `./screenshots/${filename}_${Date.now()}.png`;
        await this.page.screenshot({ path, fullPage: true });
        console.log(`[Browser] 📸 Screenshot salvo: ${path}`);
        return path;
    }

    /**
     * Fecha navegador
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('[Browser] 🔴 Navegador fechado');
        }
    }

    /**
     * Helper: sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Verifica se está logado
     */
    async isLoggedIn() {
        try {
            // Verifica se existe algum indicador de login
            const profileButton = await this.page.$('[data-e2e="profile-icon"], [data-e2e="nav-profile"]');
            return profileButton !== null;
        } catch (e) {
            return false;
        }
    }
}

module.exports = new BrowserController();
