/**
 * TESTE - Demonstração Tesla Trabalhando
 * Execute este arquivo para VER o Tesla em ação!
 */

const BrowserController = require('./BrowserController');
const TikTokScraper = require('./TikTokScraper');

async function demonstracao() {
    console.log('\n🤖 ============================================');
    console.log('🤖  TESLA - DEMONSTRAÇÃO AO VIVO');
    console.log('🤖  Você vai VER o navegador trabalhando!');
    console.log('🤖 ============================================\n');

    try {
        // 1. Criar scraper
        const scraper = new TikTokScraper();

        // 2. Inicializar (ABRE NAVEGADOR VISÍVEL!)
        console.log('📺 Abrindo navegador na sua tela...\n');
        await scraper.initialize();

        console.log('✅ Navegador aberto!');
        console.log('👀 VOCÊ ESTÁ VENDO O TESLA TRABALHAR!\n');

        // 3. Ir para TikTok
        console.log('🎯 Navegando para TikTok...');
        await scraper.page.goto('https://www.tiktok.com', {
            waitUntil: 'networkidle2'
        });

        await scraper.sleep(3000);

        // 4. Captura screenshot
        console.log('\n📸 Tirando screenshot de demonstração...');
        await scraper.takeScreenshot('demo-tiktok');

        console.log('\n✅ DEMONSTRAÇÃO CONCLUÍDA!');
        console.log('\n💡 Tesla está funcionando perfeitamente!');
        console.log('💡 Para usar com TikTok Shopping:');
        console.log('   1. Configure suas credenciais em .env');
        console.log('   2. Execute a automação completa');
        console.log('\n⏰ Aguardando 10 segundos para você ver...\n');

        await scraper.sleep(10000);

        // 5. Fecha
        await scraper.close();

        console.log('🎉 TESLA DEMONSTRADO COM SUCESSO!');
        console.log('🎉 Pronto para trabalhar a noite toda!\n');

    } catch (error) {
        console.error('\n❌ ERRO na demonstração:', error);
        console.error('💡 Verifique se as dependências foram instaladas');
        console.error('💡 Execute: npm install\n');
    }
}

// Executar demonstração
demonstracao();
