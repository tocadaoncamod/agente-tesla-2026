const express = require('express');
const path = require('path');
const router = express.Router();

// Serve HTML interface at root
router.get('/', (req, res) => {
    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 Tesla 2026</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            width: 100%;
            max-width: 800px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .chat { padding: 30px; }
        .messages {
            height: 400px;
            overflow-y: auto;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            background: #f8f9fa;
        }
        .message { margin: 15px 0; padding: 15px; border-radius: 10px; }
        .message.user { background: #667eea; color: white; margin-left: 50px; }
        .message.tesla { background: white; border: 2px solid #667eea; margin-right: 50px; }
        input { flex: 1; padding: 15px; border: 2px solid #667eea; border-radius: 10px; font-size: 1em; }
        button {
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1em;
            font-weight: bold;
        }
        .input-area { display: flex; gap: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 TESLA 2026</h1>
            <p>Agente Autônomo - Geração de Renda</p>
        </div>
        <div class="chat">
            <div class="messages" id="messages">
                <div class="message tesla"><strong>Tesla:</strong> Olá! Pronto para gerar renda automaticamente! 💰</div>
            </div>
            <div class="input-area">
                <input type="text" id="input" placeholder="Digite sua mensagem..." onkeypress="if(event.key==='Enter') send()">
                <button onclick="send()">Enviar</button>
            </div>
        </div>
    </div>
    <script>
        async function send() {
            const input = document.getElementById('input');
            const msg = input.value.trim();
            if (!msg) return;
            
            addMsg(msg, 'user');
            input.value = '';
            
            try {
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({message: msg})
                });
                const data = await res.json();
                addMsg(data.message || 'Erro ao processar', 'tesla');
            } catch(e) {
                addMsg('Erro de conexão!', 'tesla');
            }
        }
        
        function addMsg(text, sender) {
            const div = document.createElement('div');
            div.className = 'message ' + sender;
            div.innerHTML = '<strong>' + (sender==='user'?'Você':'Tesla') + ':</strong> ' + text;
            document.getElementById('messages').appendChild(div);
            document.getElementById('messages').scrollTop = 999999;
        }
    </script>
</body>
</html>`;
    res.send(html);
});

module.exports = router;
