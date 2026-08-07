const widgetContainer = document.getElementById('widgetContainer');

const settingsPageURL = '/.common/core/settings-core';

const currentURL = window.location.href;

let settingsJSON;
let baseURL = currentURL;

if (baseURL.endsWith("index.html"))
    baseURL = baseURL.replace("index.html", "");

settingsJSON = "?settingsJson=" + baseURL + "settings.json";

const lastSlashIndex = baseURL.lastIndexOf("/");
let widgetURL = "&widgetURL=" + baseURL.replace("/settings", "");

console.debug("Window Ref: " + window.location.href);
console.debug("Base URL: " + baseURL);
console.debug("Settings JSON: " + settingsJSON);
console.debug("Widget URL: " + widgetURL);

widgetContainer.src = settingsPageURL + settingsJSON + widgetURL;

// Change Header Banner and Logo
widgetContainer.addEventListener('load', () => {
    try {
        // Zugriff auf das Dokument im Iframe
        const iframeDoc = widgetContainer.contentDocument || widgetContainer.contentWindow.document;

        // Den Button und Logo im Iframe finden
        const membershipBtn = iframeDoc.getElementById('membershipsButton');
        const logoImg = iframeDoc.querySelector('#header img');

        if (membershipBtn) {
            // 1. Text ändern
            membershipBtn.textContent = 'Schau dir meine exklusiven Widgets an';

            // 2. Aktion ändern (z.B. neue URL öffnen)
            membershipBtn.onclick = function() {
                window.open('https://nutty.gg/en-eur/collections/member-exclusive-widgets', '_blank');
            };

            // 3. Farbe ändern
            membershipBtn.style.background = '#2196f3';
        }

        if (logoImg) {
            // Hier setzt du den absoluten Pfad zum Logo
            logoImg.src = '/.common/resources/nutty.png';
            
            // Optional: Die Höhe anpassen, falls das neue Logo größer ist
            // logoImg.style.height = '50px'; 
        }

        // 4. CSS-Variablen und h2 global anpassen
        const styleOverride = iframeDoc.createElement('style');
        styleOverride.textContent = `
            * {
                --accent-color: #2196f3 !important;
            }
            h2 {
                color: #2196f3 !important;
            }
        `;
        iframeDoc.head.appendChild(styleOverride);
    } catch (e) {
        console.warn("Zugriff auf Iframe blockiert. Prüfe, ob die Domain gleich ist!", e);
    }
});