/** * PHASE 1: HARDENED IDENTITY GATE
 * Fixes: Input Validation, UI Freezing, and Firebase Data Flow
 */
const CONFIG = {
    MODE: 'TEST', 
    AES_KEY: "SD_PRASIDHA_JAGTAP_V38_MASTER_KEY", // MUST BE SAME AS ADMIN PANEL
    FIREBASE: {
        apiKey: "AIzaSyBJcK4zEK2Rb-Er8O7iDNYsGW2HUJANPBc",
        authDomain: "seamless-dash.firebaseapp.com",
        projectId: "seamless-dash",
        storageBucket: "seamless-dash.appspot.com",
        messagingSenderId: "777443834151",
        appId: "1:777443834151:web:357732a3f019688439167c"
    }
};

// Initialize Firebase with full config to prevent connection drops
if (!firebase.apps.length) {
    firebase.initializeApp(CONFIG.FIREBASE);
}
const db = firebase.firestore();

async function encryptID(rawId) {
    try {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(CONFIG.AES_KEY);
        const hash = await crypto.subtle.digest("SHA-256", keyData);
        const key = await crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt"]);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(rawId));

        return {
            pid_enc: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
            pid_iv: btoa(String.fromCharCode(...iv))
        };
    } catch (e) {
        throw new Error("Encryption Failed: " + e.message);
    }
}

async function handleManualEntry() {
    const nameEl = document.getElementById('manual-name');
    const idEl = document.getElementById('manual-id');
    const name = nameEl.value.trim();
    const id = idEl.value.trim();

    // 1. CLEAR PREVIOUS ERRORS
    nameEl.style.borderColor = "#eee";
    idEl.style.borderColor = "#eee";

    // 2. STRICT VALIDATION
    let hasError = false;
    if (!/^[A-Za-z\s]{3,}$/.test(name)) {
        nameEl.style.borderColor = "red";
        hasError = true;
    }
    if (!/^\d{4,10}$/.test(id)) {
        idEl.style.borderColor = "red";
        hasError = true;
    }

    if (hasError) {
        alert("PLEASE CORRECT: \n- Name: Letters only (min 3)\n- ID: Numbers only (4-10 digits)");
        return;
    }

    // 3. START FLOW
    toggleLoader(true, "Securing Identity...");
    
    try {
        await proceedToGame(name, id);
    } catch (err) {
        console.error("Critical Error:", err);
        alert("DATABASE ERROR: " + err.message);
        toggleLoader(false); // Unfreeze the screen so they can try again
    }
}

async function proceedToGame(name, id) {
    // Encrypt the ID
    const secureData = await encryptID(id);
    
    // Prepare Data for Firebase
    const userData = {
        name: name,
        pid_enc: secureData.pid_enc,
        pid_iv: secureData.pid_iv,
        lastSeen: Date.now(),
        highScore: 0 // Default for new players
    };

    // 4. DATA FLOW: Update Firebase
    // We use the ID as the Document ID to prevent duplicates
    const playerRef = db.collection("players").doc(id);
    const doc = await playerRef.get();

    if (doc.exists) {
        // If player exists, just update their "lastSeen"
        await playerRef.update({ lastSeen: Date.now(), name: name });
        userData.highScore = doc.data().highScore || 0;
    } else {
        // Create new player record
        await playerRef.set(userData);
    }

    // Store globally for game engine
    window.gameUser = { ...userData, id };

    // 5. SUCCESS UI
    document.getElementById('auth-screen').innerHTML = `
        <div class="user-pill">
            <h1>Ready, ${name}!</h1>
            <p>Your Best: ${userData.highScore}</p>
        </div>
        <button class="main-btn" onclick="alert('Phase 2 Coming!')">LAUNCH DASH</button>
    `;
}

function toggleLoader(show, message = "") {
    const loader = document.getElementById('loader');
    const box = document.getElementById('manual-entry-box');
    loader.innerText = message;
    loader.style.display = show ? 'block' : 'none';
    box.style.display = show ? 'none' : 'block';
}
