/////////////
// Credits //
/////////////

// Credits / Danksagung:
// Die Grundlage der Code Architektur basiert auf den Arbeiten von nutty.
// Website: https://nutty.gg
// Twitch: https://www.twitch.tv/nutty
// YouTube: https://www.youtube.com/@nuttylmao
// GitHub: https://github.com/nuttylmao

// Credits / Acknowledgement:
// The foundation of the code architecture is based on the work of nutty.
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

const MAX_EMOTES = GetIntParam("maxEmotes", 30);
const EMOTE_SIZE = GetIntParam("emoteSize", 72);


/////////////////
// GLOBAL VARS //
/////////////////

const ANIMATIONS = ['zoom', 'fade', 'bubble', 'bounce'];
let lastAnimationIndex = -1;


///////////////////
// PAGE ELEMENTS //
///////////////////

const container = document.getElementById("emote-container");

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


////////////////////
// EMOTE OVERLAY  //
////////////////////

function TwitchChatMessage(data) {
    // Greift direkt auf data.emotes zu, da data.message im Payload nicht existiert
    if (!data || !data.emotes || data.emotes.length === 0) return;

    const emoteUrls = data.emotes.map(emote => emote.imageUrl);
    const limitedEmotes = emoteUrls.slice(0, MAX_EMOTES);

    const emoteString = limitedEmotes.length === 1 ? 'Emote' : 'Emotes';
    console.log(`Spawne ${limitedEmotes.length} ${emoteString}...`);

    triggerAnimation(limitedEmotes);
}


////////////////
// ANIMATIONS //
////////////////

function triggerAnimation(urls) {
    const w = container.clientWidth;
    const h = container.clientHeight;

    urls.forEach((url, i) => {
        const el = document.createElement('div');
        el.className = 'emote';
        el.style.backgroundImage = `url('${url}')`;
        el.style.width = `${EMOTE_SIZE}px`;
        el.style.height = `${EMOTE_SIZE}px`;
        
        container.appendChild(el);

        const delay = i * 150; 
        const duration = 4000; 

        let typeIndex;
        do {
            typeIndex = Math.floor(Math.random() * ANIMATIONS.length);
        } while (ANIMATIONS.length > 1 && typeIndex === lastAnimationIndex);
        
        lastAnimationIndex = typeIndex;
        const type = ANIMATIONS[typeIndex];

        switch (type) {
            case 'zoom': animateZoom(el, w, h, duration, delay); break;
            case 'fade': animateFade(el, w, h, duration, delay); break;
            case 'bubble': animateBubble(el, w, h, duration, delay); break;
            case 'bounce': animateBounce(el, w, h, delay); break;
        }
    });
}

function animateZoom(el, w, h, duration, delay) {
    const x = Math.random() * (w - EMOTE_SIZE);
    const y = Math.random() * (h - EMOTE_SIZE);
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    const anim = el.animate([
        { transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0)', opacity: 0 }
    ], { duration, delay, fill: 'both', easing: 'ease-in-out' });
    anim.onfinish = () => el.remove();
}

function animateFade(el, w, h, duration, delay) {
    const x = Math.random() * (w - EMOTE_SIZE);
    const y = Math.random() * (h - EMOTE_SIZE);
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    const anim = el.animate([
        { opacity: 0 }, { opacity: 1 }, { opacity: 1 }, { opacity: 0 }
    ], { duration, delay, fill: 'both', easing: 'linear' });
    anim.onfinish = () => el.remove();
}

function animateBubble(el, w, h, duration, delay) {
    const startX = Math.random() * (w - EMOTE_SIZE);
    const sway = 25 + Math.random() * 25; 
    const frequency = 1.0 + Math.random() * 1.5; 

    el.style.left = `0px`; el.style.top = `0px`;

    const keyframes = [];
    const steps = 100; 
    
    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const currentY = h - ((h + 100) * progress); 
        const currentX = startX + Math.sin(progress * Math.PI * 2 * frequency) * sway; 
        
        let opacity = 1;
        if (progress < 0.1) opacity = progress * 10;
        else if (progress > 0.8) opacity = (1 - progress) * 5;

        keyframes.push({ transform: `translate(${currentX}px, ${currentY}px)`, opacity: Math.max(0, opacity) });
    }

    const anim = el.animate(keyframes, { 
        duration: duration * 2.5, 
        delay: delay, 
        fill: 'both', 
        easing: 'linear' 
    });
    anim.onfinish = () => el.remove();
}

function animateBounce(el, w, h, delay) {
    el.style.left = `0px`; el.style.top = `0px`;

    let x = Math.random() * (w - EMOTE_SIZE);
    let y = -EMOTE_SIZE - 50; 
    
    const gravity = 0.4; 
    const restitution = 0.65; 
    const floorY = h - EMOTE_SIZE;
    
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
    const targetX = (dir === 1) ? w + 20 : -EMOTE_SIZE - 20;
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

    const anim = el.animate(keyframes, { 
        duration: exitFrame * 16.66, 
        delay: delay, 
        fill: 'both', 
        easing: 'linear' 
    });
    
    anim.onfinish = () => el.remove();
}