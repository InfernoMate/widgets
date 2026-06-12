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


//////////////////////
// GLOBAL VARIABLES //
//////////////////////

const sbActionPrintRoutine = '8dd4e8ea-cd82-46a9-8256-ef36907dd231';


/////////////////////////
// STREAMER.BOT EVENTS //
/////////////////////////

window.parent.sbClient.on('General.Custom', (response) => {
    console.debug(response.data);
    CustomEvent(response.data);
})


/////////////////
// PRINTER BOT //
/////////////////

async function CustomEvent(data) {
    if (data.actionName != '[PB] Printer Bot | Events')
        return;

    // Get settings values
    const printGiftBombsIndividually = document.getElementById('print-gift-bombs-individually').checked;

    // Get a reference to the template
    const template = document.getElementById('receipt-template');

    // Create a new instance of the template
    const instance = template.content.cloneNode(true);

    // Get divs
    const headerEl = instance.querySelector('#receipt-header');
    const contentEl = instance.querySelector('#receipt-content');
    const footerEl = instance.querySelector('#receipt-footer');
    const avatarEl = instance.querySelector('#receipt-avatar');
    const titleEl = instance.querySelector('#receipt-title');
    const subtitleEl = instance.querySelector('#receipt-subtitle');
    const iconEl = instance.querySelector('#receipt-icon');
    const dateEl = instance.querySelector('#receipt-date');

    // Set the main contents
    switch (data.__source) {
        // Twitch events
        case ('TwitchFollow'):
            {
                avatarEl.src = await GetAvatar(data.userName, 'twitch');
                subtitleEl.innerText = `${data.user}`;

                const messageEl = document.createElement('div');
                messageEl.innerHTML = '<b>Neuer Follower!</b>';

                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'twitch');
            }
            break;
        case ('TwitchCheer'):
            {
                avatarEl.src = await GetAvatar(data.userName, 'twitch');
                titleEl.innerText = `${data.bits} BITS`;
                subtitleEl.innerText = `${data.user}`;

                const messageEl = document.createElement('div');
                messageEl.innerHTML = data.message;

                // Render emotes
                for (i in data.emotes) {
                    const emoteElement = `<img src="${data.emotes[i].imageUrl}" class="emote"/>`;
                    const emoteName = EscapeRegExp(data.emotes[i].name);
                    function EscapeRegExp(string) {
                        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
                    }

                    let regexPattern = emoteName;

                    // Check if the emote name consists only of word characters (alphanumeric and underscore)
                    if (/^\w+$/.test(emoteName)) {
                        regexPattern = `\\b${emoteName}\\b`;
                    }
                    else {
                        // For non-word emotes, ensure they are surrounded by non-word characters or boundaries
                        regexPattern = `(?<=^|[^\\w])${emoteName}(?=$|[^\\w])`;
                    }

                    const regex = new RegExp(regexPattern, 'g');
                    messageEl.innerHTML = messageEl.innerHTML.replace(regex, emoteElement);
                }

                // Render cheermotes
                for (i in data.cheerEmotes) {
                    const bits = data.cheerEmotes[i].bits;
                    const imageUrl = data.cheerEmotes[i].imageUrl;
                    const name = data.cheerEmotes[i].name;
                    const cheerEmoteElement = `<img src="${imageUrl}" class="emote"/>`;
                    const bitsElements = `<span class="bits">${bits}</span>`
                    messageEl.innerHTML = messageEl.innerHTML.replace(new RegExp(`\\b${name}${bits}\\b`, 'i'), cheerEmoteElement + bitsElements);
                }

                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'twitch');
            }
            break;
        case ('TwitchSub'):
            {
                avatarEl.src = await GetAvatar(data.userName, 'twitch');
                titleEl.innerText = `${data.tier} Subscriber`;
                subtitleEl.innerText = `${data.user}`;

                const messageEl = document.createElement('div');
                messageEl.innerHTML = '<b>Neuer Subscriber!</b>';

                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'twitch');
            }
            break;
        case ('TwitchReSub'):
            {
                avatarEl.src = await GetAvatar(data.userName, 'twitch');
                titleEl.innerText = `${data.tier} Subscriber`;
                subtitleEl.innerText = `${data.user}`;

                const messageEl = document.createElement('div');
                messageEl.innerHTML = `<b>${data.cumulative} Monate${data.monthStreak > 1 ? ' (' + data.monthStreak + ' in Folge!)' : ''}</b>`;
                if (data.messageStripped)
                    messageEl.innerHTML += `<br><br><i>${data.messageStripped}</i>`;

                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'twitch');
            }
            break;
        case ('TwitchGiftSub'):
            {
                // Check if this sub comes from a Gift Bomb
                if (data.fromGiftBomb) {
                    // If the user does NOT want individual prints, skip this event.
                    if (!printGiftBombsIndividually) {
                        return;
                    }
                    // If they DO want individual prints, hide the avatar to avoid rate limits
                    avatarEl.style.display = 'none';
                }
                // If it's a normal gift sub (not from a bomb)
                else {
                    if (data.anonymous)
                        avatarEl.src = await GetAvatar(data.recipientUser, 'twitch');
                    else
                        avatarEl.src = await GetAvatar(data.userName, 'twitch');
                }

                titleEl.innerText = `Verschenktes Sub`;

                const messageEl = document.createElement('div');
                if (data.anonymous)
                    messageEl.innerHTML += `<b>✦･ﾟ A mysterious admirer ･ﾟ✦</b><br>`;
                else
                    messageEl.innerHTML += `<b>${data.user}</b><br>`;
                    messageEl.innerHTML += `verschenkt ein ${data.tier}-Sub an<br><b>${data.recipientUser}</b>`;

                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'twitch');
            }
            break;
        case ('TwitchGiftBomb'):
            {
                // If the user wants individual prints, skip this summary event.
                if (printGiftBombsIndividually) {
                    return;
                }

                avatarEl.src = await GetAvatar(data.userName, 'twitch');
                titleEl.innerHTML = `${data.gifts} × Gifted Subs`;
                subtitleEl.innerHTML += `✧*･ﾟ✧ ${data.tier.toUpperCase()} ✧･ﾟ*✧`;
                if (data.anonymous)
                    subtitleEl.innerHTML += `<br>von einer anonymen Person...`;
                else
                    subtitleEl.innerHTML += `<br>${data.user}`;

                const messageEl = document.createElement('div');
                if (data.totalGifts > 1) {
                    messageEl.innerHTML = `verschenkte insgesamt <b>${data.totalGifts} Subs</b>!</br></br>`;
                }

                // Get a list of all recipient users
                Object.keys(data)
                    .filter(key => /^gift\.recipientUser\d+$/.test(key))
                    .forEach((key, index) => {
                        const username = data[key];
                        messageEl.innerHTML += `${username}</br>`;
                    });

                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'twitch');
            }
            break;
        case ('TwitchRaid'):
            {
                avatarEl.src = await GetAvatar(data.userName, 'twitch');

                const messageEl = document.createElement('div');
                messageEl.innerHTML = `<b>${data.user}</b><br>raidet mit einer Gruppe von<br><b>${data.viewers} Zuschauern!</b>`;

                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'twitch');
            }
            break;
        case ('TwitchCustomPowerUpRedemption'):
            {
                avatarEl.src = await GetAvatar(data.userName, 'twitch');
                titleEl.innerText = `${data["customPowerUp.bitsCost"]} BITS`;
                subtitleEl.innerText = `${data.user}`;

                const messageEl = document.createElement('div');
                messageEl.innerHTML = data.rawInput;

                // // Render emotes
                // for (i in data.emotes) {
                //     const emoteElement = `<img src="${data.emotes[i].imageUrl}" class="emote"/>`;
                //     const emoteName = EscapeRegExp(data.emotes[i].name);
                //     function EscapeRegExp(string) {
                //         return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
                //     }

                //     let regexPattern = emoteName;

                //     // Check if the emote name consists only of word characters (alphanumeric and underscore)
                //     if (/^\w+$/.test(emoteName)) {
                //         regexPattern = `\\b${emoteName}\\b`;
                //     }
                //     else {
                //         // For non-word emotes, ensure they are surrounded by non-word characters or boundaries
                //         regexPattern = `(?<=^|[^\\w])${emoteName}(?=$|[^\\w])`;
                //     }

                //     const regex = new RegExp(regexPattern, 'g');
                //     messageEl.innerHTML = messageEl.innerHTML.replace(regex, emoteElement);
                // }

                // // Render cheermotes
                // for (i in data.cheerEmotes) {
                //     const bits = data.cheerEmotes[i].bits;
                //     const imageUrl = data.cheerEmotes[i].imageUrl;
                //     const name = data.cheerEmotes[i].name;
                //     const cheerEmoteElement = `<img src="${imageUrl}" class="emote"/>`;
                //     const bitsElements = `<span class="bits">${bits}</span>`
                //     messageEl.innerHTML = messageEl.innerHTML.replace(new RegExp(`\\b${name}${bits}\\b`, 'i'), cheerEmoteElement + bitsElements);
                // }

                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'twitch');
            }
            break;

        // YouTube Events
        case ('YouTubeNewSubscriber'):
            {
                // Avatar prüfen (exakt wie bei YouTubeNewSponsor)
                if (data.userProfileUrl)
                    avatarEl.src = data.userProfileUrl;
                else
                    avatarEl.style.display = 'none';

                // Texte setzen (exakt wie bei YouTubeNewSponsor)
                titleEl.innerText = `⭐ Neuer Abonnent!`;
                subtitleEl.innerText = `${data.user}`;

                // Content-Bereich ausblenden
                contentEl.style.display = 'none';

                // Set the platform icon
                SetPlatformIcon(iconEl, 'youtube');
            }
            break;
        case ('YouTubeGiftMembershipReceived'):
            {
                if (data.gifterProfileUrl)
                    avatarEl.src = data.gifterProfileUrl;
                else
                    avatarEl.style.display = 'none';
                titleEl.innerText = `Verschenkte Mitgliedschaft`;

                const messageEl = document.createElement('div');
                messageEl.innerHTML = `<b>${data.gifterUser}</b><br>verschenkt eine Mitgliedschaft an<br><b>${data.user}</b>!`;


                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'youtube');
            }
            break;
        case ('YouTubeSuperChat'):
            {
                if (data.userProfileUrl)
                    avatarEl.src = data.userProfileUrl;
                else
                    avatarEl.style.display = 'none';
                titleEl.style.fontSize = '2em';
                titleEl.innerText = `${data.amount}`;

                const messageEl = document.createElement('div');
                messageEl.innerHTML = `<b>${data.user}</b><br>hat einen Super Chat gesendet!`;
                if (data.message)
                    messageEl.innerHTML += `<br><br><i>${data.message}</i>`;

                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'youtube');
            }
            break;
        case ('YouTubeSuperSticker'):
            {
                if (data.stickerImageUrl)
                    avatarEl.src = data.stickerImageUrl;
                else
                    avatarEl.style.display = 'none';
                titleEl.style.fontSize = '2em';
                titleEl.innerText = `${data.amount}`;

                const messageEl = document.createElement('div');
                messageEl.innerHTML = `<b>${data.user}</b><br>hat einen Super Sticker gesendet!`;

                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'youtube');
            }
            break;
            break;

        // Kick Events
        case ('KickSubscription'):
        case ('KickResubscription'):
            {
                avatarEl.src = ConvertWEBPToPNG(await GetAvatar(data.user, 'kick'));
                titleEl.innerText = `Subscriber`;
                subtitleEl.innerText = `${data.user}`;

                const messageEl = document.createElement('div');
                if (data.duration > 1)
                    messageEl.innerHTML = `<b>${data.duration} Monate</b>`;
                else
                    messageEl.innerHTML = '<b>Neuer Subscriber!</b>';

                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'kick');
            }
            break;
        case ('KickGiftSubscription'):
            {
                avatarEl.src = ConvertWEBPToPNG(await GetAvatar(data["recipient.userLogin"], 'kick'));
                titleEl.innerText = `Verschenktes Sub`;

                const messageEl = document.createElement('div');
                messageEl.innerHTML = `<b>${data.user}</b><br>verschenkt ein Sub an<br><b>${data["recipient.userName"]}</b>!`;


                contentEl.appendChild(messageEl);

                // Set the platform icon
                SetPlatformIcon(iconEl, 'kick');
            }
            break;
        case ('KickMassGiftSubscription'):
            {
                // There is only one sub, so use the same template for a single gifted sub
                if ('recipient.userName' in data) {
                    avatarEl.src = ConvertWEBPToPNG(await GetAvatar(data["recipient.userLogin"], 'kick'));
                    titleEl.innerText = `Verschenktes Sub`;

                    const messageEl = document.createElement('div');
                    messageEl.innerHTML = `<b>${data["recipient.userName"]}</b><br>erhielt ein Sub von<br><b>${data.user}</b>!`;

                    contentEl.appendChild(messageEl);
                }
                else {
                    avatarEl.src = ConvertWEBPToPNG(await GetAvatar(data.user, 'kick'));

                    // Calculate how many subs were gived
                    let maxIndex = -1;
                    for (const key in data) {
                        const match = key.match(/^recipient\.(\d+)\./);
                        if (match) {
                            const index = parseInt(match[1], 10);
                            if (index > maxIndex) {
                                maxIndex = index;
                            }
                        }
                    }
                    const totalGifts = maxIndex + 1;

                    titleEl.innerHTML = `${totalGifts} × Gifted Subs`;
                    subtitleEl.innerText = `${data.user}`;

                    const messageEl = document.createElement('div');

                    // Loop through each recipient and include it in the receipt
                    const recipients = {};

                    // Reconstruct recipient objects
                    for (const key in data) {
                        const match = key.match(/^recipient\.(\d+)\.(.+)$/);
                        if (match) {
                            const index = match[1];
                            const field = match[2];

                            if (!recipients[index]) {
                                recipients[index] = {};
                            }

                            recipients[index][field] = data[key];
                        }
                    }

                    // Loop through and print userName
                    for (const index in recipients) {
                        messageEl.innerHTML += `${recipients[index].userName}<br>`;
                    }

                    contentEl.appendChild(messageEl);
                }

                // Set the platform icon
                SetPlatformIcon(iconEl, 'kick');
            }
            break;

        // StreamElements Events
        case ('StreamElementsTip'):
            {
                const avatarURL = await GetAvatar(data.tipUsername, 'twitch');
                if (IsValidUrl(avatarURL))
                    avatarEl.src = avatarURL;
                else
                avatarEl.style.display = 'none'
                titleEl.style.fontSize = '2em';
                titleEl.innerText = FormatCurrency(data.tipAmount, data.tipCurrency);
                subtitleEl.innerText = `${data.tipUsername}`;

                if (data.tipMessage) {
                    const messageEl = document.createElement('div');
                    messageEl.innerHTML = `<i>${data.tipMessage}</i>`;

                    contentEl.appendChild(messageEl);
                }
                else {
                    contentEl.style.display = 'none';
                }

                // Set the platform icon
                // SetPlatformIcon(iconEl, 'streamelements')
            }
            break;

        // Fourthwall Events
        case ('FourthwallDonation'):
            {
                const avatarURL = await GetAvatar(data["fw.username"], 'twitch');
                if (IsValidUrl(avatarURL))
                    avatarEl.src = avatarURL;
                else
                    avatarEl.style.display = 'none'
                titleEl.style.fontSize = '2em';
                titleEl.innerText = FormatCurrency(data["fw.amount"], data["fw.currency"]);
                if (data["fw.username"])
                    subtitleEl.innerText = `${data["fw.username"]}`;
                else if (data["fw.email"])
                    subtitleEl.innerText = `${data["fw.email"]}`;

                if (data["fw.message"]) {
                    const messageEl = document.createElement('div');
                    messageEl.innerHTML = `<i>${data["fw.message"]}</i>`;

                    contentEl.appendChild(messageEl);
                }
                else {
                    contentEl.style.display = 'none';
                }

                // Set the platform icon
                // SetPlatformIcon(iconEl, 'fourthwall')

            }
            break;
        // case ('FourthwallGiftPurchase'):
        //     break;
        case ('FourthwallOrderPlaced'):
            {
                // Only print non-free orders
                if (data["fw.total"] <= 0)
                    return;

                const avatarURL = await GetAvatar(data["fw.username"], 'twitch');
                if (IsValidUrl(avatarURL))
                    avatarEl.src = avatarURL;
                else
                    avatarEl.style.display = 'none'
                titleEl.style.fontSize = '2em';
                titleEl.innerText = FormatCurrency(data["fw.total"], data["fw.currency"]);
                if (data["fw.username"])
                    subtitleEl.innerText = `${data["fw.username"]}`;
                else if (data["fw.email"])
                    subtitleEl.innerText = `${data["fw.email"]}`;

                // Compile a list of all items bought
                const variants = [];

                // Iterate through all keys in the data object
                for (const key in data) {
                    const match = key.match(/^fw\.variants\[(\d+)\]\.(\w+)$/);
                    if (match) {
                        const index = Number(match[1]);
                        const field = match[2];

                        // Make sure the array slot exists
                        if (!variants[index]) {
                            variants[index] = {};
                        }

                        // Assign the field to the appropriate variant object
                        variants[index][field] = data[key];
                    }
                }

                // Print each item on the receipt
                const messageEl = document.createElement('div');
                variants.forEach((variant, i) => {
                    messageEl.innerHTML += `${variant.quantity} × ${variant.name}<br>`;
                });
                messageEl.style.textAlign = 'left';

                // Check if they left a custom message
                let customMessageEl = document.createElement('div');
                const customMessage = data["fw.statmessageus"];
                if (customMessage) {
                    const txt = document.createElement("textarea");
                    txt.innerHTML = customMessage;
                    customMessageEl.innerHTML += `<br><i>${txt.value}</i>`;
                }

                // Add a cute thank you message because you're uwu like that
                const thankYouEl = document.createElement('div');
                thankYouEl.innerHTML += `<br><b>Vielen Dank für deinen Einkauf!</b>`;

                contentEl.appendChild(messageEl);
                contentEl.appendChild(customMessageEl);
                contentEl.appendChild(thankYouEl);
            }
            break;
        case ('FourthwallSubscriptionPurchased'):
            {
                const avatarURL = await GetAvatar(data["fw.nickname"], 'twitch');
                if (IsValidUrl(avatarURL))
                    avatarEl.src = avatarURL;
                else
                    avatarEl.style.display = 'none'
                titleEl.innerText = `Neues Mitglied`;
                subtitleEl.innerHTML = `${data["fw.nickname"]}`;

                const messageEl = document.createElement('div');
                messageEl.innerHTML = `Danke für den Beitritt auf der <b>${FormatCurrency(data["fw.amount"], data["fw.currency"])}</b> Stufe!`;

                contentEl.appendChild(messageEl);
            }
            break;

        // Ko-fi Events
        case ('KofiDonation'):
            {
                const avatarURL = await GetAvatar(data.from, 'twitch');
                if (IsValidUrl(avatarURL))
                    avatarEl.src = avatarURL;
                else
                avatarEl.style.display = 'none'
                titleEl.style.fontSize = '2em';
                titleEl.innerText = FormatCurrency(data.amount, data.currency);
                subtitleEl.innerText = `${data.from}`;

                if (data.message) {
                    const messageEl = document.createElement('div');
                    messageEl.innerHTML = `<i>${data.message}</i>`;

                    contentEl.appendChild(messageEl);
                }
                else {
                    contentEl.style.display = 'none';
                }

                // Set the platform icon
                // SetPlatformIcon(iconEl, 'kofi')

            }
            break;
        case ('KofiSubscription'):
            {
                const avatarURL = await GetAvatar(data.from, 'twitch');
                if (IsValidUrl(avatarURL))
                    avatarEl.src = avatarURL;
                else
                avatarEl.style.display = 'none'
                titleEl.style.fontSize = '2em';
                titleEl.innerText = FormatCurrency(data.amount, data.currency);
                subtitleEl.innerText = `${data.from}`;

                if (data.message) {
                    const messageEl = document.createElement('div');
                    messageEl.innerHTML = `<i>${data.message}</i>`;

                    contentEl.appendChild(messageEl);
                }
                else {
                    contentEl.style.display = 'none';
                }

                // Set the platform icon
                // SetPlatformIcon(iconEl, 'kofi')

            }
            break;
        case ('KofiResubscription'):
            {
                const avatarURL = await GetAvatar(data.from, 'twitch');
                if (IsValidUrl(avatarURL))
                    avatarEl.src = avatarURL;
                else
                avatarEl.style.display = 'none'
                titleEl.style.fontSize = '2em';
                titleEl.innerText = `Neues Mitglied`;
                subtitleEl.innerText = `${data.from}`;

                const messageEl = document.createElement('div');
                messageEl.innerHTML = `Danke für den Beitritt der <b>${data.tier}</b> <i>(${FormatCurrency(data.amount, data.currency)})</i> Stufe!`;

                contentEl.appendChild(messageEl);

                // Set the platform icon
                // SetPlatformIcon(iconEl, 'kofi')

            }
            break;
        case ('KofiShopOrder'):
            {
                // Only print non-free orders
                if (data.amount <= 0)
                    return;

                const avatarURL = await GetAvatar(data.from, 'twitch');
                if (IsValidUrl(avatarURL))
                    avatarEl.src = avatarURL;
                else
                avatarEl.style.display = 'none'
                titleEl.style.fontSize = '2em';
                titleEl.innerText = FormatCurrency(data.amount, data.currency);
                subtitleEl.innerText = `${data.from}`;

                // Zusammenfassung der Bestellung erstellen
                const messageEl = document.createElement('div');
                const count = parseInt(data.itemCount) || 0;
                
                // Grammatik-Check: "1 Artikel" vs. "X Artikel"
                const itemText = count === 1 ? "1 Artikel" : `${count} Artikel`;
                messageEl.innerHTML = `hat <b>${itemText}</b> im Shop gekauft!`;

                // Nachricht des Käufers (Textarea-Trick für Sicherheit gegen HTML-Injection)
                let customMessageEl = document.createElement('div');
                const customMessage = data.message;
                if (customMessage && customMessage.trim() !== "") {
                    const txt = document.createElement("textarea");
                    txt.innerHTML = customMessage;
                    customMessageEl.innerHTML = `<br><i>"${txt.value}"</i>`;
                }

                // Dankeschön-Block
                const thankYouEl = document.createElement('div');
                thankYouEl.innerHTML = `<br><b>Vielen Dank für den Support!</b>`;

                // Alles dem Widget-Container hinzufügen
                contentEl.appendChild(messageEl);
                
                if (customMessage && customMessage.trim() !== "") {
                    contentEl.appendChild(customMessageEl);
                }
                
                contentEl.appendChild(thankYouEl);
            }
            break;

        // Patreon Events
        case ('PatreonPledgeCreated'):
            {
                // Avatar laden
                const avatarURL = await GetAvatar(data.user.attributes.vanity, 'twitch');
                if (IsValidUrl(avatarURL))
                    avatarEl.src = avatarURL;
                else
                    avatarEl.style.display = 'none';
                
                titleEl.style.fontSize = '2em';
                
                // Betrag von Cents in Dollar umrechnen
                const realAmount = Number(data.attributes.will_pay_amount_cents) / 100;
                
                titleEl.innerText = FormatCurrency(realAmount, '$'); 
                
                subtitleEl.innerText = `${data.user.attributes.vanity}`;

                // Wir prüfen direkt, ob 'note' existiert
                if (data.attributes && data.attributes.note) {
                    const messageEl = document.createElement('div');
                    messageEl.innerHTML = `<i>${data.attributes.note}</i>`;

                    contentEl.appendChild(messageEl);
                }
                else {
                    contentEl.style.display = 'none';
                }

                // Set the platform icon
                // SetPlatformIcon(iconEl, 'patreon')
            }
            break;

        // TipeeeStream Events
        case ('TipeeeStreamDonation'):
            {
                const avatarURL = await GetAvatar(data.username, 'twitch');
                if (IsValidUrl(avatarURL))
                    avatarEl.src = avatarURL;
                else
                    avatarEl.style.display = 'none';
                
                titleEl.style.fontSize = '2em';
                
                // Netto-Betrag berechnen (Spende minus Gebühren)
                const netAmount = Number(data.amount) - Number(data.fees);

                // Zeigt den originalen Betrag an
                titleEl.innerHTML = `${FormatCurrency(data.amount, data.currency)}`;
                
                // Neues Element für den Netto-Betrag (in Klammern) erstellen
                const netAmountEl = document.createElement('div');
                netAmountEl.innerHTML = `<i>(${FormatCurrency(netAmount, data.currency)})<i/>`;
                
                // Optional: Etwas Abstand nach unten zum Username einfügen
                netAmountEl.style.marginBottom = '5px'; 
                
                // WICHTIG: Das Element exakt VOR dem Username (subtitleEl) in das Dokument einfügen!
                subtitleEl.parentNode.insertBefore(netAmountEl, subtitleEl);

                // Username setzen
                subtitleEl.innerText = `${data.username}`;

                if (data.message) {
                    const messageEl = document.createElement('div');
                    messageEl.innerHTML = `<i>${data.message}<i/>`;

                    contentEl.appendChild(messageEl);
                }

                // // Set the platform icon
                // SetPlatformIcon(iconEl, 'tipeeestream');
            }
            break;

        // Custom Code Events
        case ('CustomCodeEvent'):
            {
                switch (data.triggerCustomCodeEventName) {
                    case ('kickIncomingRaid'):
                        {
                            avatarEl.src = ConvertWEBPToPNG(await GetAvatar(data.user, 'kick'));

                            const messageEl = document.createElement('div');
                            messageEl.innerHTML = `<b>${data.user}</b><br>hostet mit einer Gruppe von<br><b>${data.viewers} Zuschauern!</b>`;

                            contentEl.appendChild(messageEl);

                            // Set the platform icon
                            SetPlatformIcon(iconEl, 'kick');
                        }
                        break;
                    case ('kickKicksGifted'):
                        {
                            if (data.giftType != 'LEVEL_UP')
                                return;

                            avatarEl.src = ConvertWEBPToPNG(`https://files.kick.com/kicks/gifts/${data.gift.toLowerCase().replace(/ /g, "-")}.webp`);
                            avatarEl.style.borderRadius = '0px';
                            titleEl.innerText = `${data.amount} KICKS`;
                            subtitleEl.innerText = `${data.sender}`;

                            const messageEl = document.createElement('div');
                            messageEl.innerHTML = data.message;

                            contentEl.appendChild(messageEl);

                            // Set the platform icon
                            SetPlatformIcon(iconEl, 'kick');
                        }
                        break;
                }
            }
            break;

        // Don't print any event not excplicitly listed above
        default:
            return;
    }

    // Set the timestamp
    const { DateTime } = luxon;
    const now = DateTime.local().setLocale('de');
    const fullFormatted = now.toFormat("cccc, dd. LLLL yyyy HH:mm:ss 'Uhr'");

    dateEl.textContent = fullFormatted;

    // Send it to the print routine!
    const receiptHTML = await GetRenderedHTML(instance);

    window.parent.sbClient.doAction({ id: sbActionPrintRoutine }, {
        receiptHTML: receiptHTML,
        isTest: data.isTest,
        printerName: document.getElementById('printer-name').value,
        paperWidth: document.getElementById('paper-width').value,
        discordWebhookUrl: document.getElementById('discord-Webhook-Url').value,
        postToDiscord: document.getElementById('post-To-Discord').checked,
        ignoreTestTriggers: document.getElementById('ignore-test-triggers').checked,
        deleteTempFiles: document.getElementById('delete-temp-files').checked,
        printGiftBombsIndividually: document.getElementById('print-gift-bombs-individually').checked
    });
}


