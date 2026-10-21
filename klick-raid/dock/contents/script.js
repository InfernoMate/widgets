// ============================================================================
// WIDGET CONFIGURATION & STATE
// ============================================================================

let client = window.parent.sbClient;
const ACTION_ID = '8f993af9-181c-4b72-b60c-baf89f398604'; 

let activeTab = 'followed_same';
let streamerData = { followed_same: [], followed_diff: [], unfollowed: [], incoming_raids: [], outgoing_history: [] };
let raidHistory = []; 

let countdownInterval = null;
let myViewers = 0;
let loadingMore = false;
let previewIdx = -1;

let pendingStreamer = null;
let currentlyPreviewedStreamer = null; 
let activeRaidTarget = null; 

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const listWrap = document.getElementById('list-wrap');
const countdownDialog = document.getElementById('countdown-dialog');
const historyDialog = document.getElementById('raid-history-dialog');
const confirmDialog = document.getElementById('confirm-dialog');
const previewBar = document.getElementById('preview-bar');
const timerLabel = document.getElementById('timer-label');
const timerBar = document.getElementById('timer-bar');
const searchInput = document.getElementById('search-input');
const sidebar = document.getElementById("sidebar");

// ============================================================================
// INITIALIZATION & WEBSOCKET HANDLING
// ============================================================================

window.addEventListener('message', (event) => {
    if (event.data.type === "sbClientConnected") {
        client = window.parent.sbClient;
        
        client.on('General.Custom', (payload) => {
            try {
                const raw = payload?.data?.message ?? payload?.data;
                const d = typeof raw === 'string' ? JSON.parse(raw) : raw;
                
                if (d?.event_type === 'klickRaidUpdate') {
                    HandleUpdate(d);
                } 
                else if (d?.event_type === 'klickRaidSearchResult') {
                    HandleSearchResult(d);
                } 
                else if (d?.event_type === 'klickRaidConfirmed') {
                    if (d.success === false) {
                        HandleRaidError(d.error_message, d.target_name);
                    }
                }
            } catch (e) {
                console.error("Payload Parsing Error: ", e);
            }
        });
        
        // Initial load with silent refresh
        if (client && client.socket && client.socket.readyState === 1) {
            client.doAction({ id: ACTION_ID }, { method: 'refresh', silent_refresh: true });
        }
        
        FetchRaidHistory(); 
    }
});

function RefreshData() {
    if (client && client.socket && client.socket.readyState === 1) {
        client.doAction({ id: ACTION_ID }, { method: 'refresh' });
    }
}

// ============================================================================
// DATA HANDLING
// ============================================================================

function HandleUpdate(msg) {
    const isLoadMore = msg.load_more === true;
    
    if (isLoadMore) {
        const existing = new Set(streamerData.unfollowed.map(s => s.user_id));
        const fresh = (msg.unfollowed || []).filter(s => !existing.has(s.user_id));
        streamerData.unfollowed = [...streamerData.unfollowed, ...fresh];
    } else {
        streamerData.followed_same = msg.followed_same || [];
        streamerData.followed_diff = msg.followed_diff || [];
        streamerData.unfollowed = msg.unfollowed || [];
        streamerData.incoming_raids = msg.incoming_raids || []; 
        streamerData.outgoing_history = msg.outgoing_history || [];
        myViewers = msg.my_viewers || 0;
        
        UpdateParentLiveStatus(msg);
        UpdateTabCounts();

        pendingStreamer = null;
        confirmDialog.style.display = 'none';
    }
    
    loadingMore = false;
    RenderList();
}

function HandleSearchResult(result) {
    searchInput.value = '';
    
    if (result.found) {
        ShowConfirmDialog(result);
    } else {
        pendingStreamer = null;
        document.getElementById('confirm-name').innerHTML = `<span style="color:var(--danger-color)">Nutzer nicht gefunden</span>`;
        confirmDialog.style.display = 'flex';
    }
}

// ============================================================================
// UI UPDATES & RENDERING
// ============================================================================

