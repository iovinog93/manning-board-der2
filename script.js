// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "manning-board.firebaseapp.com",
    databaseURL: "https://manning-board-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "manning-board",
    storageBucket: "manning-board.firestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Global variables
let selectedInputs = [];

// DOM Generation Functions
function generateAisleRows(letter, start, end, isDualInput = false) {
    let html = '';
    for (let i = start; i <= end; i++) {
        if (isDualInput) {
            html += `
                <div class="aisle-row">
                    <div class="aisle">${letter}${i}</div>
                    <div class="input-pair">
                        <div class="input-group">
                            <input type="text" class="name-input" placeholder="Picker">
                            <div class="badge-container">
                                <div class="badge-icon">📷</div>
                                <img class="photo-popup" src="" alt="Badge Photo">
                            </div>
                        </div>
                        <div class="input-group">
                            <input type="text" class="name-input" placeholder="Stower">
                            <div class="badge-container">
                                <div class="badge-icon">📷</div>
                                <img class="photo-popup" src="" alt="Badge Photo">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="aisle-row">
                    <div class="aisle">${letter}${i}</div>
                    <input type="text" class="name-input" placeholder="Enter login">
                    <div class="badge-container">
                        <div class="badge-icon">📷</div>
                        <img class="photo-popup" src="" alt="Badge Photo">
                    </div>
                </div>
            `;
        }
    }
    return html;
}

function generateInductTables() {
    let html = '';
    for (let i = 1; i <= 6; i++) {
        html += `
            <table class="induct-table">
                <tr><th>Induct ${i}</th></tr>
                <tr>
                    <td>
                        <div class="table-row-content">
                            <span class="table-data">Receiver</span>
                            <input type="text" class="name-input" placeholder="Enter login">
                            <div class="badge-container">
                                <div class="badge-icon">📷</div>
                                <img class="photo-popup" src="" alt="Badge Photo">
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="table-row-content">
                            <span class="table-data">Feeder</span>
                            <input type="text" class="name-input" placeholder="Enter login">
                            <div class="badge-container">
                                <div class="badge-icon">📷</div>
                                <img class="photo-popup" src="" alt="Badge Photo">
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="table-row-content">
                            <span class="table-data">Pusher</span>
                            <input type="text" class="name-input" placeholder="Enter login">
                            <div class="badge-container">
                                <div class="badge-icon">📷</div>
                                <img class="photo-popup" src="" alt="Badge Photo">
                            </div>
                        </div>
                    </td>
                </tr>
            </table>
        `;
    }
    return html;
}

// Badge Photo Functions
function updateBadgePhoto(input, imgElement) {
    const baseUrl = 'https://badgephotos.corp.amazon.com/?fullsizeimage=1&give404ifmissing=1&uid=';
    imgElement.src = baseUrl + input.value;
}

function showPhoto(element) {
    const img = element.nextElementSibling;
    if (img.src && img.src.includes('uid=')) {
        img.style.display = 'block';
    }
}

function hidePhoto(element) {
    element.nextElementSibling.style.display = 'none';
}
// Input Selection and Swap Functions
function selectInput(input) {
    if (selectedInputs.includes(input)) {
        input.classList.remove('selected-input');
        selectedInputs = selectedInputs.filter(i => i !== input);
    } else if (selectedInputs.length >= 2) {
        selectedInputs.forEach(inp => inp.classList.remove('selected-input'));
        selectedInputs = [input];
        input.classList.add('selected-input');
    } else {
        selectedInputs.push(input);
        input.classList.add('selected-input');
    }

    if (selectedInputs.length === 2) {
        swapSelected();
    }
}

function swapSelected() {
    if (selectedInputs.length === 2) {
        const temp = selectedInputs[0].value;
        selectedInputs[0].value = selectedInputs[1].value;
        selectedInputs[1].value = temp;

        selectedInputs.forEach(input => {
            input.dispatchEvent(new Event('input'));
            input.classList.remove('selected-input');
        });

        selectedInputs = [];
        saveData();
    }
}

// Firebase Data Functions
function saveData() {
    const inputs = document.querySelectorAll('.name-input');
    const data = {};
    
    inputs.forEach((input, index) => {
        if (input.value) {
            data[index] = input.value;
        }
    });
    
    database.ref('manning').').set(data)
        .then(() => {
            console.log('Data saved successfully');
            showNotification('Data saved successfully', 'success');
        })
        .catch((error) => {
            console.error('Error saving data:', error);
            showNotification('Error saving data', 'error');
        });
}

function loadData() {
    showLoading();
    database.ref('manning').on('value', (snapshot) => {
        const data = snapshot.val() || {};
        const inputs = document.querySelectorAll('.name-input');
        
        inputs.forEach((input, index) => {
            if (data[index]) {
                input.value = data[index];
                input.dispatchEvent(new Event('input'));
            } else {
                input.value = '';
            }
        });
        hideLoading();
    });
}

// Utility Functions
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Sidebar Functions
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    openBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    });

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }

    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    document.querySelectorAll('.expandable').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('open');
        });
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Input events
    document.querySelectorAll('.name-input').forEach(input => {
        input.addEventListener('click', () => selectInput(input));
        input.addEventListener('input', () => {
            updateBadgePhoto(input, input.nextElementSibling.querySelector('img'));
            saveData();
        });
    });

    // Badge photo events
    document.querySelectorAll('.badge-icon').forEach(icon => {
        icon.addEventListener('mouseover', () => showPhoto(icon));
        icon.addEventListener('mouseout', () => hidePhoto(icon));
    });

    // Task button events
    document.querySelectorAll('.task-button').forEach(button => {
        button.addEventListener('click', () => {
            console.log('Task clicked:', button.textContent);
            // Add task-specific logic here
        });
    });
}

// Page Initialization
function initializePage() {
    // Generate Finger content
    document.getElementById('c1-26-container').innerHTML = generateAisleRows('C', 1, 26);
    document.getElementById('c27-52-container').innerHTML = generateAisleRows('C', 27, 52);
    document.getElementById('b1-26-container').innerHTML = generateAisleRows('B', 1, 26, true);
    document.getElementById('b27-52-container').innerHTML = generateAisleRows('B', 27, 52, true);
    document.getElementById('a1-26-container').innerHTML = generateAisleRows('A', 1, 26, true);
    document.getElementById('a27-52-container').innerHTML = generateAisleRows('A', 27, 52, true);

    // Generate Induct Tables
    document.getElementById('induct-tables-container').innerHTML = generateInductTables();

    // Setup event listeners
    setupEventListeners();
    
    // Initialize sidebar
    initializeSidebar();
    
    // Load saved data
    loadData();
}

// Start initialization when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

// Monitor Firebase connection
database.ref('.info/connected').on('value', (snap) => {
    const isConnected = snap.val();
    console.log('Connection state:', isConnected ? 'connected' : 'disconnected');
    showNotification(
        `Database ${isConnected ? 'connected' : 'disconnected'}`,
        isConnected ? 'success' : 'error'
    );
});
