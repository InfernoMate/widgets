const sbServerAddress = "127.0.0.1";
const sbServerPort = "8080";

const statusContainer = document.getElementById("statusContainer");
const printerScene = document.getElementById("printerScene");
const printerImg = document.getElementById("printerImg");
const receiptImg = document.getElementById("receiptImg");
const discordIcon = document.getElementById("discordIcon");

let isAnimating = false;

const client = new StreamerbotClient({
    host: sbServerAddress,
    port: sbServerPort,
    onConnect: (data) => {
        console.log("Streamer.bot connected!");
        SetConnectionStatus(true);
    },
    onDisconnect: () => {
        console.error("Streamer.bot disconnected!");
        SetConnectionStatus(false);
    }
});

client.on('General.Custom', (response) => {
    if (response.data && response.data.action === "StartPrintAnimation") {
        const imageData = response.data.imageData;
        if (imageData && !isAnimating) {
            StartAnimation(imageData);
        }
    }
});

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
        let printSound = new Audio('assets/printer.mp3');
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

function SetConnectionStatus(connected) {
    if (connected) {
        statusContainer.style.background = "#2FB774";
        statusContainer.innerText = "Verbunden!";
        statusContainer.style.opacity = 1;
        setTimeout(() => {
            statusContainer.style.transition = "all 2s ease";
            statusContainer.style.opacity = 0;
        }, 2000);
    } else {
        statusContainer.style.background = "#D12025";
        statusContainer.innerText = "Verbinden...";
        statusContainer.style.transition = "";
        statusContainer.style.opacity = 1;
    }
}