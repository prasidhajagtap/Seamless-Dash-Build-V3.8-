/** * PHASE 1: IDENTITY GATE (With Back Button & Duplicate Handling)
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

if (!firebase.apps.length) { firebase.initializeApp(CONFIG.FIREBASE); }
const db = firebase.firestore();

// Real-time Visual Validation
function setupValidation() {
    const n = document.getElementById('manual-name');
    const i = document.getElementById('manual-id');
    if(!n || !i) return;

    n.oninput = () => n.style.borderColor = /^[A-Za-z\s]{3,}$/.test(n.value) ? "#28a745" : "#A01018";
    i.oninput = () => i.style.borderColor = /^\d{4,10}$/.test(i.value) ? "#28a745" : "#A01018";
}
setupValidation();

async function handleManualEntry() {
    const name = document.getElementById('manual-name').value.trim();
    const id = document.getElementById('manual-id').value.trim();

    if (!/^[A-Za-z\s]{3,}$/.test(name) || !/^\d{4,10}$/.test(id)) {
        alert("Invalid Input: Name (Letters only), ID (4-10 Numbers)");
        return;
    }

    toggleLoader(true, "Checking Poornata Database...");

    try {
        await proceedToGame(name, id);
    } catch (err) {
        alert("Sync Error: " + err.message);
        toggleLoader(false);
    }
}

async function proceedToGame(name, id) {
    const playerRef = db.collection("players").doc(id);
    const doc = await playerRef.get();

    let highScore = 0;
    if (doc.exists) {
        // DUPLICATE ID HANDLED: Use existing score, update name
        highScore = doc.data().highScore || 0;
        await playerRef.update({ name: name, lastSeen: Date.now() });
    } else {
        // NEW PLAYER: Create fresh record
        await playerRef.set({
            name: name,
            highScore: 0,
            lastSeen: Date.now(),
            status: "Verified"
        });
    }

    // SUCCESS UI with "Back to Home"
    document.getElementById('manual-entry-box').style.display = 'none';
    document.getElementById('loader').style.display = 'none';
    
    // Inject the Verification Screen
    const authScreen = document.getElementById('auth-screen');
    authScreen.innerHTML = `
        <div class="user-pill">
            <h2 style="color:#28a745; margin:0;">✔ Identity Verified</h2>
            <p>Welcome back, <b>${name}</b></p>
            <p style="font-size:13px;">Your Current High Score: <b>${highScore}</b></p>
        </div>
        <button class="main-btn" onclick="alert('Starting Game...')">LAUNCH GAME</button>
        <button class="main-btn" style="background:#666; margin-top:10px;" onclick="location.reload()">BACK TO HOME</button>
    `;
}

function toggleLoader(show, msg) {
    const l = document.getElementById('loader');
    const b = document.getElementById('manual-entry-box');
    if(l) { l.style.display = show ? 'block' : 'none'; l.innerText = msg; }
    if(b) { b.style.display = show ? 'none' : 'block'; }
}
