const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

class SystemCommands {
    constructor() {
        this.platform = os.platform();
        console.log(`💻 System: ${this.platform}`);
    }

    async executeCommand(command, cwd = process.cwd()) {
        return new Promise((resolve, reject) => {
            exec(command, { cwd }, (error, stdout, stderr) => {
                if (error) {
                    reject({ error: error.message, stderr });
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
    }

    async listFiles(directory) {
        return new Promise((resolve, reject) => {
            fs.readdir(directory, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            });
        });
    }

    async readFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    async writeFile(filePath, content) {
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, content, 'utf8', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    async openApplication(appName) {
        let command;

        switch (this.platform) {
            case 'win32':
                command = `start ${appName}`;
                break;
            case 'darwin':
                command = `open -a "${appName}"`;
                break;
            case 'linux':
                command = `xdg-open ${appName}`;
                break;
            default:
                throw new Error('Platform not supported');
        }

        return this.executeCommand(command);
    }

    async getSystemInfo() {
        return {
            platform: this.platform,
            architecture: os.arch(),
            hostname: os.hostname(),
            memory: {
                total: os.totalmem(),
                free: os.freemem()
            },
            cpus: os.cpus().length,
            uptime: os.uptime()
        };
    }
}

module.exports = SystemCommands;
