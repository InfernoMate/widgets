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