//////////////////////
// HELPER FUNCTIONS //
//////////////////////

async function GetRenderedHTML(fragment) {
    if (!(fragment instanceof DocumentFragment)) {
        throw new Error('Argument must be a DocumentFragment');
    }

    // Filter out comment nodes from fragment content
    const nodes = Array.from(fragment.childNodes).filter(
        node => node.nodeType !== Node.COMMENT_NODE
    );

    const bodyContent = nodes
        .map(node => node.outerHTML || node.textContent)
        .join('');

    // Get inline <style> contents
    const inlineStyles = Array.from(document.querySelectorAll('style'))
        .map(style => style.textContent)
        .join('\n');

    // Get all external stylesheet URLs
    const linkHrefs = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .map(link => link.href);

    // Fetch external CSS contents
    const externalCSSContents = await Promise.all(
        linkHrefs.map(async href => {
            try {
                const res = await fetch(href);
                if (!res.ok) throw new Error(`Failed to load CSS from ${href}`);
                return await res.text();
            } catch {
                console.warn(`Could not fetch CSS from ${href}`);
                return '';
            }
        })
    );

    // Combine all CSS into one string
    const combinedCSS = inlineStyles + '\n' + externalCSSContents.join('\n');

    // Build the full standalone HTML string
    const fullHTML = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <style>${combinedCSS}</style>
</head>
<body>
  ${bodyContent}
</body>
</html>`.trim();

    return fullHTML;
}

function ConvertWEBPToPNG(URL) {
    return `https://images.weserv.nl/?url=${URL}&output=png`;
}

