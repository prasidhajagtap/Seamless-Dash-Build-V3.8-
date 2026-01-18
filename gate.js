/** * PHASE 1: TRANSPARENT IDENTITY GATE
 * This version focuses on NOT freezing and ensuring Firebase connection.
 */
const CONFIG = {
    MODE: 'TEST', 
    AES_KEY: "SD_PRASIDHA_JAGTAP_V38_MASTER_KEY", 
    FIREBASE: {
        apiKey: "AIzaSyBJcK4zEK2Rb-Er8O7iDNYsGW2HUJANPBc",
        authDomain: "seamless-dash.firebaseapp.com",
        projectId: "seamless-dash",
        storageBucket: "seamless-dash.appspot.com",
        appId: "1:777443834151:web:357732a3f019688439167c"
    }
};

// Initialize Firebase
if (!firebase.apps.length) { firebase.initializeApp(CONFIG.FIREBASE); }
const db = firebase.firestore();

// 1. REAL-TIME VALIDATION (Visual Feedback)
document.getElementById('manual-name').addEventListener('input', function(e) {
    this.style.borderColor = /^[A-Za-z\s]{3,}$/.test(this.value) ? "#28a745" : "#A01018";
});

document.getElementById('manual-id').addEventListener('input', function(e) {
    this.style.borderColor = /^\d{4,10}$/.test(this.value) ? "#28a745" : "#A01018";
});

async function handleManualEntry() {
    const name = document.getElementById('manual-name').value.trim();
    const id = document.getElementById('manual-id').value.trim();

    // Re-verify before sending
    if (!/^[A-Za-z\s]{3,}$/.test(name) || !/^\d{4,10}$/.test(id)) {
        alert("Check the red boxes! Name needs letters, ID needs 4-10 numbers.");
        return;
    }

    toggleLoader(true, "Connecting to Seamex Servers...");

    try {
        // Set a 5-second timeout so it never "Freezes"
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase Timeout - Check your Internet or Rules")), 5000));
        
        await Promise.race([proceedToGame(name, id), timeout]);

    } catch (err) {
        console.error("Gate Error:", err);
        alert("CONNECTION ERROR: " + err.message);
        toggleLoader(false); // This UNFREEZES the screen
    }
}

async function proceedToGame(name, id) {
    // 2. DATA FLOW TEST
    // We send simple data first to see if it hits your Dashboard
    const playerRef = db.collection("players").doc(id);
    
    await playerRef.set({
        name: name,
        lastSeen: Date.now(),
        status: "Verified",
        highScore: 0 // Initialize at zero
    }, { merge: true });

    // 3. UI SUCCESS (No high score displayed yet)
    document.getElementById('auth-screen').innerHTML = `
        <div class="user-pill">
            <h1 style="color:#28a745">✔ Verified</h1>
            <p>Welcome, <b>${name}</b></p>
            <small>ID: ${id} | Sync: Active</small>
        </div>
        <button class="main-btn" onclick="alert('Now we can build the game!')">READY FOR PHASE 2</button>
    `;
}

function toggleLoader(show, msg) {
    document.getElementById('loader').style.display = show ? 'block' : 'none';
    document.getElementById('loader').innerText = msg;
    document.getElementById('manual-entry-box').style.display = show ? 'none' : 'block';
}
