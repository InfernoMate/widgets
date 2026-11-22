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
