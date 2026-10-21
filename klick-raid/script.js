const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// ========================================================
const ACTION_ID = '8f993af9-181c-4b72-b60c-baf89f398604'; 
// ========================================================

const sbServerAddress = urlParams.get("address") || "127.0.0.1";
const sbServerPort = urlParams.get("port") || "8080";

// Einheitliche Variablen für Font & Background:
const font = urlParams.get("font") || urlParams.get("fontFamily") || "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
const fontSize = urlParams.get("fontSize") || "30";
const background = urlParams.get("background") || urlParams.get("cardBackground") || "#08080e";
const opacity = urlParams.get("opacity") || urlParams.get("cardOpacity") || "0.95";

const fontColor = urlParams.get("fontColor") || "#FFFFFF";
const accentColor = urlParams.get("accentColor") || "#d84613";
const viewersColor = urlParams.get("viewersColor") || accentColor;
const alignment = urlParams.get("alignment") || "align-to-top";

// CSS Variablen setzen
document.documentElement.style.setProperty('--font-family', font);
document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
document.documentElement.style.setProperty('--font-color', fontColor);
document.documentElement.style.setProperty('--accent-color', accentColor);
document.documentElement.style.setProperty('--viewers-color', viewersColor);

function hexToRgbA(hex, alpha) {
    let c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c = hex.substring(1).split('');
        if(c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        c = '0x' + c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+alpha+')';
    }
    return `rgba(18, 18, 22, ${alpha})`;
}
document.documentElement.style.setProperty('--bg-color', hexToRgbA(background, opacity));

const CLOUDFLARE_PROXY_URL = "https://twitch-hls-proxy.infernomate.workers.dev";
let hls = null;
let isPreviewOpen = false;
let testTimeout = null;

const overlay = document.getElementById("overlay");
const streamVideo = document.getElementById("streamVideo");
const alertBox = document.getElementById('alertBox');
const previewContent = document.getElementById('previewContent');

function setAlignment(isOpen) {
    if (alignment === 'center') {
        alertBox.style.top = '50%';
        alertBox.style.bottom = 'auto';
        alertBox.style.transform = isOpen ? 'translate(-50%, -50%)' : 'translate(-50%, calc(-50% - 200px))';
    } else if (alignment === 'align-to-bottom') {
        alertBox.style.top = 'auto';
        alertBox.style.bottom = '40px';
        alertBox.style.transform = isOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(220px)';
    } else {
        alertBox.style.top = '40px';
        alertBox.style.bottom = 'auto';
        alertBox.style.transform = isOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-220px)';
    }
}
setAlignment(false);

const client = new StreamerbotClient({
    host: sbServerAddress, port: sbServerPort,
    onConnect: () => document.getElementById("statusContainer").style.display = "none"
});

window.testWidget = function() {
    console.log("Test Button getriggert, starte 24/7 Testkanal über Streamer.bot...");
    client.doAction({ id: ACTION_ID }, { method: 'test_widget' });
};

client.on('General.Custom', (payload) => {
    try {
        const raw = payload?.data?.message ?? payload?.data;
        const d = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (d?.event_type === 'klickRaidPreview') ShowPreview(d);
        else if (d?.event_type === 'klickRaidStop') HidePreview();
    } catch (e) { }
});

async function fadeStreamAudio(direction, duration) {
    return new Promise((resolve) => {
        const steps = 20;
        const intervalTime = duration / steps;
        const volumeStep = 1 / steps;
        let currentStep = 0;
        const interval = setInterval(() => {
            currentStep++;
            if (direction === 'out') streamVideo.volume = Math.max(0, 1 - (volumeStep * currentStep));
            else streamVideo.volume = Math.min(1, volumeStep * currentStep);
            if (currentStep >= steps) { clearInterval(interval); resolve(); }
        }, intervalTime);
    });
}

