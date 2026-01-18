const CONFIG = {
    MODE: 'TEST', 
    AES_KEY: "SD_PRASIDHA_JAGTAP_V38_MASTER_KEY", 
    FIREBASE: {
        apiKey: "AIzaSyBJcK4zEK2Rb-Er8O7iDNYsGW2HUJANPBc",
        authDomain: "seamless-dash.firebaseapp.com",
        projectId: "seamless-dash"
    }
};

if (!firebase.apps.length) { firebase.initializeApp(CONFIG.FIREBASE); }
const db = firebase.firestore();

// 1. Setup Input Listeners for color changes
const nInput = document.getElementById('manual-name');
const iInput = document.getElementById('manual-id');

nInput.oninput = () => nInput.style.borderColor = /^[A-Za-z\s]{3,}$/.test(nInput.value) ? "#28a745" : "#A01018";
iInput.oninput = () => iInput.style.borderColor = /^\d{4,10}$/.test(iInput.value) ? "#28a745" : "#A01018";

async function handleManualEntry() {
    const name = nInput.value.trim();
    const id = iInput.value.trim();

    if (!/^[A-Za-z\s]{3,}$/.test(name) || !/^\d{4,10}$/.test(id)) {
        alert("Please fix the red fields.");
        return;
    }

    showSection('loader');

    try {
        const playerRef = db.collection("players").doc(id);
        const doc = await playerRef.get();

        let highScore = 0;
        if (doc.exists) {
            // DUPLICATE HANDLING: It exists, so we fetch the score and update the name/time
            highScore = doc.data().highScore || 0;
            await playerRef.update({ name: name, lastSeen: Date.now() });
        } else {
            // NEW PLAYER: Create record
            await playerRef.set({ name, highScore: 0, lastSeen: Date.now() });
        }

        displaySuccess(name, id, highScore);

    } catch (err) {
        alert("Database Error: " + err.message);
        showSection('manual-entry-box');
    }
}

function displaySuccess(name, id, score) {
    showSection('success-box');
    document.getElementById('success-box').innerHTML = `
        <div class="user-pill" style="background:#f0f9ff; padding:15px; border-radius:15px; margin-bottom:15px; border:1px solid #bae1ff;">
            <h2 style="color:#28a745; margin:0;">✔ Identity Verified</h2>
            <p>Welcome, <b>${name}</b></p>
            <p>Your High Score: <b>${score}</b></p>
        </div>
        <button class="main-btn" onclick="alert('Starting Game...')">LAUNCH DASH</button>
        <button class="main-btn" style="background:#666; margin-top:10px;" onclick="resetToHome()">BACK TO HOME</button>
    `;
}

function resetToHome() {
    nInput.value = "";
    iInput.value = "";
    nInput.style.borderColor = "#eee";
    iInput.style.borderColor = "#eee";
    showSection('manual-entry-box');
}

function showSection(id) {
    ['manual-entry-box', 'loader', 'success-box'].forEach(sec => {
        document.getElementById(sec).style.display = (sec === id) ? 'block' : 'none';
    });
}
