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

// Construct URL
const currentURL = window.location.href;
let baseURL = currentURL;

if (baseURL.endsWith("index.html"))
    baseURL = baseURL.replace("index.html", "");

const configJson = "?config=" + baseURL + "config.json";

// Implement widget dock core
window.dockWrapper = document.getElementById('dock-wrapper');
dockWrapper.src = `/.common/core/widget-dock-core${configJson}`;

dockWrapper.addEventListener('load', () => {
    dockWrapper.contentWindow.content.src = baseURL + '/contents';
});

// Change Logo and URL
const iframe = document.getElementById('dock-wrapper');

iframe.addEventListener('load', () => {
    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // 1. Link (URL) und Logo ändern
        const logoLink = iframeDoc.getElementById('logo-link');
        if (logoLink) {
            // Ändert die Funktion, die beim Klicken aufgerufen wird
            logoLink.setAttribute('onclick', "OpenURLFromHeader('https://nutty.gg')");
            
            // Falls du das Logo-Bild selbst auch ändern willst:
            const img = logoLink.querySelector('img');
            if (img) img.src = '/.common/resources/nutty.png';
        }

    } catch (e) {
        console.error("Zugriff auf Iframe-Inhalt verweigert. Prüfe die Domain!", e);
    }
});