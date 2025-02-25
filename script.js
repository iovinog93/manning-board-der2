// config.js
export const firebaseConfig = {
    apiKey: "AIzaSyBRPqn830ynSCDK7Zr_GPOAIso9nITaeiI",
    authDomain: "manning-board.firebaseapp.com",
    databaseURL: "https://manning-board-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "manning-board",
    storageBucket: "manning-board.firestorage.app",
    messagingSenderId: "30137335760",
    appId: "1:301373357630:web:344c0956ea271250131b6f",
    measurementId: "YOG-R0PEJ95MQ4"
};

// utils.js
export const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    showLoading() {
        document.getElementById('loader').hidden = false;
        document.querySelector('.overlay').classList.add('show');
    },

    hideLoading() {
        document.getElementById('loader').hidden = true;
        document.querySelector('.overlay').classList.remove('show');
    },

    validateInput(value) {
        return typeof value === 'string' && 
               value.trim().length > 0 && 
               value.trim().length <= 50;
    }
};

// domGenerator.js
export class DOMGenerator {
    static generateAisleRows(letter, start, end, isDualInput = false) {
        const fragment = document.createDocumentFragment();
        
        for (let i = start; i <= end; i++) {
            const row = document.createElement('div');
            row.className = 'aisle-row';
            
            if (isDualInput) {
                row.innerHTML = `
                    <div class="aisle">${letter}${i}</div>
                    <div class="input-pair">
                        <div class="input-group">
                            <input type="text" class="name-input" data-position="${letter}${i}-picker" placeholder="Picker">
                            <div class="badge-container">
                                <button class="badge-icon" aria-label="Show badge photo">📷</button>
                                <img class="photo-popup" src="" alt="Badge Photo" loading="lazy">
                            </div>
                        </div>
                        <div class="input-group">
                            <input type="text" class="name-input" data-position="${letter}${i}-stower" placeholder="Stower">
                            <div class="badge-container">
                                <button class="badge-icon" aria-label="Show badge photo">📷</button>
                                <img class="photo-popup" src="" alt="Badge Photo" loading="lazy">
                            </div>
                        </div>
                    </div>
                `;
            } else {
                row.innerHTML = `
                    <div class="aisle">${letter}${i}</div>
                    <input type="text" class="name-input" data-position="${letter}${i}" placeholder="Enter login">
                    <div class="badge-container">
                        <button class="badge-icon" aria-label="Show badge photo">📷</button>
                        <img class="photo-popup" src="" alt="Badge Photo" loading="lazy">
                    </div>
                `;
            }
            
            fragment.appendChild(row);
        }
        
        return fragment;
    }

    static generateInductTables() {
        const fragment = document.createDocumentFragment();
        
        for (let i = 1; i <= 6; i++) {
            const table = document.createElement('table');
            table.className = 'induct-table';
            table.innerHTML = `
                <thead>
                    <tr><th>Induct ${i}</th></tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            <div class="table-row-content">
                                <span class="table-data">Receiver</span>
                                <input type="text" class="name-input" data-position="induct-${i}-receiver" placeholder="Enter login">
                                <div class="badge-container">
                                    <button class="badge-icon" aria-label="Show badge photo">📷</button>
                                    <img class="photo-popup" src="" alt="Badge Photo" loading="lazy">
                                </div>
                            </div>
                        </td>
                    </tr>
                    <!-- Simili per Feeder e Pusher -->
                </tbody>
            `;
            fragment.appendChild(table);
        }
        
        return fragment;
    }
}

// databaseManager.js
export class DatabaseManager {
    constructor(firebase, config) {
        if (!DatabaseManager.instance) {
            firebase.initializeApp(config);
            this.database = firebase.database();
            this.setupConnectionMonitoring();
            DatabaseManager.instance = this;
        }
        return DatabaseManager.instance;
    }

    setupConnectionMonitoring() {
        this.database.ref('.info/connected').on('value', (snap) => {
            const isConnected = snap.val();
            utils.showNotification(
                `Database ${isConnected ? 'connected' : 'disconnected'}`,
                isConnected ? 'success' : 'error'
            );
        });
    }