function UpdateParentLiveStatus(msg) {
    const dot = document.getElementById('parent-live-dot');
    const label = document.getElementById('parent-live-label');
    const gameBadge = document.getElementById('parent-game-badge');

    if (dot && label && gameBadge) {
        const isLive = msg.is_live === true;
        dot.style.backgroundColor = isLive ? '#7ad19e' : 'var(--danger-color)';
        label.textContent = isLive ? "Live" : "Offline";
        gameBadge.textContent = msg.my_game_name || '—';
    }
}

function UpdateTabCounts() {
    // Hilfsfunktion: Zählt nur die Elemente, die Live sind
    const countLive = (key) => streamerData[key].filter(s => s.is_live !== false).length;

    const tabs = {
        'cnt-followed_same': 'followed_same',
        'cnt-followed_diff': 'followed_diff',
        'cnt-unfollowed': 'unfollowed',
        'cnt-incoming_raids': 'incoming_raids' // Hier zählt er jetzt nur noch die Live-Leute
    };

    Object.keys(tabs).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Bei den Standard-Tabs nehmen wir die Länge, bei Incoming die Live-Zahl
            el.textContent = (id === 'cnt-incoming_raids') ? countLive('incoming_raids') : streamerData[tabs[id]].length;
        }
    });
}

function RenderList() {
    listWrap.replaceChildren();
    const list = streamerData[activeTab] || [];
    
    // Leerer Zustand mit weißem Text
    if (list.length === 0) {
        const empty = document.createElement('div');
        empty.className = "setting-description";
        empty.style.cssText = "text-align: center; margin-top: 2em; color: #ffffff; opacity: 0.8; font-size: 1em;";
        empty.textContent = "Keine Streamer gefunden.";
        listWrap.appendChild(empty);
        return;
    }
    
    const template = document.getElementById('streamer-card-template');
    
    list.forEach((streamer, index) => {
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.streamer-card');
        
        // --- NAME, SCHLOSS (links) & FLAGGE (rechts) ---
        const nameContainer = clone.querySelector('.name');
        nameContainer.innerHTML = ''; // Vorher leeren
        
        // 1. Schloss hinzufügen
        if (streamer.follower_mode) {
            const lock = document.createElement('span');
            lock.innerHTML = '🔒';
            lock.style.marginRight = '4px';
            lock.title = 'Nur Follower';
            lock.style.fontSize = '0.9em';
            nameContainer.appendChild(lock);
        }
        
        // 2. Name hinzufügen
        const nameSpan = document.createElement('span');
        nameSpan.textContent = streamer.user_name;
        nameContainer.appendChild(nameSpan);
        
        // 3. Flagge hinzufügen (via Bild-URL statt Emoji)
        if (activeTab === 'unfollowed' && streamer.language && streamer.language !== 'de') {
            const langCode = streamer.language.toLowerCase();
            // Wir laden die Flagge von einem zuverlässigen CDN
            const flagUrl = `https://flagcdn.com/24x18/${langCode === 'en' ? 'us' : langCode}.png`;
            
            const badge = document.createElement('img');
            badge.src = flagUrl;
            badge.style.cssText = "margin-left: 8px; width: 15px; height: 10px; vertical-align: middle; border-radius: 2px;";
            badge.alt = streamer.language;
            nameContainer.appendChild(badge);
        }

        // 4. Revanchieren-Icon hinzufügen
        if (streamer.needs_revenge) {
            const revengeBadge = document.createElement('span');
            revengeBadge.innerHTML = '🤝';
            revengeBadge.title = 'Zeit sich zu revanchieren!';
            revengeBadge.style.cssText = "margin-left: 6px; font-size: 0.9em;";
            // Emoji Rendering für Windows erzwingen
            revengeBadge.className = 'lang-badge'; 
            nameContainer.appendChild(revengeBadge);
        }
        
        // --- TITEL & SPIEL ---
        // Punkt: Kein "Zuletzt online..." Titel bei Offline im Raid-Tab
        const titleEl = clone.querySelector('.title-text');
        if (activeTab === 'incoming_raids' && streamer.is_live === false) {
            titleEl.textContent = ''; 
        } else {
            titleEl.textContent = streamer.title || '';
        }
        
        clone.querySelector('.game').textContent = streamer.game_name || '—';
        
        // --- ZUSCHAUER & HISTORIE ---
        const metaContainer = clone.querySelector('.right-meta');
        
        if (activeTab === 'incoming_raids') {
            const d = new Date(streamer.timestamp * 1000);
            const dateStr = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
            const zWort = streamer.past_raid_viewers === 1 ? 'Zuschauer' : 'Zuschauern';
            
            // Raid Info
            const raidInfo = document.createElement('div');
            raidInfo.style.cssText = "font-size: 0.7em; color: #aaa; margin-top: 4px;";
            raidInfo.textContent = `Geraidet am ${dateStr} mit ${streamer.past_raid_viewers} ${zWort}`;
            clone.querySelector('.info').appendChild(raidInfo);

            if (streamer.is_live === false) {
                clone.querySelector('.viewers').style.display = 'none';
                clone.querySelector('.actions').style.display = 'none';
                card.style.opacity = '0.5';
            } else {
                const formattedViewers = streamer.viewer_count >= 1000 ? (streamer.viewer_count / 1000).toFixed(1) + 'K' : streamer.viewer_count;
                clone.querySelector('.viewers').innerHTML = `<span style="color: var(--accent-color); font-weight: 700;">${formattedViewers}</span> <span style="font-size: 0.8em; margin-left: 0.5em;">Zuschauer</span>`;
                clone.querySelector('.raid-btn').onclick = (e) => { e.stopPropagation(); ShowConfirmDialog(streamer); };
                clone.querySelector('.preview-btn').onclick = (e) => { PreviewStreamer(index, e); };
            }
        } else {
            const formattedViewers = streamer.viewer_count >= 1000 ? (streamer.viewer_count / 1000).toFixed(1) + 'K' : streamer.viewer_count;
            clone.querySelector('.viewers').innerHTML = `<span style="color: var(--accent-color); font-weight: 700;">${formattedViewers}</span> <span style="font-size: 0.8em; margin-left: 0.5em;">Zuschauer</span>`;
            clone.querySelector('.raid-btn').onclick = (e) => { e.stopPropagation(); ShowConfirmDialog(streamer); };
            clone.querySelector('.preview-btn').onclick = (e) => { PreviewStreamer(index, e); };
        }

        if (streamer.profile_image_url) clone.querySelector('.avatar').src = EscapeHTML(streamer.profile_image_url);
        listWrap.appendChild(clone);
    });
}

