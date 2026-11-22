/////////////
// Credits //
/////////////

// Credits / Danksagung:
// Die Grundlage dieses Codes basiert auf den Arbeiten von nutty.
// Website: https://nutty.gg
// Twitch: https://www.twitch.tv/nutty
// YouTube: https://www.youtube.com/@nuttylmao
// GitHub: https://github.com/nuttylmao

// Credits / Acknowledgement:
// The foundation of this code is based on the work of nutty.
// Website: https://nutty.gg
// Twitch: https://www.twitch.tv/nutty
// YouTube: https://www.youtube.com/@nuttylmao
// GitHub: https://github.com/nuttylmao


///////////////
// CONSTANTS //
///////////////

// Hier kannst du die Sekunden dauerhaft aktivieren (true) oder deaktivieren (false)
const forceShowSeconds = true;
const defaultUsername = '';
const UPTIME_POLL_INTERVAL = 60000;     // decapi.me wird einmal pro Minute abgefragt, dazwischen zählt das Widget selbst


////////////////////
// URL PARAMETERS //
////////////////////

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const sbServerAddress = urlParams.get("address") || "127.0.0.1";
const sbServerPort = urlParams.get("port") || "8080";


///////////////////
// PAGE ELEMENTS //
///////////////////

const mainContainer = document.getElementById('mainContainer');
const uptimeLabel = document.getElementById('uptimeLabel');


/////////////
// OPTIONS //
/////////////

// General
let twitchUsername = urlParams.get("username") || defaultUsername;
const useCustomFormat = GetBooleanParam("useCustomFormat", false);
// Prüft, ob ein URL-Parameter existiert. Wenn nicht, wird die Einstellung aus der Configuration oben genommen.
const showSeconds = urlParams.has("seconds") ? ['', 'true'].includes(urlParams.get("seconds")) : forceShowSeconds;
const uptimeFormat = urlParams.get("format") || "[Live seit] H:mm:ss";
const offlineFormat = urlParams.get("offlineFormat") || "N [ist offline]";
const hideWhenOffline = GetBooleanParam("hideWhenOffline", false);

// Appearance
const font = urlParams.get("font") || "";
const fontSize = GetIntParam("fontSize", 36);
const fontWeight = urlParams.get("fontWeight") || "700";
const fontColor = urlParams.get("fontColor") || "#ffffff";
const fontOpacity = urlParams.get("fontOpacity") || "1";
const textTransform = urlParams.get("textTransform") || "uppercase";
const textAlignment = urlParams.get("textAlignment") || "center";
const showTextShadow = GetBooleanParam("showTextShadow", true);


/////////////////
// GLOBAL VARS //
/////////////////

let streamStartTime = null;     // Zeitpunkt des Streamstarts (ms), null wenn offline oder unbekannt
let statusText = '';            // Text, der angezeigt wird, wenn keine Uptime vorliegt


////////////////
// PAGE SETUP //
////////////////

if (font)
    mainContainer.style.fontFamily = `'${font}'`;
mainContainer.style.fontSize = `${fontSize}px`;
mainContainer.style.fontWeight = fontWeight;
mainContainer.style.color = fontColor;
mainContainer.style.opacity = fontOpacity;
mainContainer.style.textTransform = textTransform;
mainContainer.style.textAlign = textAlignment;
if (!showTextShadow)
    mainContainer.style.textShadow = 'none';


/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

// Streamer.bot wird nur gebraucht, wenn kein Kanalname in der URL steht
if (twitchUsername) {
    StartUptime();
}
else {
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
            GetBroadcaster(client);
        },

        onDisconnect: () => {
            console.error(`Streamer.bot disconnected from ${sbServerAddress}:${sbServerPort}`)
            connectionStatus.setConnected(false);
        }
    });
}


///////////////////
// TWITCH UPTIME //
///////////////////

async function GetBroadcaster(client) {
    // Nur einmal holen, auch wenn sich Streamer.bot neu verbindet
    if (twitchUsername)
        return;

    const broadcasterInfo = await client.getBroadcaster();
    console.debug(broadcasterInfo);

    const twitch = broadcasterInfo?.platforms?.twitch;
    if (!twitch) {
        ShowStatus("Kein Twitch-Konto in Streamer.bot verbunden");
        return;
    }

    twitchUsername = twitch.broadcastUserName || twitch.broadcasterLogin;
    StartUptime();
}

function StartUptime() {
    UpdateUptime();
    setInterval(UpdateUptime, UPTIME_POLL_INTERVAL);
    setInterval(RenderUptime, 1000);
}

