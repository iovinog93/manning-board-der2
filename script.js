// script.js
const firebaseConfig = {
    apiKey: "AIzaSyBRPqn830ynSCDK7Zr_GPOAIso9nITaeiI",
    authDomain: "manning-board.firebaseapp.com",
    databaseURL: "https://manning-board-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "manning-board",
    storageBucket: "manning-board.firestorage.app",
    messagingSenderId: "30137335760",
    appId: "1:301373357630:web:344c0956ea271250131b6f",
    measurementId: "YOG-R0PEJ95MQ4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Global variables
let selectedInputs = [];

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.getElementById('notification-container').appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showLoading() {
    if (!document.querySelector('.loader')) {
        const loader = document.createElement('div');
        loader.className = 'loader';
        document.body.appendChild(loader);
    }
}

function hideLoading() {
    const loaders = document.querySelectorAll('.loader');
    loaders.forEach(loader => loader.remove());
}

// Input Validation
function validateInput(value) {
    return /^[a-zA-Z0-9._-]+$/.test(value);
}

// Debounce Function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// DOM Generation Functions
function generateAisleRows(letter, start, end, isDualInput = false) {
    let html = '';
    for (let i = start; i <= end; i++) {
        const aisleNumber = i.toString().padStart(2, '0'); // Ensure 2 digits
        if (isDualInput) {
            html += `
                <div class="aisle-row">
                    <div class="aisle">${letter}${aisleNumber}</div>
                    <div class="input-pair">
                        <div class="input-group">
                            <input type="text" class="name-input" placeholder="Picker">
                            <div class="badge-container">
                                <button class="badge-icon" aria-label="Show badge photo">📷</button>
                                <img class="photo-popup" src="" alt="Badge Photo" loading="lazy">
                            </div>
                        </div>
                        <div class="input-group">
                            <input type="text" class="name-input" placeholder="Stower">
                            <div class="badge-container">
                                <button class="badge-icon" aria-label="Show badge photo">📷</button>
                                <img class="photo-popup" src="" alt="Badge Photo" loading="lazy">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="aisle-row">
                    <div class="aisle">${letter}${aisleNumber}</div>
                    <input type="text" class="name-input" placeholder="Enter login">
                    <div class="badge-container">
                        <button class="badge-icon" aria-label="Show badge photo">📷</button>
                        <img class="photo-popup" src="" alt="Badge Photo" loading="lazy">
                    </div>
                </div>
            `;
        }
    }
    return html;
}

function createInductTables() {
    const inductTablesContainer = document.getElementById('induct-tables-container');
    const tableHTML = `
        <table class="induct-table">
            <thead>
                <tr><th colspan="2">Induct Tables</th></tr>
            </thead>
            <tbody>
                ${Array.from({length: 8}, (_, i) => `
                    <tr>
                        <td>
                            <div class="table-row-content">
                                <span class="table-data">Table ${i + 1}</span>
                                <input type="text" class="name-input" placeholder="Enter login">
                                <div class="badge-container">
                                    <button class="badge-icon" aria-label="Show badge photo">📷</button>
                                    <img class="photo-popup" src="" alt="Badge Photo" loading="lazy">
                                </div>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    inductTablesContainer.innerHTML = tableHTML;
}

// Badge Photo Functions
const photoCache = new Map();

async function getBadgePhoto(uid) {
    if (!validateInput(uid)) return '';
    if (photoCache.has(uid)) return photoCache.get(uid);
    
    const baseUrl = 'https://badgephotos.corp.amazon.com/';
    try {
        const response = await fetch(`${baseUrl}?uid=${uid}`);
        const photoUrl = response.url;
        photoCache.set(uid, photoUrl);
        return photootoUrl;
    } catch (error) {
        console.error('Error fetching badge photo:', error);
        return '';
    }
}

function updateBadgePhoto(inputput) {
    if (!validateInput(input.value)) {
        showNotification('Invalid input format', 'error');
        return;
    }
    const imgElement = input.nextElementSibling.querySelector('img');
    const baseUrl = 'https://badgephotos.corp.amazon.com/?fullsizeimage=1&give404ifmissing=1&uid=';
    imgElement.src = baseUrl + input.value;
}

// Firebase Functions
const debouncedSaveData = debounce(saveData, 1000);

async function saveData() {
    const inputs = document.querySelectorAll('.name-input');
    const data = {};
    
    inputs.forEach((input, index) => {
        if (input.value) {
            data[index] = input.value;
        }
    });
    
    try {
        showLoading();
        await database.ref('manning').set(data);
        showNotification('Data saved successfully', 'success');
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('Error saving data', 'error');
    } finally {
        hideLoading();
    }
}

async function loadData() {
    try {
        showLoading();
        const snapshot = await database.ref('manning').once('value');
        const data = snapshot.val() || {};
        const inputs = document.querySelectorAll('.name-input');
        
        inputs.forEach((input, index) => {
            if (data[index]) {
                input.value = data[index];
                updateBadgePhoto(input);
            }
        });
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('Error loading data', 'error');
    } finally {
        hideLoading();
    }
}

// Event Handlers
document.addEventListener('DOMContentLoaded', () => {
    // Generate content
    document.getElementById('c1-26-container').innerHTML = generateAisleRows('C', 1, 26);
    document.getElementById('c27-52-container').innerHTML = generateAisleRows('C', 27, 52);
    document.getElementById('b1-26-container').innerHTML = generateAisleRows('B', 1, 26, true);
    document.getElementById('b27-52-container').innerHTML = generateAisleRows('B', 27, 52, true);
    document.getElementById('a1-26-container').innerHTML = generateAisleRows('A', 1, 26, true);
    document.getElementById('a27-52-container').innerHTML = generateAisleRows('A', 27, 52, true);

    // Create induct tables
    createInductTables();

    // Setup event delegation
    document.addEventListener('click', (e) => {
        if (e.target.matches('.name-input')) {
            selectInput(e.target);
        } else if (e.target.matches('.badge-icon')) {
            showPhoto(e.target);
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.matches('.badge-icon')) {
            hidePhoto(e.target);
        }
    });

    // Input event listeners
    document.querySelectorAll('.name-input').forEach(input => {
        input.addEventListener('input', () => {
            updateBadgePhoto(input);
            debouncedSaveData();
        });
    });

    // Sidebar functionality
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    const overlay = document.getElementById('overlay');

    openBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    });

    // Load initial data
    loadData();
});