function AppendLoadMoreButton() {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.className = 'action-btn';
    loadMoreBtn.style.cssText = "margin-top: 1em; padding: 0.8em; background-color: var(--button-color);";
    loadMoreBtn.textContent = loadingMore ? 'Lade weitere...' : 'Mehr laden';
    loadMoreBtn.disabled = loadingMore;
    loadMoreBtn.onclick = () => LoadMoreDiscover();
    
    listWrap.appendChild(loadMoreBtn);
}

// ============================================================================
// PREVIEW LOGIC
// ============================================================================

function PreviewStreamer(idx, e) {
    if (e) e.stopPropagation();
    
    previewIdx = idx;
    const s = streamerData[activeTab][idx];
    currentlyPreviewedStreamer = s;
    
    const payload = { 
        method: 'preview', 
        preview_login: s.user_login, 
        preview_name: s.user_name, 
        preview_title: s.title || '', 
        preview_game: s.game_name, 
        preview_viewers: s.viewer_count, 
        preview_avatar: s.profile_image_url || '' 
    };
    
    client.doAction({ id: ACTION_ID }, payload);
    
    document.getElementById('preview-avatar').src = s.profile_image_url || '';
    document.getElementById('preview-name').textContent = s.user_name;
    document.getElementById('preview-next-btn').disabled = (idx + 1 >= streamerData[activeTab].length);
    
    previewBar.style.display = 'flex';
}

function StopPreview() { 
    previewIdx = -1; 
    currentlyPreviewedStreamer = null;
    previewBar.style.display = 'none'; 
    client.doAction({ id: ACTION_ID }, { method: 'stop_preview' }); 

    const countdownBtn = document.getElementById('countdown-preview-btn');
    if (countdownBtn) {
        countdownBtn.textContent = "Vorschau starten";
        countdownBtn.style.cssText = "background-color: var(--button-color); border: none;";
    }
}

