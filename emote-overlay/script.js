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


////////////////
// PARAMETERS //
////////////////

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const sbServerAddress = urlParams.get("address") || "127.0.0.1";
const sbServerPort = urlParams.get("port") || "8080";


///////////////
// CONSTANTS //
///////////////

const ANIMATIONS = ['zoom', 'fade', 'bubble', 'bounce'];
const ANIMATION_DURATION = 6000;    // Zoom, Fade, Bubble (Bubble blendet so etwa ab der Bildmitte aus)
const BOUNCE_DURATION = 4000;       // Bounce: Emote hat das Bild nach drei Sprüngen verlassen


///////////////////
// PAGE ELEMENTS //
///////////////////

const container = document.getElementById("emote-container");


/////////////
// OPTIONS //
/////////////

// Appearance
const emoteSize = GetIntParam("emoteSize", 72);

// General
const maxEmotes = GetIntParam("maxEmotes", 30);

// Which animations do you want to see?
const showZoomAnimation = GetBooleanParam("showZoomAnimation", true);
const showFadeAnimation = GetBooleanParam("showFadeAnimation", true);
const showBubbleAnimation = GetBooleanParam("showBubbleAnimation", true);
const showBounceAnimation = GetBooleanParam("showBounceAnimation", true);


/////////////////
// GLOBAL VARS //
/////////////////

let lastAnimationIndex = -1;

// Nur die in den Einstellungen aktivierten Animationen
const enabledAnimations = ANIMATIONS.filter(type =>
    (type === 'zoom' && showZoomAnimation) ||
    (type === 'fade' && showFadeAnimation) ||
    (type === 'bubble' && showBubbleAnimation) ||
    (type === 'bounce' && showBounceAnimation)
);


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

client.on('Twitch.ChatMessage', (response) => {
    console.debug(response.data);
    TwitchChatMessage(response.data);
})


///////////////////
// EMOTE OVERLAY //
///////////////////

function TwitchChatMessage(data) {
    // Greift direkt auf data.emotes zu, da data.message im Payload nicht existiert
    if (!data || !data.emotes || data.emotes.length === 0) return;

    const emoteUrls = data.emotes.map(emote => emote.imageUrl);
    const limitedEmotes = emoteUrls.slice(0, maxEmotes);

    const emoteString = limitedEmotes.length === 1 ? 'Emote' : 'Emotes';
    console.log(`Spawne ${limitedEmotes.length} ${emoteString}...`);

    TriggerAnimation(limitedEmotes);
}

function TriggerAnimation(urls) {
    if (enabledAnimations.length === 0) {
        console.log('Keine Animation aktiviert, Emotes werden nicht angezeigt.');
        return;
    }

    const w = container.clientWidth;
    const h = container.clientHeight;

    urls.forEach((url, i) => {
        const el = document.createElement('div');
        el.className = 'emote';
        el.style.backgroundImage = `url('${url}')`;
        el.style.width = `${emoteSize}px`;
        el.style.height = `${emoteSize}px`;

        container.appendChild(el);

        const delay = i * 150;
        const duration = ANIMATION_DURATION;

        let typeIndex;
        do {
            typeIndex = Math.floor(Math.random() * enabledAnimations.length);
        } while (enabledAnimations.length > 1 && typeIndex === lastAnimationIndex);

        lastAnimationIndex = typeIndex;
        const type = enabledAnimations[typeIndex];

        switch (type) {
            case 'zoom': AnimateZoom(el, w, h, duration, delay); break;
            case 'fade': AnimateFade(el, w, h, duration, delay); break;
            case 'bubble': AnimateBubble(el, w, h, duration, delay); break;
            case 'bounce': AnimateBounce(el, w, h, BOUNCE_DURATION, delay); break;
        }
    });
}

function AnimateZoom(el, w, h, duration, delay) {
    const x = Math.random() * (w - emoteSize);
    const y = Math.random() * (h - emoteSize);
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    // Ein-/Ausblenden wie bei Bubble (rein bis 10 %, raus ab 80 %), damit das Emote ähnlich lange voll sichtbar ist
    const anim = el.animate([
        // Easing je Phase (nicht auf die ganze Animation), sonst verschieben sich die Zeitpunkte
        { transform: 'scale(0)', opacity: 0, offset: 0, easing: 'ease-in-out' }, { transform: 'scale(1)', opacity: 1, offset: 0.1 },
        { transform: 'scale(1)', opacity: 1, offset: 0.8, easing: 'ease-in-out' }, { transform: 'scale(0)', opacity: 0, offset: 1 }
    ], { duration, delay, fill: 'both', easing: 'linear' });
    anim.onfinish = () => el.remove();
}

