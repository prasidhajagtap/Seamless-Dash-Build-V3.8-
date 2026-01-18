/** * PHASE 1: FINAL IDENTITY GATE (Admin Compatible)
 */
const CONFIG = {
    MODE: 'TEST', 
    AES_KEY: "SD_PRASIDHA_JAGTAP_V38_MASTER_KEY", // <--- MUST MATCH ADMIN PANEL KEY
    FIREBASE: {
        apiKey: "AIzaSyBJcK4zEK2Rb-Er8O7iDNYsGW2HUJANPBc",
        authDomain: "seamless-dash.firebaseapp.com",
        projectId: "seamless-dash"
    }
};

if (!firebase.apps.length) { firebase.initializeApp(CONFIG.FIREBASE); }
const db = firebase.firestore();

// 1. AES Encryption Logic (Required for Admin Panel to show ID instead of X)
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

async function handleManualEntry() {
    const nInput = document.getElementById('manual-name');
    const iInput = document.getElementById('manual-id');
    const errName = document.getElementById('err-name');
    const errId = document.getElementById('err-id');

    // Reset UI
    errName.style.display = errId.style.display = "none";
    nInput.style.borderColor = "#eee";
    iInput.style.borderColor = "#eee";

    let isValid = true;

    // Name Validation
    if (!/^[A-Za-z\s]{3,}$/.test(nInput.value)) {
        errName.innerText = "Please enter letters only (min 3 characters)";
        errName.style.display = "block";
        nInput.style.borderColor = "#a01018";
        isValid = false;
    }

    // ID Validation
    if (!/^\d{4,10}$/.test(iInput.value)) {
        errId.innerText = "Please enter numbers only (4-10 digits)";
        errId.style.display = "block";
        iInput.style.borderColor = "#a01018";
        isValid = false;
    }

    if (!isValid) return;

    showSection('loader');

    try {
        // ENCRYPT THE ID (To fix the "X" mark in Admin Panel)
        const secureData = await encryptID(iInput.value.trim());
        
        const playerRef = db.collection("players").doc(iInput.value.trim());
        const doc = await playerRef.get();

        let highScore = 0;
        const payload = {
            name: nInput.value.trim(),
            pid_enc: secureData.pid_enc, // The Admin Panel reads this
            pid_iv: secureData.pid_iv,   // The Admin Panel reads this
            lastSeen: Date.now()
        };

        if (doc.exists) {
            highScore = doc.data().highScore || 0;
            await playerRef.update(payload);
        } else {
            payload.highScore = 0;
            await playerRef.set(payload);
        }

        displaySuccess(payload.name, iInput.value.trim(), highScore);

    } catch (err) {
        alert("Sync Error: " + err.message);
        showSection('manual-entry-box');
    }
}

function displaySuccess(name, id, score) {
    showSection('success-box');
    document.getElementById('success-box').innerHTML = `
        <div class="user-pill">
            <h2 style="color:#28a745; margin:0;">✔ Identity Verified</h2>
            <p>Welcome back, <b>${name}</b></p>
            <p>Your Current High Score: <b>${score}</b></p>
        </div>
        <button class="main-btn" onclick="alert('Proceeding...')">LAUNCH DASH</button>
        <button class="main-btn" style="background:#666; margin-top:10px;" onclick="resetToHome()">BACK TO HOME</button>
    `;
}

function resetToHome() {
    document.getElementById('manual-name').value = "";
    document.getElementById('manual-id').value = "";
    showSection('manual-entry-box');
}

function showSection(id) {
    ['manual-entry-box', 'loader', 'success-box'].forEach(sec => {
        document.getElementById(sec).style.display = (sec === id) ? 'block' : 'none';
    });
}