function FormatCurrency(amount, currency) {
    const isISOCode = /^[A-Z]{3}$/.test(currency);

    if (isISOCode) {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currency,
                currencyDisplay: 'symbol',
            }).format(amount);
        } catch {
            return `${amount.toFixed(2)} ${currency}`;
        }
    }

    // Handle some common symbols that go before the number
    const symbolsBefore = ['$', '€', '£', '¥', '₹'];

    if (symbolsBefore.includes(currency)) {
        return `${currency}${amount.toFixed(2)}`;
    }

    // Otherwise default to appending after
    return `${amount.toFixed(2)} ${currency}`;
}

function IsValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

function SetPlatformIcon(el, platform) {
    // Set the platform icon
    let baseURL = window.location.href;
    baseURL = baseURL.replace(/index\.html$/i, '');

    el.src = `${baseURL}/icons/platforms/${platform}.png`;
}



///////////////////////
// PAGE INTERACTIONS //
///////////////////////

let data = {
    "__source": "TwitchSub",
    "tier": "prime",
    "isPrimeSub": true,
    "monthsSubscribed": 1,
    "isTest": false,
    "actionName": "[PB] Printer Bot | Events",
    "user": "InfernoMate",
    "userName": "infernomate",
    "userType": "twitch"
}

async function TestPrint() {
    CustomEvent(data);
}


