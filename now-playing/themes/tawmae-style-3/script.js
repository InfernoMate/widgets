///////////////////
// PAGE ELEMENTS //
///////////////////

const mainWrapper = document.getElementById('main-wrapper');
const coverBg = document.getElementById('cover-bg');

const titleWrapper = document.getElementById('title-wrapper');
const titleEl = document.getElementById('song-title');

const artistWrapper = document.getElementById('artist-wrapper');
const artistEl = document.getElementById('song-artist');

const progressContainer = document.getElementById('progress-container');
const curEl = document.getElementById('current-time');
const totEl = document.getElementById('total-time');
const knob = document.getElementById('knob');
const trackLine = document.getElementById('track-line');
const visualizer = document.getElementById('visualizer');

////////////////
// PAGE SETUP //
////////////////

mainWrapper.style.width = '450px';
mainWrapper.style.maxWidth = 'none';
mainWrapper.style.height = '120px';

// CSS Transition deaktivieren, da JS die Animation butterweich mit 60 FPS übernimmt
knob.style.transition = 'none';

titleWrapper.style.display = showPrimary ? '' : 'none';
artistWrapper.style.display = showSecondary ? '' : 'none';
if (!showProgressBar) progressContainer.style.display = 'none';

function formatTime(ms) {
    const t = Math.floor(ms / 1000),
          m = Math.floor(t / 60),
          s = t % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
}

// Neue Smart Speed Scroll-Funktion
function applyMarquee(el, wrapperEl) {
    el.classList.remove("scrolling");
    wrapperEl.classList.remove("is-scrolling");
    void el.offsetWidth; // Reflow erzwingen
    
    if (el.scrollWidth > wrapperEl.clientWidth) {
        wrapperEl.classList.add("is-scrolling");
        
        // 20 Pixel für den Fade-Out abziehen
        const dist = wrapperEl.clientWidth - el.scrollWidth - 20;
        el.style.setProperty('--scroll-dist', dist + 'px');

        // Smart Speed Berechnung (12s Basiszeit + 1s pro 20px)
        const scrollDistance = Math.abs(dist); 
        const scrollDuration = Math.max(12, 8 + (scrollDistance / 20));
        el.style.setProperty('--scroll-duration', scrollDuration + 's');

        el.classList.add("scrolling");
    }
}

//////////////////////////
// VISUALIZER FUNCTIONS //
//////////////////////////

for (let i = 0; i < 50; i++) {
    let bar = document.createElement("div");
    bar.className = "bar";
    visualizer.appendChild(bar);
}

let vizInterval = null;

function updateBars() {
    const bars = document.querySelectorAll(".visualizer .bar");
    const knobLeft = parseFloat(knob.style.left) || 0;
    const total = bars.length;

    bars.forEach((bar, i) => {
        const v = Math.random() * 1.5 + 0.2;
        bar.style.transform = `scaleY(${v})`;
        const pct = (i / (total - 1)) * 100;
        bar.style.background = pct <= knobLeft ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)";
    });
}

function startVisualizer() {
    if (vizInterval) return;
    updateBars();
    vizInterval = setInterval(updateBars, 200);
}

function stopVisualizer() {
    if (vizInterval) {
        clearInterval(vizInterval);
        vizInterval = null;
    }
    document.querySelectorAll(".visualizer .bar").forEach((bar) => {
        bar.style.transform = "scaleY(0)";
    });
}

//////////////////////////
// SMOOTH ANIMATION     //
//////////////////////////

let syncPositionMs = 0;
let syncDurationMs = 0;
let syncTimestamp = 0;
let isTrackPlaying = false;

// 60-FPS-Schleife
function smoothAnimate() {
    if (isTrackPlaying && syncDurationMs > 0) {
        // Drift berechnen
        const drift = Date.now() - syncTimestamp;
        const smoothPos = Math.min(syncPositionMs + drift, syncDurationMs);

        // UI updaten
        curEl.innerText = formatTime(smoothPos);
        let progressPercent = (smoothPos / syncDurationMs) * 100;
        progressPercent = Math.min(100, Math.max(0, progressPercent));
        knob.style.left = `${progressPercent}%`;
    }
    requestAnimationFrame(smoothAnimate);
}

// Animations-Schleife initial starten
smoothAnimate();

////////////////////
// CORE FUNCTIONS //
////////////////////

async function ChangeTrack(mediaProps, accentColorPalette) {
    const newTitle = swapArtistTrack ? mediaProps.Artist : mediaProps.Title;
    const newArtist = swapArtistTrack ? mediaProps.Title : mediaProps.Artist;
    const newArtUrl = mediaProps.Thumbnail ?? './images/placeholder.png';
    
    coverBg.style.backgroundImage = `url('${newArtUrl}')`;
    titleEl.textContent = newTitle || "Unknown Title";
    artistEl.textContent = newArtist || "local music (nicht auf Spotify)";
    
    requestAnimationFrame(() => {
        applyMarquee(titleEl, titleWrapper);
        applyMarquee(artistEl, artistWrapper);
    });
    
    SetVisibility(true);
}

function SetProgressInfo(timelineProps, currentPositionMs, accentColorPalette) {
    // Variablen synchronisieren
    syncPositionMs = currentPositionMs;
    syncDurationMs = timelineProps.EndTime;
    syncTimestamp = Date.now();

    totEl.innerText = formatTime(syncDurationMs);

    isTrackPlaying = (typeof CurrentPlaybackStatus !== 'undefined' && CurrentPlaybackStatus === PlaybackStatus.PLAYING);

    if (isTrackPlaying) {
        startVisualizer();
        trackLine.style.display = "none";
    } else {
        stopVisualizer();
        trackLine.style.display = "block";

        // Fixe Werte setzen, wenn pausiert ist
        curEl.innerText = formatTime(syncPositionMs);
        let progressPercent = syncDurationMs > 0 ? (syncPositionMs / syncDurationMs) * 100 : 0;
        knob.style.left = `${progressPercent}%`;
        trackLine.style.background = `linear-gradient(to right, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) ${progressPercent}%, rgba(255,255,255,0.3) ${progressPercent}%, rgba(255,255,255,0.3) 100%)`;
    }
}