function NextPreview() { 
    if (previewIdx !== -1 && previewIdx + 1 < streamerData[activeTab].length) {
        PreviewStreamer(previewIdx + 1); 
    }
}

function RaidFromPreview() {
    if (currentlyPreviewedStreamer) {
        ShowConfirmDialog(currentlyPreviewedStreamer);
    }
}

function PreviewFromConfirm() { 
    if (!pendingStreamer) return;
    
    const list = streamerData[activeTab] || [];
    const idx = list.findIndex(s => s.user_id === pendingStreamer.user_id);
    
    if (idx !== -1) {
        PreviewStreamer(idx);
    } else {
        currentlyPreviewedStreamer = pendingStreamer;
        previewIdx = -1;
        
        const payload = { 
            method: 'preview', 
            preview_login: pendingStreamer.user_login, 
            preview_name: pendingStreamer.user_name, 
            preview_title: pendingStreamer.title || '', 
            preview_game: pendingStreamer.game_name, 
            preview_viewers: pendingStreamer.viewer_count, 
            preview_avatar: pendingStreamer.profile_image_url || '' 
        };
        
        client.doAction({ id: ACTION_ID }, payload);
        
        document.getElementById('preview-avatar').src = pendingStreamer.profile_image_url || '';
        document.getElementById('preview-name').textContent = pendingStreamer.user_name;
        document.getElementById('preview-next-btn').disabled = true;
        previewBar.style.display = 'flex';
    }
}

function ToggleCountdownPreview() {
    if (!activeRaidTarget) return;

    const countdownBtn = document.getElementById('countdown-preview-btn');

    // Prüfen, ob die Vorschau für diesen Streamer bereits läuft
    if (currentlyPreviewedStreamer && currentlyPreviewedStreamer.user_id === activeRaidTarget.user_id) {
        // Vorschau stoppen
        StopPreview();
    } else {
        // Vorschau starten. Wir leihen uns die Logik von PreviewFromConfirm
        const tempPending = pendingStreamer;
        pendingStreamer = activeRaidTarget; 
        PreviewFromConfirm();
        pendingStreamer = tempPending; // State wieder sauber zurücksetzen

        // Button auf "Beenden"-Optik ändern
        countdownBtn.textContent = "Vorschau beenden";
        countdownBtn.style.cssText = "background-color: transparent; color: var(--danger-color); border: 1px solid var(--danger-color);";
    }
}

// ============================================================================
// RAID DIALOGS & EXECUTION
// ============================================================================

function ShowConfirmDialog(streamer) {
    pendingStreamer = streamer;
    
    document.getElementById('confirm-avatar').src = streamer.profile_image_url || '';
    document.getElementById('confirm-name').textContent = streamer.user_name;
    document.getElementById('confirm-game').textContent = streamer.game_name || '—';
    
    const viewersEl = document.getElementById('confirm-viewers');
    if (streamer.is_live !== false) {
        viewersEl.innerHTML = `<span style="color:var(--accent-color); font-weight:700; text-shadow: 0 0 6px var(--accent-color);">${streamer.viewer_count || 0}</span> <span style="color:var(--text-dim); font-size:0.8em;">Zuschauer</span>`;
    } else {
        viewersEl.textContent = `Offline`;
    }
    
    const badgesContainer = document.getElementById('confirm-badges');
    badgesContainer.innerHTML = streamer.follower_mode ? `<span class="badge-item badge-follower" title="Nur Follower">🔒 Follower Modus</span>` : '';
    
    confirmDialog.style.display = 'flex';
}

function CloseConfirmDialog() { 
    confirmDialog.style.display = 'none'; 
}

