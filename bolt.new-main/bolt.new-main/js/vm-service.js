class VMService {
    constructor() {
        this.wsConnection = null;
        this.vmStates = new Map();
        this.API_ENDPOINT = 'wss://your-vm-server.com/ws';
    }

    async initializeVM(config) {
        try {
            // Connect to actual VM service (e.g., AWS, Azure, or your own VM server)
            const response = await fetch('/api/vm/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cpu: config.cpu,
                    ram: config.ram,
                    disk: config.disk,
                    os: 'ubuntu-20.04',
                    aiAgent: config.agentType
                })
            });

            const vmData = await response.json();
            this.connectToVM(vmData.vmId);
            return vmData;
        } catch (error) {
            console.error('Failed to initialize VM:', error);
            throw error;
        }
    }

    connectToVM(vmId) {
        // Establish WebSocket connection to VM for real-time feed
        this.wsConnection = new WebSocket(`${this.API_ENDPOINT}/${vmId}`);
        
        this.wsConnection.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateVMState(vmId, data);
        };
    }

    updateVMState(vmId, state) {
        this.vmStates.set(vmId, state);
        this.notifyStateChange(vmId);
    }

    notifyStateChange(vmId) {
        const event = new CustomEvent('vm-state-change', {
            detail: {
                vmId,
                state: this.vmStates.get(vmId)
            }
        });
        window.dispatchEvent(event);
    }
}

class AIAgentService {
    constructor(vmService) {
        this.vmService = vmService;
        this.agents = new Map();
    }

    async createAgent(config) {
        // Create AI agent with specified capabilities
        const agent = {
            id: crypto.randomUUID(),
            type: config.type,
            capabilities: this.getAgentCapabilities(config.type),
            vmId: null
        };

        try {
            // Initialize VM for the agent
            const vmData = await this.vmService.initializeVM({
                cpu: config.cpu || 4,
                ram: config.ram || 8,
                disk: config.disk || 50,
                agentType: config.type
            });

            agent.vmId = vmData.vmId;
            this.agents.set(agent.id, agent);

            // Initialize AI model and required software
            await this.initializeAIEnvironment(agent);

            return agent;
        } catch (error) {
            console.error('Failed to create agent:', error);
            throw error;
        }
    }

    getAgentCapabilities(type) {
        const capabilities = {
            'video-editor': [
                'video-processing',
                'color-grading',
                'audio-editing',
                'format-conversion'
            ],
            'code-assistant': [
                'code-analysis',
                'debugging',
                'optimization',
                'testing'
            ],
            'data-analyzer': [
                'data-processing',
                'visualization',
                'statistical-analysis',
                'machine-learning'
            ]
        };

        return capabilities[type] || [];
    }

    async initializeAIEnvironment(agent) {
        // Install and configure necessary software based on agent type
        const software = {
            'video-editor': [
                'ffmpeg',
                'opencv-python',
                'moviepy'
            ],
            'code-assistant': [
                'git',
                'docker',
                'vscode-server'
            ],
            'data-analyzer': [
                'python',
                'pandas',
                'scikit-learn',
                'jupyter'
            ]
        };

        const requiredSoftware = software[agent.type] || [];

        try {
            await fetch(`/api/vm/${agent.vmId}/setup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    software: requiredSoftware,
                    aiModel: this.getAIModel(agent.type)
                })
            });
        } catch (error) {
            console.error('Failed to initialize AI environment:', error);
            throw error;
        }
    }

    getAIModel(type) {
        // Configure appropriate AI model based on agent type
        const models = {
            'video-editor': 'stable-diffusion-xl',
            'code-assistant': 'codellama-34b',
            'data-analyzer': 'gpt-4'
        };

        return models[type] || 'gpt-3.5-turbo';
    }
}

// Export services
export const vmService = new VMService();
export const aiService = new AIAgentService(vmService); 