// Firebase Configuration
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
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.loader');
    if (loader) loader.remove();
}

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
                            <input type="text" class="na"name-input" placeholder="Stower">
                            <div class="badge-container">
                                <div class="badge-icon">📷</div>
                                <img class="photo-popup" src="" alt="Badgadge Photo">
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

// Input and Badge Functions
function updateBadgePhoto(input) {
    const imgElement = input.nextElementSibling.querySelector('img');
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
            updateBadgePhoto(input);
            input.classList.remove('selected-input');
        });

        selectedInputs = [];
        saveData();
    }
}

// Firebase Functions
function saveData() {
    const inputs = document.querySelectorAll('.name-input');
    const data = {};
    
    inputs.forEach((input, index) => {
        if (input.value) {
            data[index] = input.value;
        }
    });
    
    showLoading();
    database.ref('manning').set(data)
        .then(() => {
            hideLoading();
            showNotification('Data saved successfully', 'success');
        })
        .catch(error => {
            hideLoading();
            showNotification('Error saving data', 'error');
            console.error('Error:', error);
        });
}

function loadData() {
    showLoading();
    database.ref('manning').once('value')
        .then(snapshot => {
            const data = snapshot.val() || {};
            const inputs = document.querySelectorAll('.name-input');
            
            inputs.forEach((input, index) => {
                if (data[index]) {
                    input.value = data[index];
                    updateBadgePhoto(input);
                }
            });
            hideLoading();
        })
        .catch(error => {
            hideLoading();
            showNotification('Error loading data', 'error');
            console.error('Error:', error);
        });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Generate content
    document.getElementById('c1-26-container').innerHTML = generateAisleRows('C', 1, 26);
    document.getElementById('c27-52-container').innerHTML = generateAisleRows('C', 27, 52);
    document.getElementById('b1-26-container').innerHTML = generateAisleRows('B', 1, 26, true);
    document.getElementById('b27-52-container').innerHTML = generateAisleRows('B', 27, 52, true);
    document.getElementById('a1-26-container').innerHTML = generateAisleRows('A', 1, 26, true);
    document.getElementById('a27-52-container').innerHTML = generateAisleRows('A', 27, 52, true);

    // Setup event listeners
    document.querySelectorAll('.name-input').forEach(input => {
        input.addEventListener('click', () => selectInput(input));
        input.addEventListener('input', () => {
            updateBadgePhoto(input);
            saveData();
        });
    });

    document.querySelectorAll('.badge-icon').forEach(icon => {
        icon.addEventListener('mouseover', () => showPhoto(icon));
        icon.addEventListener('mouseout', () => hidePhoto(icon));
    });

    // Initialize sidebar
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');

    openBtn.addEventListener('click', () => sidebar.classList.add('open'));
    closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    // Load initial data
    loadData();
});