///////////////////
// PAGE SETTINGS //
///////////////////

// Get references
const printerNameInput = document.getElementById('printer-name');
const paperWidthInput = document.getElementById('paper-width');
const discordWebhookUrlInput = document.getElementById('discord-Webhook-Url');
const postToDiscordInput = document.getElementById('post-To-Discord');
const ignoreTestTriggersInput = document.getElementById('ignore-test-triggers');
const deleteTempFilesInput = document.getElementById('delete-temp-files');
const printGiftBombsIndividuallyInput = document.getElementById('print-gift-bombs-individually');

// Local storage key must be prefixed with the first URL segment
const currentPath = window.location.pathname;
const urlSegment = currentPath.split('/').filter(Boolean)[0];
const storageKey = (id) => `${urlSegment}::${id}`;

function saveSetting(id) {
    const el = document.getElementById(id);
    const value = el.type === "checkbox" ? el.checked : el.value;
    localStorage.setItem(storageKey(id), value);
}

// Add event listeners
[printerNameInput, paperWidthInput, discordWebhookUrlInput, postToDiscordInput, ignoreTestTriggersInput, deleteTempFilesInput, printGiftBombsIndividuallyInput].forEach(input => {
    input.addEventListener("input", () => saveSetting(input.id));
    input.addEventListener("change", () => saveSetting(input.id));
});

