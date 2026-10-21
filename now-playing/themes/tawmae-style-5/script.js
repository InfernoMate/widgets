///////////////////
// PAGE ELEMENTS //
///////////////////

const mainWrapper = document.getElementById('main-wrapper');
const coverImg = document.getElementById('cover-img');

const titleWrapper = document.getElementById('title-wrapper');
const titleEl = document.getElementById('song-title');

const artistWrapper = document.getElementById('artist-wrapper');
const artistEl = document.getElementById('song-artist');

const albumWrapper = document.getElementById('album-wrapper');
const albumEl = document.getElementById('song-album');

const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const progressKnob = document.getElementById('progress-knob');
const curEl = document.getElementById('current-time');
const totEl = document.getElementById('total-time');
const explicitBadge = document.getElementById('explicit-badge');

////////////////
// PAGE SETUP //
////////////////

// Sichtbarkeitseinstellungen basierend auf den URL-Parametern (vom globalen script.js vererbt)
titleWrapper.style.display = showPrimary ? '' : 'none';
artistWrapper.style.display = showSecondary ? '' : 'none';
if (!showProgressBar) progressContainer.style.display = 'none';

function formatTime(ms) {
    const t = Math.floor(ms / 1000),
          m = Math.floor(t / 60),
          s = t % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
}

// Verdunkelt einen Hex-Farbwert signifikant (für den sleeken V5 Look)
function darkenHex(hex, amount = 0.75) {
    if (!hex || !hex.startsWith('#') || hex.length !== 7) return '#111111';
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    
    r = Math.floor(r * (1 - amount));
    g = Math.floor(g * (1 - amount));
    b = Math.floor(b * (1 - amount));
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Präzise und DYNAMISCHE Scroll-Logik
function applyMarquee(el, wrapperEl) {
    el.classList.remove("scrolling");
    void el.offsetWidth; // Reflow erzwingen
    
    if (el.scrollWidth > wrapperEl.clientWidth) {
        // Wir ziehen exakt die Differenz ab plus die 25 Pixel für den Fade-Out
        const dist = wrapperEl.clientWidth - el.scrollWidth - 25;
        el.style.setProperty('--scroll-dist', dist + 'px');

        // -- SMART SPEED BERECHNUNG --
        // dist ist negativ, wir brauchen den absoluten Wert für die Berechnung
        const scrollDistance = Math.abs(dist); 
        // Basiszeit ist 12 Sekunden. Für jede 20 Pixel, die gescrollt werden müssen, 
        // geben wir der Animation 1 Sekunde mehr Zeit.
        const duration = Math.max(12, 8 + (scrollDistance / 20));
        el.style.setProperty('--scroll-duration', duration + 's');

        el.classList.add("scrolling");
    }
}

//////////////////////////
// SMOOTH ANIMATION     //
//////////////////////////

let syncPositionMs = 0;
let syncDurationMs = 0;
let syncTimestamp = 0;
let isTrackPlaying = false;

function smoothAnimate() {
    if (syncDurationMs > 0) {
        // Drift nur berechnen, wenn der Track läuft
        const drift = isTrackPlaying ? (Date.now() - syncTimestamp) : 0;
        const smoothPos = Math.min(syncPositionMs + drift, syncDurationMs);

        // UI progress updaten
        curEl.innerText = formatTime(smoothPos);
        let progressPercent = (smoothPos / syncDurationMs) * 100;
        progressPercent = Math.min(100, Math.max(0, progressPercent)); 
        
        progressFill.style.width = `${progressPercent}%`;
        progressKnob.style.left = `${progressPercent}%`;
    }
    requestAnimationFrame(smoothAnimate);
}

// Animations-Schleife sofort beim Laden einmal anstoßen
smoothAnimate();


////////////////////
// CORE FUNCTIONS //
////////////////////

// Diese Funktion wird von der globalen SMTC Bridge aufgerufen
async function ChangeTrack(mediaProps, accentColorPalette) {
    const newTitle = swapArtistTrack ? mediaProps.Artist : mediaProps.Title;
    const newArtist = swapArtistTrack ? mediaProps.Title : mediaProps.Artist;
    const newAlbum = mediaProps.AlbumTitle || "";
    
    const newArtUrl = mediaProps.Thumbnail ?? './images/placeholder.png';
    coverImg.style.backgroundImage = `url('${newArtUrl}')`;

    titleEl.textContent = newTitle || "Unknown Title";
    albumEl.textContent = newAlbum;

    // PRÜFUNG: Wenn kein Artist gefunden wurde (z.B. bei lokalen Dateien)
    if (!newArtist || newArtist.trim() === "") {
        artistEl.textContent = "local music (nicht auf Spotify)";
    } else {
        artistEl.textContent = newArtist;
    }
    
    // Sichtbarkeit des Artists anwenden, je nachdem ob showSecondary an ist
    artistWrapper.style.visibility = showSecondary ? 'visible' : 'hidden';

    // Farbe extrahieren und extrem verdunkeln
    const baseColor = accentColorPalette.DarkMuted || accentColorPalette.DarkVibrant || '#111111';
    const panelColor = darkenHex(baseColor, 0.75);
    document.documentElement.style.setProperty("--panel-color", panelColor);

    const isExplicit = (mediaProps.Genres && mediaProps.Genres.includes("Explicit")) || 
                       (mediaProps.Subtitle && mediaProps.Subtitle.toLowerCase().includes("explicit"));
    explicitBadge.style.display = isExplicit ? "inline-flex" : "none";

    // Marquee erst nach DOM Update anwenden
    requestAnimationFrame(() => {
        applyMarquee(titleEl, titleWrapper);
        applyMarquee(artistEl, artistWrapper);
        applyMarquee(albumEl, albumWrapper);
    });

    SetVisibility(true); 
}

// Diese Funktion wird von der globalen SMTC Bridge aufgerufen
function SetProgressInfo(timelineProps, currentPositionMs, accentColorPalette) {
    // Variablen für den smoothAnimate() Loop synchronisieren
    syncPositionMs = currentPositionMs;
    syncDurationMs = timelineProps.EndTime;
    syncTimestamp = Date.now();
    
    totEl.innerText = formatTime(syncDurationMs);

    // Wiedergabestatus prüfen (globales Enum von SMTC)
    isTrackPlaying = (typeof CurrentPlaybackStatus !== 'undefined' && CurrentPlaybackStatus === PlaybackStatus.PLAYING);

    // Der Fortschrittsbalken bekommt die lebendige Farbe des Covers (falls vorhanden)
    progressFill.style.backgroundColor = accentColorPalette.LightVibrant || '#ffffff';
}