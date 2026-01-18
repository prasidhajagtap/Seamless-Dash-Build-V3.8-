/** * PHASE 1: IDENTITY GATE & FIREBASE HANDSHAKE
 */
const CONFIG = {
    MODE: 'TEST', // Change to 'PRODUCTION' for SharePoint Sniffing
    AES_KEY: "SD_PRASIDHA_JAGTAP_V38_MASTER_KEY", // Ensure this matches your Admin Panel
    FIREBASE: {
        apiKey: "AIzaSyBJcK4zEK2Rb-Er8O7iDNYsGW2HUJANPBc",
        authDomain: "seamless-dash.firebaseapp.com",
        projectId: "seamless-dash"
    }
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(CONFIG.FIREBASE);
}
const db = firebase.firestore();

// 1. AES Encryption (Matches Admin Panel Decryption)
async function encryptID(rawId) {
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
}

// 2. Identity Entry Logic
async function handleManualEntry() {
    const nameInput = document.getElementById('manual-name').value.trim();
    const idInput = document.getElementById('manual-id').value.trim();

    // Strict Validation: Letters only for name, 4-10 digits for ID
    if (/^[A-Za-z\s]{3,}$/.test(nameInput) && /^\d{4,10}$/.test(idInput)) {
        toggleLoader(true);
        await proceedToGame(nameInput, idInput);
    } else {
        alert("Check your details: Name must be letters, ID must be 4-10 digits.");
    }
}

async function proceedToGame(name, id) {
    try {
        const secureData = await encryptID(id);
        
        // Define Global User Object
        window.gameUser = {
            name: name,
            id: id,
            secure: secureData,
            sessionStart: Date.now(),
            highScore: 0
        };

        // FETCH DATA FROM FIREBASE (High Score / Verification)
        const userDoc = await db.collection("players").doc(id).get();
        if (userDoc.exists) {
            window.gameUser.highScore = userDoc.data().highScore || 0;
        }

        // LOCK IDENTITY & PREPARE TRANSITION
        console.log("Identity Locked:", window.gameUser.name);
        
        // Final UI Cleanup before Phase 2
        document.getElementById('auth-screen').innerHTML = `
            <h1>Welcome, ${name}</h1>
            <p>High Score: ${window.gameUser.highScore}</p>
            <button class="main-btn" onclick="initPhase2()">LAUNCH DASH</button>
        `;

    } catch (err) {
        console.error("Gate Error:", err);
        alert("Security Handshake Failed. Please refresh.");
    } finally {
        toggleLoader(false);
    }
}

function toggleLoader(show) {
    document.getElementById('loader').style.display = show ? 'block' : 'none';
    document.getElementById('manual-entry-box').style.display = show ? 'none' : 'block';
}

// Mobile Screen Lock Logic
document.addEventListener('touchmove', (e) => {
    if (window.isGameRunning) e.preventDefault();
}, { passive: false });
