const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class TeslaDatabase {
    constructor() {
        // In-memory database (no SQLite needed)
        this.credentials = new Map();
        this.conversations = [];
        this.actionLogs = [];
        this.preferences = new Map();

        // Persistence file
        const dataDir = path.join(__dirname, '../../data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        this.dbFile = path.join(dataDir, 'tesla-data.json');
        this.loadFromFile();

        console.log('💾 Database initialized (in-memory + JSON file)');
    }

    loadFromFile() {
        try {
            if (fs.existsSync(this.dbFile)) {
                const data = JSON.parse(fs.readFileSync(this.dbFile, 'utf8'));
                this.credentials = new Map(data.credentials || []);
                this.conversations = data.conversations || [];
                this.actionLogs = data.actionLogs || [];
                this.preferences = new Map(data.preferences || []);
                console.log('✅ Data loaded from file');
            }
        } catch (error) {
            console.log('📁 Starting with fresh database');
        }
    }

    saveToFile() {
        try {
            const data = {
                credentials: Array.from(this.credentials.entries()),
                conversations: this.conversations,
                actionLogs: this.actionLogs,
                preferences: Array.from(this.preferences.entries())
            };
            fs.writeFileSync(this.dbFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving to file:', error);
        }
    }

    // Credentials methods
    saveCredential(toolName, data) {
        const encrypted = this.encrypt(JSON.stringify(data));
        this.credentials.set(toolName, {
            encrypted_data: encrypted,
            last_used: new Date().toISOString()
        });
        this.saveToFile();
        console.log(`🔐 Credential saved for: ${toolName}`);
    }

    getCredential(toolName) {
        const cred = this.credentials.get(toolName);
        if (!cred) return null;

        try {
            const decrypted = this.decrypt(cred.encrypted_data);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Error decrypting credential:', error);
            return null;
        }
    }

    getAllCredentials() {
        return Array.from(this.credentials.entries()).map(([toolName, data]) => ({
            tool_name: toolName,
            last_used: data.last_used
        }));
    }

    deleteCredential(toolName) {
        this.credentials.delete(toolName);
        this.saveToFile();
        console.log(`🗑️ Credential deleted: ${toolName}`);
    }

    // Conversation methods
    saveConversation(role, message) {
        this.conversations.push({
            role,
            message,
            timestamp: new Date().toISOString()
        });

        if (this.conversations.length > 100) {
            this.conversations = this.conversations.slice(-100);
        }

        this.saveToFile();
    }

    getConversationHistory(limit = 50) {
        return this.conversations.slice(-limit);
    }

    clearConversations() {
        this.conversations = [];
        this.saveToFile();
        console.log('🗑️ Conversation history cleared');
    }

    // Action logs methods
    saveActionLog(toolName, action, success, duration) {
        this.actionLogs.push({
            tool_name: toolName,
            action,
            success,
            duration,
            timestamp: new Date().toISOString()
        });

        if (this.actionLogs.length > 200) {
            this.actionLogs = this.actionLogs.slice(-200);
        }

        this.saveToFile();
    }

    getActionLogs(limit = 100) {
        return this.actionLogs.slice(-limit);
    }

    // Preferences methods
    setPreference(key, value) {
        this.preferences.set(key, value);
        this.saveToFile();
    }

    getPreference(key, defaultValue = null) {
        return this.preferences.get(key) || defaultValue;
    }

    // Encryption methods (AES-256-GCM)
    encrypt(text) {
        const key = this.getEncryptionKey();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        const authTag = cipher.getAuthTag();

        return JSON.stringify({
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        });
    }

    decrypt(encryptedData) {
        const key = this.getEncryptionKey();
        const data = JSON.parse(encryptedData);

        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            key,
            Buffer.from(data.iv, 'hex')
        );

        decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));

        let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    getEncryptionKey() {
        let key = this.getPreference('encryption_key');

        if (!key) {
            key = crypto.randomBytes(32).toString('hex');
            this.setPreference('encryption_key', key);
            console.log('🔐 New encryption key generated');
        }

        return Buffer.from(key, 'hex');
    }

    close() {
        this.saveToFile();
        console.log('💾 Database saved and closed');
    }
}

module.exports = TeslaDatabase;
