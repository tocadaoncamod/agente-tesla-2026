// Environment configuration (using defaults)
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('./database/db');
const Agent = require('./agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database
const db = new Database();

// Initialize Agent
const agent = new Agent(db);

// Routes
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        message: 'Agente Tesla 2026 Backend Running',
        version: '1.0.0'
    });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('📨 Received message:', message);

        // Process message with agent
        const response = await agent.processMessage(message);

        // Save to conversation history
        db.saveConversation('user', message);
        db.saveConversation('agent', response.message);

        res.json(response);
    } catch (error) {
        console.error('❌ Error processing message:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Credentials endpoints
app.get('/api/credentials', (req, res) => {
    try {
        const credentials = db.getAllCredentials();
        res.json(credentials);
    } catch (error) {
        console.error('Error getting credentials:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/credentials', (req, res) => {
    try {
        const { toolName, data } = req.body;

        if (!toolName || !data) {
            return res.status(400).json({ error: 'toolName and data are required' });
        }

        db.saveCredential(toolName, data);
        res.json({ success: true, message: 'Credential saved' });
    } catch (error) {
        console.error('Error saving credential:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/credentials/:toolName', (req, res) => {
    try {
        const { toolName } = req.params;
        db.deleteCredential(toolName);
        res.json({ success: true, message: 'Credential deleted' });
    } catch (error) {
        console.error('Error deleting credential:', error);
        res.status(500).json({ error: error.message });
    }
});

// History endpoint
app.get('/api/history', (req, res) => {
    try {
        const history = db.getConversationHistory();
        res.json(history);
    } catch (error) {
        console.error('Error getting history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Tools endpoint
app.get('/api/tools', (req, res) => {
    try {
        const tools = agent.getAvailableTools();
        res.json(tools);
    } catch (error) {
        console.error('Error getting tools:', error);
        res.status(500).json({ error: error.message });
    }
});

// Logs endpoint
app.get('/api/logs', (req, res) => {
    try {
        const logs = db.getActionLogs();
        res.json(logs);
    } catch (error) {
        console.error('Error getting logs:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('⚡ ============================================');
    console.log('⚡  AGENTE TESLA 2026 - BACKEND SERVER');
    console.log('⚡ ============================================');
    console.log(`⚡  Server running on: http://localhost:${PORT}`);
    console.log('⚡  Status: ONLINE');
    console.log('⚡  Database: Connected');
    console.log('⚡  AI Agent: Ready');
    console.log('⚡ ============================================');
});

// Handle errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
