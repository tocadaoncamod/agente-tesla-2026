class ToolRouter {
    constructor(database) {
        this.db = database;
        this.tools = this.initializeTools();
    }

    initializeTools() {
        // 500+ tools would be loaded from Composio SDK
        // This is a simplified version with core tools
        return [
            // Email & Communication
            { id: 1, name: 'Gmail', category: 'email', icon: '📧', needsAuth: true },
            { id: 2, name: 'Outlook', category: 'email', icon: '📧', needsAuth: true },
            { id: 3, name: 'Slack', category: 'communication', icon: '💬', needsAuth: true },
            { id: 4, name: 'Discord', category: 'communication', icon: '💬', needsAuth: true },
            { id: 5, name: 'Teams', category: 'communication', icon: '💬', needsAuth: true },

            // Development
            { id: 6, name: 'GitHub', category: 'development', icon: '💻', needsAuth: true },
            { id: 7, name: 'GitLab', category: 'development', icon: '💻', needsAuth: true },
            { id: 8, name: 'Jira', category: 'development', icon: '📋', needsAuth: true },
            { id: 9, name: 'Linear', category: 'development', icon: '📋', needsAuth: true },

            // Files & Storage
            { id: 10, name: 'Drive', category: 'storage', icon: '📂', needsAuth: true },
            { id: 11, name: 'Dropbox', category: 'storage', icon: '📂', needsAuth: true },
            { id: 12, name: 'OneDrive', category: 'storage', icon: '📂', needsAuth: true },

            // Productivity
            { id: 13, name: 'Calendar', category: 'productivity', icon: '📅', needsAuth: true },
            { id: 14, name: 'Todoist', category: 'productivity', icon: '✓', needsAuth: true },
            { id: 15, name: 'Notion', category: 'productivity', icon: '📝', needsAuth: true },
            { id: 16, name: 'Sheets', category: 'productivity', icon: '📊', needsAuth: true },

            // System
            { id: 17, name: 'System', category: 'system', icon: '⚙️', needsAuth: false }
        ];
    }

    findTool(query) {
        const lowerQuery = query.toLowerCase();

        return this.tools.find(tool =>
            tool.name.toLowerCase().includes(lowerQuery) ||
            tool.category.toLowerCase().includes(lowerQuery)
        );
    }

    getToolsByCategory(category) {
        return this.tools.filter(tool => tool.category === category);
    }

    getAllTools() {
        return this.tools.map(tool => ({
            ...tool,
            connected: !!this.db.getCredential(tool.name)
        }));
    }

    isToolConnected(toolName) {
        return !!this.db.getCredential(toolName);
    }
}

module.exports = ToolRouter;
