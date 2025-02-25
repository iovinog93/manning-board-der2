// Firebase Configuration
const firebaseConfig = {
    apiKey: "***************************************",
    authDomain: "manning-board.firebaseapp.com",
    databaseURL: "https://manning-board-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "manning-board",
    storageBucket: "manning-board.firestorage.app",
    messagingSenderId: "************",
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

function padNumber(number) {
    return number < 10 ? '0' + number : number.toString();
}

// Input Selection Functions
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
        swapInputs();
    }
}

function swapInputs() {
    if (selectedInputs.length === 2) {
        const temp = selectedInputs[0].value;
        selectedInputs[0].value = selectedInputs[1].value;
        selectedInputs[1].value = temp;

        // Scambia anche le foto
        const photo1 = selectedInputs[0].parentElement.querySelector('.photo-popup');
        const photo2 = selectedInputs[1].parentElement.querySelector('.photo-popup');
        const tempSrc = photo1.src;
        photo1.src = photo2.src;
        photo2.src = tempSrc;

        selectedInputs.forEach(input => {
            input.classList.remove('selected-input');
        });

        selectedInputs = [];
        saveToFirebase();
    }
}

// Firebase Functions
function saveToFirebase() {
    const data = {};
    document.querySelectorAll('.name-input').forEach((input, index) => {
        if (input.value.trim()) {
            data[index] = input.value.trim();
        }
    });

    database.ref('manning').set(data)
        .then(() => showNotification('Saved successfully', 'success'))
        .catch(error => showNotification('Error saving data', 'error'));
}

function loadFromFirebase() {
    database.ref('manning').once('value')
        .then(snapshot => {
            const data = snapshot.val() || {};
            document.querySelectorAll('.name-input').forEach((input, index) => {
                if (data[index]) {
                    input.value = data[index];
                    updateBadgePhoto(input);
                }
            });
        })
        .catch(error => showNotification('Error loading data', 'error'));
}

// Badge Photo Functions
function updateBadgePhoto(input) {
    const photoContainer = input.parentElement.querySelector('.badge-photo-container');
    const photo = photoContainer.querySelector('.photo-popup');
    if (photo && input.value) {
        const baseUrl = 'https://badgephotos.corp.amazon.com/?fullsizeimage=1&give404ifmissing=1&uid=';
        photo.src = baseUrl + input.value.trim();
    }
}

// Generate Induct Tables
function createInductTables() {
    const inductTablesContainer = document.getElementById('induct-tables-container');
    const tableHTML = `
        <table class="roles-table">
            <thead>
                <tr><th>Induct Tables</th></tr>
            </thead>
            <tbody>
                ${Array.from({length: 8}, (_, i) => `
                    <tr>
                        <td>
                            <div class="table-row-content">
                                <span class="table-data">Table ${i + 1}</span>
                                <!-- Pusher -->
                                <div class="input-group">
                                    <input type="text" class="name-input" placeholder="Pusher">
                                    <div class="badge-photo-container">
                                        <img class="photo-popup" src="" alt="Badge Photo">
                                    </div>
                                </div>
                                <!-- Receiver -->
                                <div class="input-group">
                                    <input type="text" class="name-input" placeholder="Receiver">
                                    <div class="badge-photo-container">
                                        <img class="photo-popup" src="" alt="Badge Photo">
                                    </div>
                                </div>
                                <!-- Feeder -->
                                <div class="input-group">
                                    <input type="text" class="name-input" placeholder="Feeder">
                                    <div class="badge-photo-container">
                                        <img class="photo-popup" src="" alt="Badge Photo">
                                    </div>
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

// Generate Aisle Rows
function generateAisleRows(letter, start, end, isDualInput = false) {
    let html = '';
    for (let i = start; i <= end; i++) {
        const aisleNumber = padNumber(i);
        if (isDualInput) {
            html += `
                <div class="aisle-row">
                    <div class="aisle">${letter}${aisleNumber}</div>
                    <div class="input-pair">
                        <div class="input-group">
                            <input type="text" class="name-input" placeholder="Picker">
                            <div class="badge-photo-container">
                                <img class="photo-popup" src="" alt="Badge Photo">
                            </div>
                        </div>
                        <div class="input-group">
                            <input type="text" class="name-input" placeholder="Stower">
                            <div class="badge-photo-container">
                                <img class="photo-popup" src="" alt="Badge Photo">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="aisle-row">
                    <div class="aisle">${letter}${aisleNumber}</div>
                    <div class="input-group">
                        <input type="text" class="name-input" placeholder="Enter login">
                        <div class="badge-photo-container">
                            <img class="photo-popup" src="" alt="Badge Photo">
                        </div>
                    </div>
                </div>
            `;
        }
    }
    return html;
}

// Initialize Sidebar Functions
function initializeSidebar() {
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
}

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
    // Generate all aisle containers
    document.getElementById('c1-26-container').innerHTML = generateAisleRows('C', 1, 26);
    document.getElementById('c27-52-container').innerHTML = generateAisleRows('C', 27, 52);
    document.getElementById('b1-26-container').innerHTML = generateAisleRows('B', 1, 26, true);
    document.getElementById('b27-52-container').innerHTML = generateAisleRows('B', 27, 52, true);
    document.getElementById('a1-26-container').innerHTML = generateAisleRows('A', 1, 26, true);
    document.getElementById('a27-52-container').innerHTML = generateAisleRows('A', 27, 52, true);

    // Create induct tables
    createInductTables();

    // Initialize sidebar
    initializeSidebar();

    // Add event listeners for input selection
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('name-input')) {
            selectInput(e.target);
        }
    });

    // Add input event listeners
    document.querySelectorAll('.name-input').forEach(input => {
        input.addEventListener('input', () => {
            updateBadgePhoto(input);
            saveToFirebase();
        });
    });

    // Load initial data from Firebase
    loadFromFirebase();
});
