# 📖 Guia de Uso - Agente Tesla 2026

## 🚀 Início Rápido

### 1. Instalação

```bash
# 1. Navegue até a pasta
cd "C:\Users\lenovo\Desktop\PLATAFOR N8N\agente-tesla-2026"

# 2. Instale as dependências
npm install

# 3. Copie o arquivo de configuração
copy .env.example .env

# 4. Inicie a aplicação
npm start
```

### 2. Primeira Configuração

No primeiro uso, você verá a tela de boas-vindas. Para configurar:

1. Clique no ícone ⚙️ **Configurações** (canto inferior esquerdo)
2. Adicione suas API keys (opcional, mas recomendado):
   - **Anthropic API**: Para IA avançada
   - **Composio API**: Para 500+ ferramentas

## 💬 Como Conversar com o Agente

### Seja Natural!

O Agente Tesla 2026 entende linguagem natural. Apenas descreva o que precisa:

```
✓ "Preciso enviar um email"
✓ "Faça backup dos meus arquivos"
✓ "Crie um repositório no GitHub"
✓ "Me mostre minha agenda"
```

### Na Primeira Vez com Uma Ferramenta

Quando usar uma ferramenta pela primeira vez, o agente vai solicitar credenciais:

**Exemplo - Gmail:**
```
VOCÊ: "Envie um email para minha equipe"

AGENTE: "🔐 Para usar Gmail, preciso de credenciais.
         Vá em Configurações > API Keys"

[Você configura no painel de configurações]

AGENTE: "✅ Gmail configurado!
         📧 Enviando email...
         ✅ Email enviado com sucesso!"
```

**Próximas Vezes:**
O agente usará automaticamente as credenciais salvas!

## 🛠️ Ferramentas Disponíveis

### 📧 Email
- **Gmail**: Enviar/ler emails
- **Outlook**: Gerenciar emails corporativos

**Comandos:**
- "Enviar email para [pessoa]"
- "Verificar emails não lidos"
- "Responder último email"

### 💻 GitHub
- Criar repositórios
- Fazer commits
- Abrir issues

**Comandos:**
- "Criar repositório chamado [nome]"
- "Listar meus repositórios"
- "Fazer commit com mensagem [msg]"

### 📂 Google Drive
- Upload de arquivos
- Compartilhamento
- Backup automático

**Comandos:**
- "Fazer backup dos arquivos"
- "Enviar [arquivo] para o Drive"
- "Compartilhar [arquivo] com [pessoa]"

### 📅 Google Calendar
- Ver agenda
- Criar eventos
- Gerenciar reuniões

**Comandos:**
- "Qual minha agenda hoje?"
- "Criar reunião amanhã às 14h"
- "Cancelar próximo compromisso"

### ⚙️ Sistema
- Executar comandos
- Abrir aplicativos
- Gerenciar arquivos

**Comandos:**
- "Abrir [aplicativo]"
- "Listar arquivos da pasta [caminho]"
- "Executar [comando]"

## 🔐 Gerenciamento de Credenciais

### Como Funciona

1. **Primeira Solicitação**: Agente pede credenciais
2. **Você Fornece**: Via painel de configurações
3. **Encriptação AES-256**: Dados salvos com segurança bancária
4. **Uso Automático**: Nunca mais precisa fornecer

### Adicionar Credenciais

1. Clique em ⚙️ **Configurações**
2. Vá em **API Keys**
3. Adicione as chaves necessárias
4. Clique em **💾 Salvar**

### Remover Credenciais

1. Configurações > Ferramentas Conectadas
2. Clique em **Remover** na ferramenta desejada

## 📊 Interface

### Barra Superior
- **⚡ Logo**: Identifica o app
- **─**: Minimizar
- **□**: Maximizar
- **✕**: Fechar

### Sidebar Esquerda

**💬 Conversas**
- **+ Nova Conversa**: Inicia chat limpo
- **Histórico**: Conversas anteriores

**🛠️ Ferramentas**
- Lista de ferramentas conectadas
- ✓ = Conectada
- ○ = Não conectada

### Área Central
- **Chat**: Suas conversas com o agente
- **Welcome Screen**: Tela inicial com capacidades

### Área Inferior
- **Campo de Texto**: Digite suas mensagens
- **➤ Enviar**: Envia a mensagem
- **Status**: Mostra se está pronto/processando

## ⌨️ Atalhos de Teclado

- `Enter`: Enviar mensagem
- `Shift + Enter`: Nova linha
- `Ctrl + ,`: Abrir configurações (planejado)
- `Ctrl + N`: Nova conversa (planejado)

## 🎯 Exemplos Práticos

### Exemplo 1: Workflow Completo

```
1. "Faça backup dos meus projetos"
   → Agente compacta arquivos
   
2. "Envie para o Google Drive"
   → Upload automático
   
3. "Compartilhe com time@empresa.com"
   → Compartilhamento configurado
   
4. "Avise no Slack canal #geral"
   → Notificação enviada

✅ Tudo em uma sequência automática!
```

### Exemplo 2: Desenvolvimento

```
1. "Crie repositório 'meu-app'"
   → Repositório criado no GitHub
   
2. "Adicione README com descrição do projeto"
   → README.md criado e commitado
   
3. "Abra issue sobre implementar autenticação"
   → Issue criada com template

✅ Projeto configurado em segundos!
```

### Exemplo 3: Produtividade

```
1. "Qual minha agenda esta semana?"
   → Lista de compromissos
   
2. "Crie resumo em planilha"
   → Google Sheets criado
   
3. "Envie por email para mim"
   → Email enviado com planilha

✅ Relatório semanal automatizado!
```

## 🆘 Solução de Problemas

### Erro: "Backend não está rodando"

**Solução:**
```bash
# Reinicie a aplicação
npm start
```

### Erro: "Credenciais inválidas"

**Solução:**
1. Verifique se as API keys estão corretas
2. Reconfigurecredencial:
   - Configurações > Remover credencial
   - Adicione novamente

### Erro: "Ferramenta não encontrada"

**Solução:**
- Verifique se digitou corretamente
- Tente sinônimos: "Gmail" / "email" / "correio"

### Aplicação não abre

**Solução:**
```bash
# Reinstale dependências
npm install

# Tente novamente
npm start
```

## 💡 Dicas de Uso

### ✅ Boas Práticas

1. **Seja específico**: "Envie email para João" > "Envie email"
2. **Use contexto**: O agente lembra de conversas anteriores
3. **Confirme ações importantes**: Agente pedirá confirmação para deletar/modificar

### ❌ Evite

1. Comandos muito vagos: "Faça algo"
2. Múltiplas solicitações em uma frase
3. Usar ferramentas sem configurar credenciais antes

## 📈 Aprenda Mais

O Agente Tesla 2026 **aprende com você**:

- 📊 Prioriza ferramentas mais usadas
- 🎯 Lembra preferências
- ⚡ Fica mais rápido com o tempo
- 💡 Sugere automações baseadas em padrões

## 🔄 Atualizações

Para atualizar o Agente Tesla 2026:

```bash
cd "C:\Users\lenovo\Desktop\PLATAFOR N8N\agente-tesla-2026"
git pull
npm install
npm start
```

---

## 📞 Precisa de Ajuda?

- 📖 Consulte o **README.md** para informações técnicas
- 🐛 Encontrou um bug? Abra uma issue
- 💡 Tem sugestão? Contribua com o projeto!

---

**⚡ Agente Tesla 2026 - Seja mais produtivo com IA! ⚡**
