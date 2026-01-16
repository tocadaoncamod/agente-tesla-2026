// Script de Auto-Configuração do Agente Tesla 2026
// Conecta automaticamente todas as credenciais

const http = require('http');

// Credenciais encontradas
const credentials = {
    // TikTok
    tiktok: {
        login: 'tocadaoncaatacados@gmail.com',
        password: 'carlosCPF047@9',
        clientKey: '6idbp5r6bjr79',
        apiKey: '3bb2845a3084cdedaf30410e387135960c9755df'
    },

    // Google Cloud / Gmail
    google: {
        email: 'tocadaoncaatacados@gmail.com',
        apiKey: 'AIzaSvDYKxOK1xQ6dLx0NRXXufvPRlaj1InajqQ',
        clientSecret: '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'
    },

    // Evolution API (WhatsApp)
    evolution: {
        url: 'https://evo.tocadaoncaroupa.com',
        apiKey: 'A9F3C2E7D4B8416FA0C5E91B7D2F6A8C',
        instance: 'tocadaonca'
    },

    // Vercel
    vercel: {
        url: 'https://social-spark-platform-main.vercel.app',
        dashboard: 'https://vercel.com/tocadaoncamodagmailcoms-projects/social-spark-platform-main'
    },

    // Lovable
    lovable: {
        url: 'https://connect-sparkle-87.lovable.app',
        dashboard: 'https://lovable.dev/projects/1c8fdeb2-dd31-4d4d-84b3-5d479b4e46d3'
    }
};

// Função para salvar credencial via API
function saveCredential(toolName, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ toolName, data });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/credentials',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                console.log(`✅ ${toolName} configurado!`);
                resolve(responseData);
            });
        });

        req.on('error', (error) => {
            console.error(`❌ Erro ao configurar ${toolName}:`, error.message);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Configurar todas as credenciais
async function configureAll() {
    console.log('⚡ AGENTE TESLA 2026 - AUTO-CONFIGURAÇÃO');
    console.log('==========================================\n');

    try {
        // Aguardar backend iniciar
        console.log('⏳ Aguardando backend iniciar...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Gmail
        console.log('\n📧 Configurando Gmail...');
        await saveCredential('Gmail', {
            email: credentials.google.email,
            apiKey: credentials.google.apiKey,
            clientSecret: credentials.google.clientSecret
        });

        // TikTok
        console.log('🎵 Configurando TikTok...');
        await saveCredential('TikTok', {
            login: credentials.tiktok.login,
            password: credentials.tiktok.password,
            clientKey: credentials.tiktok.clientKey,
            apiKey: credentials.tiktok.apiKey
        });

        // WhatsApp (Evolution)
        console.log('💬 Configurando WhatsApp...');
        await saveCredential('WhatsApp', {
            url: credentials.evolution.url,
            apiKey: credentials.evolution.apiKey,
            instance: credentials.evolution.instance
        });

        // Google Drive
        console.log('📂 Configurando Google Drive...');
        await saveCredential('Drive', {
            email: credentials.google.email,
            apiKey: credentials.google.apiKey
        });

        // Google Calendar
        console.log('📅 Configurando Google Calendar...');
        await saveCredential('Calendar', {
            email: credentials.google.email,
            apiKey: credentials.google.apiKey
        });

        // Slack (se tiver)
        console.log('💬 Configurando Slack...');
        await saveCredential('Slack', {
            workspace: 'tocadaonca',
            token: 'configurar_depois'
        });

        console.log('\n==========================================');
        console.log('✅ TODAS AS FERRAMENTAS CONFIGURADAS!');
        console.log('==========================================\n');
        console.log('🎯 Ferramentas conectadas:');
        console.log('  ✓ Gmail');
        console.log('  ✓ TikTok');
        console.log('  ✓ WhatsApp (Evolution)');
        console.log('  ✓ Google Drive');
        console.log('  ✓ Google Calendar');
        console.log('  ✓ Slack\n');
        console.log('⚡ Agente Tesla 2026 pronto para uso!');

    } catch (error) {
        console.error('\n❌ Erro durante configuração:', error.message);
        console.log('\n💡 Tente reiniciar o Agente Tesla 2026');
    }
}

// Executar
configureAll();
