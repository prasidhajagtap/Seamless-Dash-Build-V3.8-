/** * PHASE 1: IDENTITY GATE
 * -----------------------
 * Set MODE to 'PRODUCTION' for SharePoint Sniffing.
 * Set MODE to 'TEST' for GitHub Manual Entry.
 */
const CONFIG = {
    MODE: 'TEST', 
    AES_KEY: "SD_PRASIDHA_JAGTAP_V38_MASTER_KEY", 
    FIREBASE: {
        apiKey: "AIzaSyBJcK4zEK2Rb-Er8O7iDNYsGW2HUJANPBc",
        projectId: "seamless-dash"
    }
};

// Initialize Firebase
firebase.initializeApp(CONFIG.FIREBASE);
const db = firebase.firestore();

// 1. AES Encryption Function (Asynchronous)
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

// 2. Identity Sniffer
window.onload = function() {
    if (CONFIG.MODE === 'PRODUCTION') {
        const spName = document.getElementById("ctl00_ctl49_hdnName")?.value;
        const spId = document.getElementById("ctl00_ctl49_hdnPoornataId")?.value;

        if (spName && spId && spName !== "Not Found") {
            autoLogin(spName, spId);
        }
    }
};

function autoLogin(name, id) {
    document.getElementById('manual-entry-box').style.display = 'none';
    document.getElementById('auto-login-box').style.display = 'block';
    document.getElementById('display-name').innerText = name;
    document.getElementById('display-id').innerText = "ID: " + id;
    window.tempUser = { name, id };
}

async function handleManualEntry() {
    const name = document.getElementById('manual-name').value.trim();
    const id = document.getElementById('manual-id').value.trim();

    if (/^[A-Za-z\s]{3,}$/.test(name) && /^\d{4,10}$/.test(id)) {
        document.getElementById('manual-entry-box').classList.add('hidden');
        document.getElementById('loader').classList.remove('hidden');
        await proceedToGame(name, id);
    } else {
        alert("Enter valid Name (Letters) and Poornata ID (4-10 Digits)");
    }
}

async function proceedToGame(name, id) {
    const user = name ? {name, id} : window.tempUser;
    
    // Security Handshake
    const secureData = await encryptID(user.id);
    
    // Global User Object (Anti-Hack)
    window.gameUser = {
        ...user,
        secure: secureData,
        sessionStart: Date.now()
    };

    console.log("Identity Locked. Ready for Phase 2.");
    alert("Identity Verified for " + window.gameUser.name + ". Ready for Phase 2!");
    // In Phase 2, we will call initializeGame() here.
}

// 3. Mobile Scroll Lock
document.addEventListener('touchmove', (e) => {
    if (window.isGameRunning) e.preventDefault();
}, { passive: false });