function ConfirmRaid() {
    if (!pendingStreamer) return;
    
    activeRaidTarget = pendingStreamer;
    
    const payload = { 
        method: 'do_raid', 
        raid_target_id: pendingStreamer.user_id, 
        raid_target_name: pendingStreamer.user_name, 
        raid_target_game: pendingStreamer.game_name, 
        raid_target_viewers: pendingStreamer.viewer_count 
    };
    
    client.doAction({ id: ACTION_ID }, payload);
    
    // Grammatikalische Anpassung für Singular/Plural im Dativ
    const zuschauerWort = myViewers === 1 ? "Zuschauer" : "Zuschauern";

    document.getElementById('countdown-name').textContent = pendingStreamer.user_name;
    document.getElementById('countdown-avatar').src = pendingStreamer.profile_image_url || "";
    document.getElementById('countdown-viewers').innerHTML = `Raide mit <span style="color:var(--accent-color); text-shadow: 0 0 6px var(--accent-color);">${myViewers}</span> ${zuschauerWort}`;

    const countdownBtn = document.getElementById('countdown-preview-btn');
    if (currentlyPreviewedStreamer && currentlyPreviewedStreamer.user_id === pendingStreamer.user_id) {
        countdownBtn.textContent = "Vorschau beenden";
        countdownBtn.style.cssText = "background-color: transparent; color: var(--danger-color); border: 1px solid var(--danger-color);";
    } else {
        countdownBtn.textContent = "Vorschau starten";
        countdownBtn.style.cssText = "background-color: var(--button-color); border: none;";
    }

    CloseConfirmDialog();
    countdownDialog.style.display = 'flex';
    RunCountdown(90);

    pendingStreamer = null;
}

function CancelRaid() { 
    client.doAction({ id: ACTION_ID }, { method: 'cancel_raid' }); 
    
    if (countdownInterval) clearInterval(countdownInterval); 
    countdownDialog.style.display = 'none'; 
    activeRaidTarget = null; 
}

function HandleRaidError(errorMessage, targetName) {
    if (countdownInterval) clearInterval(countdownInterval);
    countdownDialog.style.display = 'none';
    activeRaidTarget = null;
    
    const errorBox = document.createElement('div');
    errorBox.className = "callout";
    errorBox.style.cssText = "background-color: rgba(201, 63, 63, 0.2); border: 1px solid var(--danger-color); text-align: center; margin-bottom: 1em;";
    errorBox.innerHTML = `
        <div class="setting-label" style="color: var(--danger-color);">Raid Fehlgeschlagen!</div>
        <div class="setting-description">${errorMessage}</div>
    `;
    
    listWrap.prepend(errorBox);
    setTimeout(() => { 
        if (errorBox.parentNode) errorBox.parentNode.removeChild(errorBox); 
    }, 5000);
}

function RunCountdown(totalSeconds) {
    if (countdownInterval) clearInterval(countdownInterval);
    
    timerBar.style.transition = 'none'; 
    timerBar.style.width = '100%'; 
    timerBar.offsetWidth; // Trigger reflow
    timerBar.style.transition = `width ${totalSeconds}s linear`; 
    timerBar.style.width = '0%';
    
    let currentSeconds = totalSeconds;
    
    const updateLabel = (s) => { 
        const min = Math.floor(s / 60); 
        const sec = s % 60; 
        timerLabel.textContent = `${min}:${sec.toString().padStart(2, '0')}`; 
    };
    
    updateLabel(currentSeconds);
    
    countdownInterval = setInterval(() => { 
        currentSeconds--; 
        updateLabel(currentSeconds); 
        
        if (currentSeconds <= 0) { 
            clearInterval(countdownInterval); 
            countdownDialog.style.display = 'none'; 
            
            if (activeRaidTarget) {
                SaveToHistory(activeRaidTarget);
                activeRaidTarget = null;
            }
        } 
    }, 1000);
}

// ============================================================================
// RAID HISTORY
// ============================================================================

async function FetchRaidHistory() { 
    try { 
        const response = await client.getGlobal("InfernoMate_History_KLICK RAID"); 
        if (response.variable?.value) {
            raidHistory = JSON.parse(response.variable.value.trim()); 
        }
    } catch (e) {
        console.warn("Konnte Raid-Historie nicht laden.", e);
    } 
}

async function SaveToHistory(streamer) { 
    if (!streamer) return;
    
    const entry = { 
        timestamp: Math.floor(Date.now() / 1000), 
        user_name: streamer.user_name, 
        game_name: streamer.game_name, 
        profile_image_url: streamer.profile_image_url, 
        my_viewers: myViewers 
    };
    
    raidHistory.unshift(entry); 
    if (raidHistory.length > 50) raidHistory.pop(); 
    
    await client.doAction({ id: ACTION_ID }, { method: 'update_history', history: JSON.stringify(raidHistory) }); 
    RenderHistoryList();
}