async function UpdateUptime() {
    let metric;
    try {
        const response = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(twitchUsername)}`);
        metric = (await response.text()).trim();
    }
    catch (error) {
        // Bei einem Netzwerkfehler den letzten Stand weiterzählen
        console.error("decapi.me nicht erreichbar:", error);
        return;
    }

    console.debug(metric);

    // Abfangen, falls der Stream offline ist
    if (metric.includes("offline")) {
        streamStartTime = null;
        statusText = hideWhenOffline ? '' : FormatText(offlineFormat, 0);
    }
    else {
        const seconds = ParseUptime(metric);
        if (seconds === null) {
            // Fehlermeldung von decapi.me (z. B. unbekannter Kanal) übersetzt anzeigen
            streamStartTime = null;
            statusText = TranslateUptime(metric);
        }
        else {
            streamStartTime = Date.now() - seconds * 1000;
        }
    }

    RenderUptime();
}

function RenderUptime() {
    if (streamStartTime === null) {
        uptimeLabel.textContent = statusText;
        return;
    }

    const seconds = Math.floor((Date.now() - streamStartTime) / 1000);
    uptimeLabel.textContent = useCustomFormat ? FormatText(uptimeFormat, seconds) : WriteOutUptime(seconds);
}

function ShowStatus(text) {
    streamStartTime = null;
    statusText = text;
    RenderUptime();
}


//////////////////////
// HELPER FUNCTIONS //
//////////////////////

// Wandelt "1 day, 2 hours, 3 minutes, 4 seconds" in Sekunden um, null bei allem anderen
function ParseUptime(metric) {
    const units = { day: 86400, hour: 3600, minute: 60, second: 1 };
    const parts = metric.split(',').map(part => part.trim());
    let total = 0;

    for (const part of parts) {
        const match = part.match(/^(\d+) (day|hour|minute|second)s?$/);
        if (!match)
            return null;
        total += Number(match[1]) * units[match[2]];
    }

    return total;
}

// Ausgeschriebene Uptime wie bei decapi.me, auf Deutsch ("2 Stunden, 3 Minuten, 4 Sekunden")
function WriteOutUptime(totalSeconds) {
    const values = [
        [Math.floor(totalSeconds / 86400), "Tag", "Tage"],
        [Math.floor(totalSeconds % 86400 / 3600), "Stunde", "Stunden"],
        [Math.floor(totalSeconds % 3600 / 60), "Minute", "Minuten"],
        [totalSeconds % 60, "Sekunde", "Sekunden"]
    ];

    const parts = values
        .map(([value, singular, plural], index) => ({ index, value, text: `${value} ${value === 1 ? singular : plural}` }))
        .filter(part => part.value > 0);

    if (parts.length === 0)
        return "0 Sekunden";

    // Sekunden abschneiden, falls showSeconds auf false steht (aber nicht, wenn nur Sekunden da sind)
    if (!showSeconds && parts.length > 1 && parts[parts.length - 1].index === 3)
        parts.pop();

    return parts.map(part => part.text).join(', ');
}

// Eigenes Format: [Text] bleibt wie geschrieben, D/H/HH/m/mm/s/ss werden ersetzt, N ist der Kanalname
function FormatText(format, totalSeconds) {
    // Ohne D zählen die Stunden über 24 hinaus weiter
    const hasDays = format.replace(/\[[^\]]*\]/g, '').includes('D');
    const days = Math.floor(totalSeconds / 86400);
    const hours = hasDays ? Math.floor(totalSeconds % 86400 / 3600) : Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds % 3600 / 60);
    const seconds = totalSeconds % 60;
    const pad = value => String(value).padStart(2, '0');

    const tokens = {
        D: days, DD: pad(days),
        H: hours, HH: pad(hours),
        m: minutes, mm: pad(minutes),
        s: seconds, ss: pad(seconds),
        N: twitchUsername
    };

    return format.replace(/\[([^\]]*)\]|DD|D|HH|H|mm|m|ss|s|N/g, (match, literal) => literal !== undefined ? literal : tokens[match]);
}

// Englische Meldungen von decapi.me ins Deutsche übersetzen
function TranslateUptime(metric) {
    return metric
        .replace(/\bdays\b/g, "Tage")
        .replace(/\bday\b/g, "Tag")
        .replace(/\bhours\b/g, "Stunden")
        .replace(/\bhour\b/g, "Stunde")
        .replace(/\bminutes\b/g, "Minuten")
        .replace(/\bminute\b/g, "Minute")
        .replace(/\bseconds\b/g, "Sekunden")
        .replace(/\bsecond\b/g, "Sekunde")
        .replace(/\bA channel name has to be specified\b/g, "Kein Name als URL Parameter gesetzt");
}
