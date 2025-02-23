// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBRPqn830ynSCDK7Zr_GPOAIso9nITaeiI",
    authDomain: "manning-board.firebaseapp.com",
    databaseURL: "https://manning-board-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "manning-board",
    storageBucket: "manning-board.firestorage.app",
    messagingSenderId: "30137335760",
    appId: "1:30137335760:web:344c0956ea27125131b6f",
    measurementId: "G-R0PEJ95MQ4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
