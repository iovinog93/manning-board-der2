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

function generateTaskSections() {
    return `
        <div class="task-column">
            <div class="section-header">TASK INDUCT</div>
            <button class="task-button blue">TRUCK MARSHALL</button>
            <button class="task-button blue">WATER SPIDER</button>
            <button class="task-button blue">FEEDER</button>
            <button class="task-button blue">PROBLEM</button>
            <button class="task-button blue">TRUCK RELO</button>
            <button class="task-button blue">CARICO XPT</button>
        </div>
        <div class="task-column">
            <div class="section-header">TASK FINGER</div>
            <button class="task-button yellow">STRAIGHTENER</button>
            <button class="task-button yellow">PICKER</button>
            <button class="task-button yellow">DIVERTER</button>
            <button class="task-button yellow">READINESS</button>
            <button class="task-button orange">ENGAGE</button>
        </div>
        <div class="task-column">
            <div class="section-header">OTHER</div>
            <button class="task-button green">5S</button>
            <button class="task-button green">AMBASSADOR</button>
            <button class="task-button green">NEW HIRE</button>
            <button class="task-button green">ALL HANDS</button>
            <button class="task-button orange">OVERSTAFF</button>
        </div>
    `;
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
    
    database.ref('manning').set(data)
        .then(() => {
            console.log('Data saved successfully');
        })
        .catch((error) => {
            console.error('Error saving data:', error);
        });
}

function loadData() {
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
    // Generate Finger C content
    document.getElementById('c1-26-container').innerHTML = generateAisleRows('C', 1, 26);
    document.getElementById('c27-52-container').innerHTML = generateAisleRows('C', 27, 52);

    // Generate Finger B content
    document.getElementById('b1-26-container').innerHTML = generateAisleRows('B', 1, 26, true);
    document.getElementById('b27-52-container').innerHTML = generateAisleRows('B', 27, 52, true);

    // Generate Finger A content
    document.getElementById('a1-26-container').innerHTML = generateAisleRows('A', 1, 26, true);
    document.getElementById('a27-52-container').innerHTML = generateAisleRows('A', 27, 52, true);

    // Generate Induct Tables
    document.getElementById('induct-tables-container').innerHTML = generateInductTables();

    // Generate Task Sections
    document.getElementById('task-sections-container').innerHTML = generateTaskSections();

    // Setup event listeners
    setupEventListeners();

    // Load saved data
    loadData();

    console.log('Page initialized successfully');
}

// Start initialization when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}
// Aggiungi questo JavaScript al tuo file main.js
document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('openSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    
    // Crea l'overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Apri sidebar
    openBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('show');
    });

    // Chiudi sidebar
    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
    }

    closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Gestione elementi espandibili
    document.querySelectorAll('.expandable').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('open');
        });
    });
});


// Monitor Firebase connection
database.ref('.info/connected').on('value', (snap) => {
    console.log('Connection state:', snap.val() ? 'connected' : 'disconnected');
});