function ShowHistoryDialog(isVisible) { 
    if (isVisible) { 
        RenderHistoryList(); 
        historyDialog.style.display = 'flex'; 
        // sidebar.classList.add("collapsed"); 
    } else {
        historyDialog.style.display = 'none'; 
    }
}

// ============================================================================
// POPUP: RAID HISTORIE (MIT LIVE-CHECK)
// ============================================================================

function RenderHistoryList() {
    const list = document.getElementById("history-list");
    list.replaceChildren();

    const historyData = streamerData.outgoing_history || [];

    if (historyData.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.style.cssText = "text-align:center; width:100%; color: var(--font-color);";
        emptyState.textContent = "Keine Raids gespeichert.";
        list.appendChild(emptyState);
        return;
    }

    historyData.forEach((streamer) => {
        const d = new Date(streamer.timestamp * 1000);
        const dateStr = `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
        const zWort = streamer.past_raid_viewers === 1 ? "Zuschauer" : "Zuschauern";
        const item = document.createElement("div");

        item.className = "callout";
        item.style.cssText = "flex-direction: row; align-items: center; padding: 1em; gap: 1em;";

        const avatarHtml = streamer.profile_image_url 
            ? `<img src="${EscapeHTML(streamer.profile_image_url)}" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-color);">` 
            : `<div style="width: 56px; height: 56px; border-radius: 50%; background: var(--button-color);"></div>`;

        let actionHtml = "";
        if (streamer.is_live !== false) {
            actionHtml = `<button class="action-btn raid-btn" style="background-color: var(--accent-color);" onclick="RaidFromHistory('${streamer.user_id}')">Raid</button>`;
        }

        item.innerHTML = `
            ${avatarHtml}
            <div style="flex:1; min-width:0;">
                <div class="setting-label" style="font-size:1.3em; font-weight:800; color:var(--accent-color); overflow:hidden; text-overflow:ellipsis;">
                    ${EscapeHTML(streamer.user_name)}
                </div>
                <div class="setting-description" style="font-size:1em; color: #aaa;">
                    ${EscapeHTML(streamer.game_name || '—')}
                </div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap: 0.2em;">
                <div style="font-size: 0.85em; color: #fff;">${dateStr}</div>
                <div style="font-size: 0.85em; color: #aaa;">${streamer.past_raid_viewers} ${zWort}</div>
                ${actionHtml}
            </div>
        `;
        list.appendChild(item);
    });
}

window.RaidFromHistory = function(userId) {
    // Sucht den Streamer aus den Backend-Daten anhand der ID
    const streamer = streamerData.outgoing_history.find(s => s.user_id === userId);

    if (streamer) {
        ShowHistoryDialog(false); // Popup schließen
        ShowConfirmDialog(streamer); // Normalen Raid-Bestätigungs-Dialog öffnen
    }
};

// ============================================================================
// SEARCH & SIDEBAR CONTROLS
// ============================================================================

function LoadMoreDiscover() {
    loadingMore = true;
    RenderList(); 
    client.doAction({ id: ACTION_ID }, { method: 'load_more' });
}

function ToggleSidebar() { 
    sidebar.classList.toggle("collapsed"); 
}

function SwitchCategory(btn) { 
    document.querySelectorAll('.sidebar-item[data-tab]').forEach(t => t.classList.remove('active')); 
    btn.classList.add('active'); 
    activeTab = btn.dataset.tab; 
    RenderList(); 
}

function TriggerSearch() { 
    const query = document.getElementById('search-input').value.trim(); 
    if (query !== "") {
        client.doAction({ id: ACTION_ID }, { method: 'search_user', search_login: query, source: 'klickraid' }); 
    }
}

// Event Listeners
document.getElementById('search-input').addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') TriggerSearch(); 
});
document.getElementById('search-btn').onclick = TriggerSearch;
document.getElementById('refresh-btn').onclick = RefreshData;