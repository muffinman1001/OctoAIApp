import { vmService, aiService } from './vm-service.js';

// Global Variables
let demoInterval;
let progressValue = 0;

// Demo Animation
function playDemo() {
    const demoFeed = document.getElementById('demoFeed');
    const demoProgress = document.getElementById('demoProgress');
    
    // Simulate VM activity
    demoInterval = setInterval(() => {
        progressValue = (progressValue + 1) % 100;
        demoProgress.style.width = `${progressValue}%`;
        
        // Simulate screen changes
        demoFeed.style.background = `linear-gradient(${progressValue * 3.6}deg, var(--accent-primary), var(--accent-secondary))`;
    }, 50);
}

// Modal Functions
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'flex';
}

function showSignupModal() {
    // Implementation similar to login modal
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Agent Creation
async function createNewAgent(config) {
    try {
        const agent = await aiService.createAgent(config);
        updateDashboard(agent);
        return agent;
    } catch (error) {
        showError('Failed to create agent: ' + error.message);
    }
}

// VM State Updates
window.addEventListener('vm-state-change', (event) => {
    const { vmId, state } = event.detail;
    updateVMCard(vmId, state);
});

function updateVMCard(vmId, state) {
    const vmCard = document.querySelector(`[data-vm-id="${vmId}"]`);
    if (!vmCard) return;

    // Update VM status
    const statusBadge = vmCard.querySelector('.status-badge');
    statusBadge.textContent = state.status;
    statusBadge.className = `status-badge ${state.status.toLowerCase()}`;

    // Update resource usage
    const cpuBar = vmCard.querySelector('.cpu-progress');
    const ramBar = vmCard.querySelector('.ram-progress');
    cpuBar.style.width = `${state.cpu}%`;
    ramBar.style.width = `${state.ram}%`;

    // Update task progress
    if (state.currentTask) {
        const progressBar = vmCard.querySelector('.task-progress');
        progressBar.style.width = `${state.currentTask.progress}%`;
        vmCard.querySelector('.task-description').textContent = state.currentTask.description;
    }
}

// Form Handling
document.getElementById('createAgentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const config = {
        type: formData.get('agentType'),
        cpu: parseInt(formData.get('cpu')),
        ram: parseInt(formData.get('ram')),
        disk: parseInt(formData.get('disk'))
    };

    const agent = await createNewAgent(config);
    if (agent) {
        hideModal('createAgentModal');
        showSuccess('Agent created successfully!');
    }
});

// Navigation Highlighting
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        document.querySelector('.nav-link.active').classList.remove('active');
        e.target.classList.add('active');
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    playDemo();
});

// Cleanup
window.addEventListener('beforeunload', () => {
    clearInterval(demoInterval);
}); 