    async saveData(data) {
        try {
            utils.showLoading();
            await this.database.ref('manning').set(data);
            utils.showNotification('Data saved successfully', 'success');
        } catch (error) {
            console.error('Error saving data:', error);
            utils.showNotification('Error saving data', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    subscribeToData(callback) {
        try {
            utils.showLoading();
            this.database.ref('manning').on('value', (snapshot) => {
                const data = snapshot.val() || {};
                callback(data);
                utils.hideLoading();
            }, (error) => {
                console.error('Error loading data:', error);
                utils.showNotification('Error loading data', 'error');
                utils.hideLoading();
            });
        } catch (error) {
            console.error('Error setting up data listener:', error);
            utils.showNotification('Error setting up data listener', 'error');
            utils.hideLoading();
        }
    }

    unsubscribeFromData() {
        this.database.ref('manning').off();
    }
}

// inputManager.js
export class InputManager {
    constructor(databaseManager) {
        this.selectedInputs = [];
        this.databaseManager = databaseManager;
        this.saveDataDebounced = utils.debounce(this.saveData.bind(this), 500);
    }

    handleInputSelect(input) {
        if (this.selectedInputs.includes(input)) {
            input.classList.remove('selected-input');
            this.selectedInputs = this.selectedInputs.filter(i => i !== input);
        } else if (this.selectedInputs.length >= 2) {
            this.selectedInputs.forEach(inp => inp.classList.remove('selected-input'));
            this.selectedInputs = [input];
            input.classList.add('selected-input');
        } else {
            this.selectedInputs.push(input);
            input.classList.add('selected-input');
        }

        if (this.selectedInputs.length === 2) {
            this.swapSelectedInputs();
        }
    }

    swapSelectedInputs() {
        if (this.selectedInputs.length === 2) {
            const [input1, input2] = this.selectedInputs;
            const temp = input1.value;
            input1.value = input2.value;
            input2.value = temp;

            this.selectedInputs.forEach(input => {
                this.updateBadgePhoto(input);
                input.classList.remove('selected-input');
            });

            this.selectedInputs = [];
            this.saveDataDebounced();
        }
    }

    updateBadgePhoto(input) {
        const imgElement = input.nextElementSibling.querySelector('img');
        if (imgElement && input.value) {
            const baseUrl = 'https://badgephotos.corp.amazon.com/?fullsizeimage=1&give404ifmissing=1&uid=';
            imgElement.src = `${baseUrl}${input.value.trim()}`;
        }
    }

    saveData() {
        const data = {};
        document.querySelectorAll('.name-input').forEach(input => {
            if (input.value && utils.validateInput(input.value)) {
                data[input.dataset.position] = input.value.trim();
            }
        });
        this.databaseManager.saveData(data);
    }

    loadData(data) {
        document.querySelectorAll('.name-input').forEach(input => {
            const position = input.dataset.position;
            if (data[position]) {
                input.value = data[position];
                this.updateBadgePhoto(input);
            } else {
                input.value = '';
            }
        });
    }
}

// eventManager.js
export class EventManager {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Input events
        document.querySelectorAll('.name-input').forEach(input => {
            input.addEventListener('click', () => this.inputManager.handleInputSelect(input));
            input.addEventListener('input', () => {
                this.inputManager.updateBadgePhoto(input);
                this.inputManager.saveDataDebounced();
            });
        });

        // Badge photo events
        document.querySelectorAll('.badge-icon').forEach(icon => {
            icon.addEventListener('mouseover', () => this.showPhoto(icon));
            icon.addEventListener('mouseout', () => this.hidePhoto(icon));
        });

        // Sidebar events
        this.setupSidebarEvents();

        // Task button events
        this.setupTaskButtonEvents();
    }

    showPhoto(element) {
        const img = element.nextElementSibling;
        if (img.src && img.src.includes('uid=')) {
            img.classList.add('visible');
        }
    }

    hidePhoto(element) {
        element.nextElementSibling.classList.remove('visible');
    }

    setupSidebarEvents() {
        const sidebar = document.getElementById('sidebar');
        const openBtn = document.getElementById('openSidebar');
        const closeBtn = document.getElementById('closeSidebar');
        const overlay = document.querySelector('.overlay');

        openBtn.addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.classList.add('show');
        });

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('show');
        };

        closeBtn.addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);

        document.querySelectorAll('.expandable').forEach(item => {
            item.addEventListener('click', () => item.classList.toggle('open'));
        });
    }

    setupTaskButtonEvents() {
        document.querySelectorAll('.task-button').forEach(button => {
            button.addEventListener('click', () => {
                const task = button.dataset.task;
                utils.showNotification(`Task ${task} clicked`, 'info');
                // Implementare la logica specifica per ogni task
            });
        });
    }
}

// main.js
import { firebaseConfig } from './config.js';
import { DatabaseManager } from './databaseManager.js';
import { InputManager } from './inputManager.js';
import { EventManager } from './eventManager.js';
import { DOMGenerator } from './domGenerator.js';

class App {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Initialize managers
            this.databaseManager = new DatabaseManager(firebase, firebaseConfig);
            this.inputManager = new InputManager(this.databaseManager);
            this.eventManager = new EventManager(this.inputManager);

            // Generate DOM
            this.generateContent();

            // Load initial data
            this.databaseManager.subscribeToData(data => this.inputManager.loadData(data));

            // Setup cleanup
            window.addEventListener('unload', () => this.cleanup());
        } catch (error) {
            console.error('Error initializing app:', error);
            utils.showNotification('Error initializing application', 'error');
        }
    }

    generateContent() {
        // Generate Finger content
        ['c', 'b', 'a'].forEach(letter => {
            document.getElementById(`${letter}1-26-container`).appendChild(
                DOMGenerator.generateAisleRows(letter.toUpperCase(), 1, 26, letter !== 'c')
            );
            document.getElementById(`${letter}27-52-container`).appendChild(
                DOMGenerator.generateAisleRows(letter.toUpperCase(), 27, 52, letter !== 'c')
            );
        });

        // Generate Induct Tables
        document.getElementById('induct-tables-container').appendChild(
            DOMGenerator.generateInductTables()
        );
    }

    cleanup() {
        this.databaseManager.unsubscribeFromData();
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}