function AnimateFade(el, w, h, duration, delay) {
    const x = Math.random() * (w - emoteSize);
    const y = Math.random() * (h - emoteSize);
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    const anim = el.animate([
        { opacity: 0, offset: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 1, offset: 0.8 }, { opacity: 0, offset: 1 }
    ], { duration, delay, fill: 'both', easing: 'linear' });
    anim.onfinish = () => el.remove();
}

function AnimateBubble(el, w, h, duration, delay) {
    const startX = Math.random() * (w - emoteSize);
    const sway = 25 + Math.random() * 25;
    const frequency = 1.0 + Math.random() * 1.5;

    el.style.left = `0px`; el.style.top = `0px`;

    // Feste Steiggeschwindigkeit (ganze Strecke in 10 s); bei kürzerer Dauer endet
    // die Animation früher und blendet entsprechend weiter unten aus
    const travel = Math.min(1, duration / 10000);

    const keyframes = [];
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const currentY = h - ((h + 100) * progress * travel);
        const currentX = startX + Math.sin(progress * travel * Math.PI * 2 * frequency) * sway;

        let opacity = 1;
        if (progress < 0.1) opacity = progress * 10;
        else if (progress > 0.8) opacity = (1 - progress) * 5;

        keyframes.push({ transform: `translate(${currentX}px, ${currentY}px)`, opacity: Math.max(0, opacity) });
    }

    const anim = el.animate(keyframes, {
        duration: duration,
        delay: delay,
        fill: 'both',
        easing: 'linear'
    });
    anim.onfinish = () => el.remove();
}

function AnimateBounce(el, w, h, duration, delay) {
    el.style.left = `0px`; el.style.top = `0px`;

    let x = Math.random() * (w - emoteSize);
    let y = -emoteSize - 50;

    const gravity = 0.4;
    const restitution = 0.65;
    const floorY = h - emoteSize;

    let simY = y;
    let simVy = 0;
    let frames = 0;
    let bounceFrames = [];

    while(bounceFrames.length < 3 && frames < 800) {
        simVy += gravity;
        simY += simVy;
        if (simY >= floorY) {
            simY = floorY;
            simVy *= -restitution;
            bounceFrames.push(frames);
        }
        frames++;
    }

    if (bounceFrames.length < 3) {
        el.remove();
        return;
    }

    const dir = (x > w / 2) ? -1 : 1;
    const targetX = (dir === 1) ? w + 20 : -emoteSize - 20;
    const exitFrame = bounceFrames[2] - 1;
    const vx = (targetX - x) / exitFrame;

    const keyframes = [];
    let currentX = x;
    let currentY = y;
    let vy = 0;

    for (let i = 0; i <= exitFrame; i++) {
        vy += gravity;
        currentX += vx;
        currentY += vy;

        if (currentY >= floorY) {
            currentY = floorY;
            vy *= -restitution;
        }

        keyframes.push({
            transform: `translate(${currentX}px, ${currentY}px)`,
            opacity: i === 0 ? 0 : 1
        });
    }

    // Feste Dauer statt exitFrame * 16.66, damit Bounce unabhängig von der
    // Overlay-Höhe genauso lange sichtbar ist wie die anderen Animationen
    const anim = el.animate(keyframes, {
        duration: duration,
        delay: delay,
        fill: 'both',
        easing: 'linear'
    });

    anim.onfinish = () => el.remove();
}


////////////////////
// TEST FUNCTIONS //
////////////////////

function testWidget() {
    // Pool: LUL (Twitch), KEKW, PogChamp, HypeE (7TV); daraus 5 zufällige Emotes
    const emotePool = [
        'https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/3.0',
        'https://cdn.7tv.app/emote/01F61B1440000991F7SWQNMVX7/4x.webp',
        'https://cdn.7tv.app/emote/01FD0HZD2G0009QXBMY7YYTYK3/4x.webp',
        'https://cdn.7tv.app/emote/01F6N37YV00004P7N4A9PN168P/4x.webp'
    ];

    const data = {
        emotes: Array.from({ length: 5 }, () => ({ imageUrl: emotePool[Math.floor(Math.random() * emotePool.length)] }))
    };

    TwitchChatMessage(data);
}
