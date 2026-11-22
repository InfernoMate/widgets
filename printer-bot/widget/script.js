/////////////
// Credits //
/////////////

// Credits / Danksagung:
// Die Grundlage dieses Codes basiert auf den Arbeiten von rexbordz.
// Patreon: https://www.patreon.com/rexbordz
// Twitch: https://www.twitch.tv/rexbordz
// YouTube: https://www.youtube.com/@rexbordz
// GitHub: https://github.com/rexbordz

// Credits / Acknowledgement:
// The foundation of this code is based on the work of rexbordz.
// Patreon: https://www.patreon.com/rexbordz
// Twitch: https://www.twitch.tv/rexbordz
// YouTube: https://www.youtube.com/@rexbordz
// GitHub: https://github.com/rexbordz


////////////////
// PARAMETERS //
////////////////

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const sbServerAddress = urlParams.get("address") || "127.0.0.1";
const sbServerPort = urlParams.get("port") || "8080";


///////////////////
// PAGE ELEMENTS //
///////////////////

const printerScene = document.getElementById("printerScene");
const printerImg = document.getElementById("printerImg");
const receiptImg = document.getElementById("receiptImg");
const discordIcon = document.getElementById("discordIcon");


/////////////////
// GLOBAL VARS //
/////////////////

let isAnimating = false;


/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

const connectionStatus = new ConnectionStatus({
    name: "Streamer.bot",
    showDelay: 1000,
    disconnectedMessage: "Verbinde mit Streamer.bot..."
});

connectionStatus.setConnected(false);

const client = new StreamerbotClient({
    host: sbServerAddress,
    port: sbServerPort,

    onConnect: (data) => {
        console.log(`Streamer.bot successfully connected to ${sbServerAddress}:${sbServerPort}`)
        console.debug(data);
        connectionStatus.setConnected(true);
    },

    onDisconnect: () => {
        console.error(`Streamer.bot disconnected from ${sbServerAddress}:${sbServerPort}`)
        connectionStatus.setConnected(false);
    }
});

client.on('General.Custom', (response) => {
    console.debug(response.data);
    GeneralCustom(response.data);
});


/////////////////
// PRINTER BOT //
/////////////////

function GeneralCustom(data) {
    if (data && data.action === "StartPrintAnimation") {
        const imageData = data.imageData;
        if (imageData && !isAnimating) {
            StartAnimation(imageData);
        }
    }
}

function StartAnimation(imageData) {
    isAnimating = true;

    // Bilddaten setzen
    receiptImg.src = imageData;

    // Resets
    printerScene.classList.remove("hidden");
    printerImg.className = "";
    receiptImg.className = "";
    discordIcon.className = "";
    void printerImg.offsetWidth;

    // 1. Drucker slidet von unten rein
    printerImg.classList.add("anim-printer-show");

    // 2. Bon wird gedruckt
    setTimeout(() => {
        // --- SOUND ABSPIELEN ---
        let printSound = new Audio('sfx/printer.mp3');
        printSound.volume = 0.5; // Optional: Lautstärke zwischen 0.0 und 1.0 anpassen
        printSound.play().catch(e => console.log("Fehler beim Abspielen des Sounds:", e));

        // Animation auslösen
        receiptImg.classList.add("anim-receipt-print");
    }, 1000);

    // 3. Discord Logo ploppt auf
    setTimeout(() => {
        discordIcon.classList.add("anim-discord-pop");
    }, 6000);

    // 4. Bon fliegt hoch
    setTimeout(() => {
        receiptImg.classList.replace("anim-receipt-print", "anim-receipt-fly");
    }, 6500);

    // 5. Discord frisst den Bon
    setTimeout(() => {
        discordIcon.classList.add("anim-discord-munch");
    }, 6800);

    // 6. Discord Logo ploppt weg
    setTimeout(() => {
        discordIcon.classList.remove("anim-discord-munch");
        discordIcon.classList.replace("anim-discord-pop", "anim-discord-pop-out");
    }, 7300);

    // 7. Drucker slidet nach unten weg
    setTimeout(() => {
        printerImg.classList.replace("anim-printer-show", "anim-printer-hide");
    }, 7800);

    // 8. Komplett aufräumen
    setTimeout(() => {
        printerScene.classList.add("hidden");
        isAnimating = false;
    }, 8500);
}