async function ShowPreview(data) {
    if (testTimeout) clearTimeout(testTimeout);
    
    const login = data.login || data.preview_login;
    
    const isSettingsPage = urlParams.has("widgetURL") || window.parent !== window;
    if (data.isTest && !isSettingsPage) {
        console.log("Test-Event ignoriert: Läuft nur in der Settings-Seite.");
        return;
    }

    if (!login) return;

    const avatarUrl = data.avatar || `https://decapi.me/twitch/avatar/${login}`;

    const updateStream = (shouldFadeIn = false) => {
        streamVideo.style.display = 'block';
        const hlsUrl = `${CLOUDFLARE_PROXY_URL}/${login}`;
        
        if (Hls.isSupported()) {
            if (hls) hls.destroy();
            hls = new Hls({ lowLatencyMode: true });
            hls.loadSource(hlsUrl);
            hls.attachMedia(streamVideo);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                streamVideo.volume = shouldFadeIn ? 0 : 1;
                streamVideo.play().catch(() => {});
                setTimeout(() => streamVideo.classList.remove('switching'), 100);
                if (shouldFadeIn) fadeStreamAudio('in', 400);
            });
        }
        
        if (data.isTest) {
            testTimeout = setTimeout(() => { HidePreview(); }, 15000);
        }
    };

    const updateContent = () => {
        document.getElementById("avatar").src = avatarUrl;
        document.getElementById("username").innerHTML = data.name || login;
        document.getElementById("streamTitle").innerHTML = data.title || "";
        document.getElementById("game").innerHTML = data.game || "Unbekannt";
        document.getElementById("viewers").innerHTML = (parseInt(data.viewers) || 0) >= 1000 ? (data.viewers / 1000).toFixed(1) + 'K' : data.viewers;
    };

    if (isPreviewOpen) {
        previewContent.style.transition = 'opacity 0.25s ease';
        previewContent.style.opacity = '0';
        
        if (!data.isTest) {
            streamVideo.classList.add('switching'); 
            fadeStreamAudio('out', 200);
        }

        setTimeout(() => {
            updateStream(true);
            updateContent(); 
            previewContent.style.position = 'absolute';
            let tw = previewContent.scrollWidth + 10;
            let th = previewContent.scrollHeight + 10;
            previewContent.style.position = 'relative';
            
            alertBox.style.transition = 'width 0.4s cubic-bezier(0.65, 0, 0.35, 1), height 0.4s cubic-bezier(0.65, 0, 0.35, 1)';
            alertBox.style.width = `${tw}px`; alertBox.style.height = `${th}px`;
            
            setTimeout(() => { previewContent.style.opacity = '1'; }, 300);
        }, 250); 
    } else {
        updateContent(); 
        overlay.classList.add('visible');
        updateStream(false);
        
        alertBox.style.transition = 'none';
        alertBox.style.opacity = '1';
        alertBox.style.width = '80px'; alertBox.style.height = '30px';
        alertBox.style.borderRadius = '50px';
        setAlignment(false);
        
        previewContent.style.display = 'none'; previewContent.style.opacity = '0';
        void alertBox.offsetWidth;
        
        alertBox.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        setAlignment(true);

        setTimeout(() => {
            previewContent.style.display = 'flex';
            let tw = previewContent.scrollWidth + 10;
            let th = previewContent.scrollHeight + 10;
            
            alertBox.style.transition = 'width 0.5s cubic-bezier(0.65, 0, 0.35, 1), height 0.5s cubic-bezier(0.65, 0, 0.35, 1), border-radius 0.4s ease';
            alertBox.style.width = `${tw}px`; alertBox.style.height = `${th}px`;
            alertBox.style.borderRadius = '20px';
            
            setTimeout(() => {
                previewContent.style.transition = 'opacity 0.3s ease';
                previewContent.style.opacity = '1';
                isPreviewOpen = true;
            }, 400);
        }, 600);
    }
}

function HidePreview() {
    if (!isPreviewOpen) return;
    if (testTimeout) clearTimeout(testTimeout);
    
    fadeStreamAudio('out', 1500);
    
    previewContent.style.transition = 'opacity 0.25s ease';
    previewContent.style.opacity = '0';
    
    setTimeout(() => {
        alertBox.style.transition = 'width 0.6s cubic-bezier(0.65, 0, 0.35, 1), height 0.6s cubic-bezier(0.65, 0, 0.35, 1), border-radius 0.5s ease';
        alertBox.style.width = '80px'; alertBox.style.height = '30px';
        alertBox.style.borderRadius = '50px';
        
        setTimeout(() => {
            alertBox.style.transition = 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-in';
            setAlignment(false);
            alertBox.style.opacity = '0';
            overlay.classList.remove('visible');
            
            setTimeout(() => {
                if (hls) { hls.destroy(); hls = null; }
                streamVideo.pause(); 
                isPreviewOpen = false;
            }, 1000);
        }, 600);
    }, 250);
}