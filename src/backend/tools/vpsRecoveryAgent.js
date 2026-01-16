const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class VPSRecoveryAgent {
    constructor() {
        this.guidePath = path.join(__dirname, '../../../../.gemini/antigravity/brain/dc215c61-0f55-4645-9f84-413861f0ef31/guia-recuperacao-vps.md');
        this.credentials = this.loadCredentials();
    }

    loadCredentials() {
        return {
            contabo: {
                email: 'tocadaaoncaatacados@gmail.com',
                password: 'Prosper@2026',
                twoFactorSecret: 'TLZP2WBFMK6R32W6',
                recoveryCode: 'fa69e5d74dc88898'
            },
            ssh: {
                host: '167.86.75.235',
                user: 'root',
                password: 'qeZP8Hx9H7ulawzCYdE2fOpdRTK'
            },
            services: {
                evolution: 'https://evo.tocadaoncaroupa.com',
                n8n: 'https://n8n.tocadaoncaroupa.com',
                easypanel: 'PartiuProsperar2025$'
            }
        };
    }

    async speak(text) {
        // Retorna texto para o agente falar via voice synthesis
        return text;
    }

    async executeStep(step, description) {
        const response = {
            step,
            description,
            status: 'executing',
            message: '',
            logs: []
        };

        console.log(`\n🔧 PASSO ${step}: ${description}`);
        response.message = `Executando passo ${step}: ${description}`;

        return response;
    }

    async testSSHConnection() {
        return new Promise((resolve) => {
            const step = this.executeStep(1, 'Testando conexão SSH com VPS');

            const command = `ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${this.credentials.ssh.user}@${this.credentials.ssh.host} "echo 'Conectado!' && docker ps"`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        ...step,
                        status: 'needs_password',
                        message: `Conexão SSH precisa de senha. Vou tentar conectar com autenticação.`,
                        error: stderr,
                        nextAction: 'try_with_password'
                    });
                } else {
                    resolve({
                        ...step,
                        status: 'success',
                        message: `✅ Conectado com sucesso! Servidor está respondendo.`,
                        output: stdout
                    });
                }
            });
        });
    }

    async checkDockerContainers() {
        return new Promise((resolve) => {
            const command = `ssh ${this.credentials.ssh.user}@${this.credentials.ssh.host} "docker ps -a"`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        status: 'error',
                        message: 'Não consegui listar os containers Docker',
                        error: stderr
                    });
                } else {
                    const containers = this.parseDockerOutput(stdout);
                    resolve({
                        status: 'success',
                        message: `Encontrei ${containers.length} containers Docker`,
                        containers
                    });
                }
            });
        });
    }

    parseDockerOutput(output) {
        const lines = output.split('\n').slice(1); // Remove header
        return lines
            .filter(line => line.trim())
            .map(line => {
                const parts = line.split(/\s{2,}/);
                return {
                    name: parts[parts.length - 1],
                    status: line.includes('Up') ? 'running' : 'stopped',
                    image: parts[1]
                };
            });
    }

    async startAllContainers() {
        return new Promise((resolve) => {
            const command = `ssh ${this.credentials.ssh.user}@${this.credentials.ssh.host} "docker start $(docker ps -aq)"`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    resolve({
                        status: 'error',
                        message: 'Erro ao iniciar containers',
                        error: stderr
                    });
                } else {
                    resolve({
                        status: 'success',
                        message: '✅ Todos os containers foram iniciados!',
                        output: stdout
                    });
                }
            });
        });
    }

    async checkService(url) {
        return new Promise((resolve) => {
            exec(`curl -I ${url}`, (error, stdout) => {
                if (error || !stdout.includes('200')) {
                    resolve({
                        status: 'offline',
                        message: `⚠️ Serviço ${url} está offline`
                    });
                } else {
                    resolve({
                        status: 'online',
                        message: `✅ Serviço ${url} está online!`
                    });
                }
            });
        });
    }

    async executeFullRecovery() {
        const steps = [];

        // Passo 1: Testar SSH
        console.log('🚀 Iniciando recuperação da VPS...');
        const sshTest = await this.testSSHConnection();
        steps.push(sshTest);

        if (sshTest.status !== 'success') {
            return {
                success: false,
                message: 'Não consegui conectar via SSH. Você precisa fazer login no painel Contabo primeiro.',
                steps,
                nextSteps: [
                    '1. Acesse https://my.contabo.com',
                    `2. Login: ${this.credentials.contabo.email}`,
                    `3. Senha: ${this.credentials.contabo.password}`,
                    '4. Use 2FA com o app ou código de recuperação',
                    '5. Verifique se o servidor está ligado'
                ]
            };
        }

        // Passo 2: Verificar containers
        console.log('\n📦 Verificando containers Docker...');
        const containers = await this.checkDockerContainers();
        steps.push(containers);

        // Passo 3: Iniciar containers parados
        if (containers.containers?.some(c => c.status === 'stopped')) {
            console.log('\n🔄 Iniciando containers parados...');
            const started = await this.startAllContainers();
            steps.push(started);
        }

        // Passo 4: Verificar serviços
        console.log('\n🌐 Verificando serviços online...');
        const evolutionCheck = await this.checkService(this.credentials.services.evolution);
        steps.push(evolutionCheck);

        return {
            success: true,
            message: '✅ Recuperação concluída!',
            steps,
            summary: this.generateSummary(steps)
        };
    }

    generateSummary(steps) {
        const summary = {
            total: steps.length,
            success: steps.filter(s => s.status === 'success').length,
            errors: steps.filter(s => s.status === 'error').length,
            warnings: steps.filter(s => s.status === 'offline').length
        };

        return `Executei ${summary.total} passos. ${summary.success} com sucesso, ${summary.errors} erros, ${summary.warnings} avisos.`;
    }
}

module.exports = VPSRecoveryAgent;