// Load settings
if (localStorage.getItem(storageKey(printerNameInput.id)))
    printerNameInput.value = localStorage.getItem(storageKey(printerNameInput.id));
if (localStorage.getItem(storageKey(paperWidthInput.id)))
    paperWidthInput.value = localStorage.getItem(storageKey(paperWidthInput.id));
if (localStorage.getItem(storageKey(discordWebhookUrlInput.id)))
    discordWebhookUrlInput.value = localStorage.getItem(storageKey(discordWebhookUrlInput.id));
if (localStorage.getItem(storageKey(postToDiscordInput.id)))
    postToDiscordInput.checked = JSON.parse(localStorage.getItem(storageKey(postToDiscordInput.id)));
if (localStorage.getItem(storageKey(ignoreTestTriggersInput.id)))
    ignoreTestTriggersInput.checked = JSON.parse(localStorage.getItem(storageKey(ignoreTestTriggersInput.id)));
if (localStorage.getItem(storageKey(deleteTempFilesInput.id)))
    deleteTempFilesInput.checked = JSON.parse(localStorage.getItem(storageKey(deleteTempFilesInput.id)));
if (localStorage.getItem(storageKey(printGiftBombsIndividuallyInput.id)))
    printGiftBombsIndividuallyInput.checked = JSON.parse(localStorage.getItem(storageKey(printGiftBombsIndividuallyInput.id)));