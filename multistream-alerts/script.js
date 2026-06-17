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

const mainContainer = document.getElementById('mainContainer');
const alertBox = document.getElementById('alertBox');
const avatarElement = document.getElementById('avatar');
const avatarSmallElement = document.getElementById('avatarButItsSmallerThanTheOneFromBeforeForPrettinessPurposes');
const usernameLabel = document.getElementById('username');
const usernameTheSecondLabel = document.getElementById('usernameTheSecond');
const descriptionLabel = document.getElementById('description');
const attributeLabel = document.getElementById('attribute');
const theContentThatShowsFirstInsteadOfSecond = document.getElementById('theContentThatShowsFirstInsteadOfSecond');
const theContentThatShowsLastInsteadOfFirst = document.getElementById('theContentThatShowsLastInsteadOfFirst');
const messageLabel = document.getElementById('message');

let widgetLocked = false;						// Needed to lock animation from overlapping
let alertQueue = [];

/////////////////
// GLOBAL VARS //
/////////////////

const kickPusherWsUrl = 'wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.6.0&flash=false';
let kickSubBadges = [];



/////////////
// OPTIONS //
/////////////

// Appearance
const showAvatar = GetBooleanParam("showAvatar", true);
const font = urlParams.get("font") || "";
const fontSize = GetIntParam("fontSize", 30);
const fontColor = urlParams.get("fontColor") || "#FFFFFF";
const useCustomBackground = GetBooleanParam("useCustomBackground", true);
const background = urlParams.get("background") || "#000000";
const opacity = urlParams.get("opacity") || "0.85";
const textAlignment = urlParams.get("textAlignment") || "left";
const alignment = urlParams.get("alignment") || "";

// General
const hideAfter = GetIntParam("hideAfter", 8);
const showAnimation = urlParams.get("showAnimation") || "";
const hideAnimation = urlParams.get("hideAnimation") || "";
const playSounds = GetBooleanParam("playSounds", true);
const globalShowAction = urlParams.get("globalShowAction") || "";
const globalHideAction = urlParams.get("globalHideAction") || "";
const showMesesages = GetBooleanParam("showMesesages", true);

// Which Twitch alerts do you want to see?
const showTwitchFollows = GetBooleanParam("showTwitchFollows", false);
const twitchFollowAction = urlParams.get("twitchFollowAction") || "";
const showTwitchSubs = GetBooleanParam("showTwitchSubs", true);
const twitchSubAction = urlParams.get("twitchSubAction") || "";
const showTwitchChannelPointRedemptions = GetBooleanParam("showTwitchChannelPointRedemptions", true);
const twitchChannelPointRedemptionAction = urlParams.get("twitchChannelPointRedemptionAction") || "";
const showTwitchPowerUpRedemptions = GetBooleanParam("showTwitchPowerUpRedemptions", true);
const twitchPowerUpRedemptionAction = urlParams.get("twitchPowerUpRedemptionAction") || "";
const showTwitchCheers = GetBooleanParam("showTwitchCheers", true);
const twitchCheerAction = urlParams.get("twitchCheerAction") || "";
const showTwitchRaids = GetBooleanParam("showTwitchRaids", true);
const twitchRaidAction = urlParams.get("twitchRaidAction") || "";
const showTwitchWatchStreaks = GetBooleanParam("showTwitchWatchStreaks", true);
const twitchWatchStreaksAction = urlParams.get("twitchWatchStreaksAction") || "";

// Which Kick alerts do you want to see?
const showKickFollows = GetBooleanParam("showKickFollows", false);
const kickFollowAction = urlParams.get("kickFollowAction") || "";
const showKickSubs = GetBooleanParam("showKickSubs", true);
const kickSubAction = urlParams.get("kickSubAction") || "";
const showKickChannelPointRedemptions = GetBooleanParam("showKickChannelPointRedemptions", true);
const kickChannelPointRedemptionAction = urlParams.get("kickChannelPointRedemptionAction") || "";
const showKickHosts = GetBooleanParam("showKickHosts", true);
const kickHostAction = urlParams.get("kickHostAction") || "";
const showKickGifts = GetBooleanParam("showKickGifts", true);
const kickGiftAction = urlParams.get("kickGiftAction") || "";

// Which YouTube alerts do you want to see?
const showYouTubeSubs = GetBooleanParam("showYouTubeSubs", true);
const youtubeSubAction = urlParams.get("youtubeSubAction") || "";
const showYouTubeSuperChats = GetBooleanParam("showYouTubeSuperChats", true);
const youtubeSuperChatAction = urlParams.get("youtubeSuperChatAction") || "";
const showYouTubeSuperStickers = GetBooleanParam("showYouTubeSuperStickers", true);
const youtubeSuperStickerAction = urlParams.get("youtubeSuperStickerAction") || "";
const showYouTubeMemberships = GetBooleanParam("showYouTubeMemberships", true);
const youtubeMembershipAction = urlParams.get("youtubeMembershipAction") || "";

// Which TikTok alerts do you want to see?
const enableTikTokSupport = GetBooleanParam("enableTikTokSupport", false);
const showTikTokGifts = GetBooleanParam("showTikTokGifts", true);
const tiktokGiftAction = urlParams.get("tiktokGiftAction") || "";
const showTikTokSubs = GetBooleanParam("showTikTokSubs", true);
const tiktokSubAction = urlParams.get("tiktokSubAction") || "";

// Which donation alerts do you want to see?
const showStreamElementsTips = GetBooleanParam("showStreamElementsTips", true);
const streamelementsTipAction = urlParams.get("streamelementsTipAction") || "";
const showPatreonMemberships = GetBooleanParam("showPatreonMemberships", true);
const patreonMembershipActions = urlParams.get("patreonMembershipActions") || "";
const showKofiDonations = GetBooleanParam("showKofiDonations", true);
const kofiDonationAction = urlParams.get("kofiDonationAction") || "";
const showTipeeeStreamDonations = GetBooleanParam("showTipeeeStreamDonations", true);
const tipeeestreamDonationAction = urlParams.get("tipeeestreamDonationAction") || "";
const showFourthwallAlerts = GetBooleanParam("showFourthwallAlerts", true);
const fourthwallAlertAction = urlParams.get("fourthwallAlertAction") || "";

////////////////////
// HIDDEN OPTIONS //
////////////////////

let twitchUsername = urlParams.get("twitchUsername") || "";
let kickUsername = urlParams.get("kickUsername") || "";
let youtubeUsername = urlParams.get("youtubeUsername") || "";

// Set avatar visibility
if (!showAvatar) {
	avatarElement.style.display = 'none';
	avatarSmallElement.style.display = 'none';
	alertBox.style.padding = '0.5em 1em';
}

// Set fonts for the widget
document.body.style.fontFamily = font;
document.body.style.fontSize = `${fontSize}px`;
document.body.style.color = fontColor;

// Set custom background
if (useCustomBackground) {
	const opacity255 = Math.round(parseFloat(opacity) * 255);
	let hexOpacity = opacity255.toString(16);
	if (hexOpacity.length < 2) {
		hexOpacity = "0" + hexOpacity;
	}
	//document.body.style.background = `${background}${hexOpacity}`;
	//console.log(`${background}${hexOpacity}`);
	document.documentElement.style.setProperty('--custom-background', `${background}${hexOpacity}`);
}

// Set text alignment
document.documentElement.style.setProperty('--text-align', textAlignment);

// Set the alignment of the alert box
switch (alignment)
{
	case "align-to-top":
		mainContainer.style.justifyContent = 'flex-start';
		break;
	case "align-to-center":
		mainContainer.style.justifyContent = 'center';
		break;
	case "align-to-bottom":
		mainContainer.style.justifyContent = 'flex-end';
		break;
}



/////////////////////////
// STREAMER.BOT CLIENT //
/////////////////////////

const client = new StreamerbotClient({
	host: sbServerAddress,
	port: sbServerPort,

	onConnect: (data) => {
		console.log(`Streamer.bot successfully connected to ${sbServerAddress}:${sbServerPort}`)
		console.debug(data);
		SetConnectionStatus(true);
		KickConnect();
	},

	onDisconnect: () => {
		console.error(`Streamer.bot disconnected from ${sbServerAddress}:${sbServerPort}`)
		SetConnectionStatus(false);
	}
});

client.on('Twitch.Follow', (response) => {
	console.debug(response.data);
	TwitchFollow(response.data);
})

client.on('Twitch.Cheer', (response) => {
	console.debug(response.data);
	TwitchCheer(response.data);
})

client.on('Twitch.Sub', (response) => {
	console.debug(response.data);
	TwitchSub(response.data);
})

client.on('Twitch.ReSub', (response) => {
	console.debug(response.data);
	TwitchResub(response.data);
})

client.on('Twitch.GiftSub', (response) => {
	console.debug(response.data);
	TwitchGiftSub(response.data);
})

client.on('Twitch.GiftBomb', (response) => {
	console.debug(response.data);
	TwitchGiftBomb(response.data);
})

client.on('Twitch.RewardRedemption', (response) => {
	console.debug(response.data);
	TwitchRewardRedemption(response.data);
})

client.on('Twitch.CustomPowerUpRedemption', (response) => {
	console.debug(response.data);
	TwitchCustomPowerUpRedemption(response.data);
})

client.on('Twitch.Raid', (response) => {
	console.debug(response.data);
	TwitchRaid(response.data);
})

client.on('Twitch.WatchStreak', (response) => {
	console.debug(response.data);
	TwitchWatchStreak(response.data);
})

client.on('YouTube.NewSubscriber', (response) => {
    console.debug("YouTube.NewSubscriber data:", response.data); 
    YouTubeNewSubscriber(response.data);
})

client.on('YouTube.SuperChat', (response) => {
	console.debug(response.data);
	YouTubeSuperChat(response.data);
})

client.on('YouTube.SuperSticker', (response) => {
	console.debug(response.data);
	YouTubeSuperSticker(response.data);
})

client.on('YouTube.NewSponsor', (response) => {
	console.debug(response.data);
	YouTubeNewSponsor(response.data);
})

client.on('YouTube.GiftMembershipReceived', (response) => {
	console.debug(response.data);
	YouTubeGiftMembershipReceived(response.data);
})

client.on('StreamElements.Tip', (response) => {
	console.debug(response.data);
	StreamElementsTip(response.data);
})

client.on('Patreon.PledgeCreated', (response) => {
	console.debug(response.data);
	PatreonPledgeCreated(response.data);
})

client.on('Kofi.Donation', (response) => {
	console.debug(response.data);
	KofiDonation(response.data);
})

client.on('Kofi.Subscription', (response) => {
	console.debug(response.data);
	KofiSubscription(response.data);
})

client.on('Kofi.Resubscription', (response) => {
	console.debug(response.data);
	KofiResubscription(response.data);
})

client.on('Kofi.ShopOrder', (response) => {
	console.debug(response.data);
	KofiShopOrder(response.data);
})

client.on('TipeeeStream.Donation', (response) => {
	console.debug(response.data);
	TipeeeStreamDonation(response.data);
})

client.on('Fourthwall.OrderPlaced', (response) => {
	console.debug(response.data);
	FourthwallOrderPlaced(response.data);
})

client.on('Fourthwall.Donation', (response) => {
	console.debug(response.data);
	FourthwallDonation(response.data);
})

client.on('Fourthwall.SubscriptionPurchased', (response) => {
	console.debug(response.data);
	FourthwallSubscriptionPurchased(response.data);
})

client.on('Fourthwall.GiftPurchase', (response) => {
	console.debug(response.data);
	FourthwallGiftPurchase(response.data);
})

client.on('Fourthwall.GiftDrawStarted', (response) => {
	console.debug(response.data);
	FourthwallGiftDrawStarted(response.data);
})

client.on('Fourthwall.GiftDrawEnded', (response) => {
	console.debug(response.data);
	FourthwallGiftDrawEnded(response.data);
})



///////////////////////////
// KICK PUSHER WEBSOCKET //
///////////////////////////

// Connect and handle Pusher WebSocket
async function KickConnect() {
	// Fetch from Streamer.bot
	const broadcasterInfo = await client.getBroadcaster();

	// This code has nothing to do with Kick, but it's a really good place to get Twitch and YouTube usernames as well, because I'm built different like that
	if (broadcasterInfo.platforms.twitch)
		twitchUsername = broadcasterInfo.platforms.twitch.broadcastUserName;
	if (broadcasterInfo.platforms.youtube)
		youtubeUsername = broadcasterInfo.platforms.youtube.broadcastUserName;

	// If user has not manually set Kick username, try to grab if from Streamer.bot
	if (!kickUsername)
	{
		if (broadcasterInfo.platforms.kick)
			kickUsername = broadcasterInfo.platforms.kick.broadcasterLogin;
		else
			return;
	}

	// Channel to subscribe to (you'll need the correct channel name here)
    const kickIds = await GetKickIds(kickUsername);
    const chatroomId = kickIds.chatroomId;
    const channelId = kickIds.channelId;

	// Cache subscriber badges
	kickSubBadges = await GetKickSubBadges(kickUsername);

	const websocket = new WebSocket(kickPusherWsUrl);

    // Reconnect
    websocket.onclose = function () {
        console.log(`Reconnecting to ${kickUsername}...`);
        setTimeout(KickConnect, 5000);
    };

	websocket.onopen = function () {
		console.log(`Kick successfully conntected to ${kickUsername}.`);
	}

	websocket.onmessage = function (response) {
		try {
			let data = JSON.parse(response.data);

			console.debug(data);

			// When connection is established, subscribe to a channel
			if (data.event === 'pusher:connection_established') {
				const socketData = JSON.parse(data.data);
				console.log(`[Pusher] Socket established with ID: ${socketData.socket_id}`);

				// Now subscribe to a channel
                websocket.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: `chatroom_${chatroomId}` } }));
                websocket.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: `chatrooms.${chatroomId}` } }));
                websocket.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: `chatrooms.${chatroomId}.v2` } }));
                websocket.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: `predictions-channel-${chatroomId}` } }));
                websocket.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel: `channel_${channelId}` } }));
				console.log(`[Pusher] Sent subscription request to channel: ${chatroomId}`);
			}

			// Event handlers
			const eventArgs = JSON.parse(data.data);
			const event = data.event.split('\\').pop();
			switch (event) {
				//// 'Follows' unsupported by pusher
				// case 'FollowEvent':
				// 	break;
				case 'SubscriptionEvent':
					KickSubscription(eventArgs);
					break;
				case 'GiftedSubscriptionsEvent':
					KickGiftedSubscriptions(eventArgs);
					break;
				case 'RewardRedeemedEvent':
					KickRewardRedeemed(eventArgs);
					break;
				case 'StreamHostEvent':
					KickStreamHost(eventArgs);
					break;
				case 'KicksGifted':
					KickKicksGifted(eventArgs);
					break;
			}
		}
		catch (error) {
			console.error(error);
		}
	}
}


//////////////////////
// TIKFINITY CLIENT //
//////////////////////

let tikfinityWebsocket = null;

function TikfinityConnect() {
	if (!enableTikTokSupport)
		return;

	if (tikfinityWebsocket) return; // Already connected

	tikfinityWebsocket = new WebSocket("ws://localhost:21213/");

	tikfinityWebsocket.onopen = function () {
		console.log(`TikFinity successfully connected...`)
	}

	tikfinityWebsocket.onclose = function () {
		console.error(`TikFinity disconnected...`)
		tikfinityWebsocket = null;
		setTimeout(TikfinityConnect, 1000); // Schedule a reconnect attempt
	}

	tikfinityWebsocket.onerror = function () {
		console.error(`TikFinity failed for some reason...`)
		tikfinityWebsocket = null;
		setTimeout(TikfinityConnect, 1000); // Schedule a reconnect attempt
	}

	tikfinityWebsocket.onmessage = function (response) {
		let payload = JSON.parse(response.data);

		let event = payload.event;
		let data = payload.data;

		console.debug('Event: ' + event);

		switch (event) {
			case 'gift':
				TikTokGift(data);
				break;
			case 'subscribe':
				TikTokSubscribe(data);
				break;
		}
	}
}

// Try connect when window is loaded
window.addEventListener('load', TikfinityConnect);



////////////////////////
// MULTISTREAM ALERTS //
////////////////////////

async function TwitchFollow(data) {
	if (!showTwitchFollows)
		return;

	// Set the text
	// Holt den Namen je nach Streamer.bot Version
	const username = data.user?.name ?? data.user_name ?? data.targetUser?.name ?? "Jemand";
	// const login = data.user?.login ?? data.user_login ?? data.targetUser?.login ?? "jemand";

	// Render avatars
	const avatarURL = await GetAvatar(username, 'twitch');

	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username}`,
		`hat auf Folgen gedrückt`,
		``,
		username,
		``,
		twitchFollowAction,
		data
	);
}

async function TwitchCheer(data) {
	if (!showTwitchCheers)
		return;

	// Set the text
	const username = data.user.login;
	const bits = data.bits;
	let message = ConstructMessageFromParts(data.parts);

	// Render avatars
	const avatarURL = await GetAvatar(username, 'twitch');

	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username}`,
		`hat ${bits} Bits gecheert`,
		'',
		username,
		message,
		twitchCheerAction,
		data
	);
}

async function TwitchSub(data) {
	if (!showTwitchSubs)
		return;

	// Set the text
	const username = data.user.name;
	const subTier = data.sub_tier;
	const isPrime = data.is_prime;

	// Render avatars
	const avatarURL = await GetAvatar(username, 'twitch');

	if (!isPrime)
		UpdateAlertBox(
			'twitch',
			avatarURL,
			`${username}`,
			`hat mit Stufe ${subTier.charAt(0)} abonniert`,
			'',
			username,
			'',
			twitchSubAction,
			data
		);
	else
		UpdateAlertBox(
			'twitch',
			avatarURL,
			`${username}`,
			`nutzte den Prime-Sub`,
			'',
			username,
			'',
			twitchSubAction,
			data
		);
}

async function TwitchResub(data) {
	if (!showTwitchSubs)
		return;

	// Set the text
	const username = data.user.name;
	const subTier = data.subTier;
	const isPrime = data.isPrime;
	const cumulativeMonths = data.cumulativeMonths;
	const message = data.text;

	// Render avatars
	const avatarURL = await GetAvatar(username, 'twitch');

	if (!isPrime)
		UpdateAlertBox(
			'twitch',
			avatarURL,
			`${username}`,
			`hat mit Stufe ${subTier.charAt(0)} erneut abonniert`,
			`${cumulativeMonths} Monate`,
			username,
			message,
			twitchSubAction,
			data
		);
	else
		UpdateAlertBox(
			'twitch',
			avatarURL,
			`${username}`,
			`hat seinen Prime-Sub genutzt`,
			`${cumulativeMonths} Monate`,
			username,
			message,
			twitchSubAction,
			data
		);
}

async function TwitchGiftSub(data) {
	if (!showTwitchSubs)
		return;

	// Set the text
	const username = data.user.name;
	const subTier = data.subTier;
	const recipient = data.recipient.name;
	const cumlativeTotal = data.cumlativeTotal;
	const fromCommunitySubGift = data.fromCommunitySubGift;

	// Don't post alerts for gift bombs
	if (fromCommunitySubGift)
		return;

	// Render avatars
	const avatarURL = await GetAvatar(username, 'twitch');
	
	let messageText = '';
	if (cumlativeTotal > 0)
		messageText = `Hat insgesamt ${cumlativeTotal} Abos verschenkt!`;

	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username}`,
		`hat ein Stufe ${subTier.charAt(0)} Abo verschenkt`,
		`an ${recipient}`,
		username,
		messageText,
		twitchSubAction,
		data
	);
}

async function TwitchGiftBomb(data) {
	if (!showTwitchSubs)
		return;

	//// The below is incorrect (Streamer.bot documentation is wrong)
	// const username = data.displayName;
	// const gifts = data.gifts;
	// const totalGifts = data.totalGifts;
	// const subTier = data.subTier;
	const username = data.user.name;
	const login = data.user.login;
	const gifts = data.recipients.length;
	const totalGifts = data.cumulative_total;
	const subTier = data.sub_tier.charAt(0);

	// Render avatars
	const avatarURL = await GetAvatar(login, 'twitch');

	let message = ``;
	if (totalGifts > 0)
		message = `Hat insgesamt ${totalGifts} Abos verschenkt!`;

	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username}`,
		`hat ${gifts} Stufe ${subTier} Abos verschenkt!`,
		``,
		username,
		message,
		twitchSubAction,
		data
	);
}

async function TwitchRewardRedemption(data) {
	if (!showTwitchChannelPointRedemptions)
		return;

	const username = data.user_name;
	const rewardName = data.reward.title;
	const cost = data.reward.cost;
	const userInput = data.user_input;
	const channelPointIcon = `<img src="icons/badges/twitch-channel-point.png" class="platform" style="height: 1em"/>`;

	// Render avatars
	const avatarURL = await GetAvatar(data.user_login, 'twitch');

	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username} hat eingelöst`,
		`${rewardName} ${channelPointIcon} ${cost}`,
		'',
		username,
		userInput,
		twitchChannelPointRedemptionAction,
		data
	);
}

async function TwitchCustomPowerUpRedemption(data) {
	if (!showTwitchPowerUpRedemptions)
		return;

	let username = data.user.name;
	if (data.user.name.toLowerCase() != data.user.login.toLowerCase())
		username = `${data.user.name} (${data.user.login})`;
	const powerUpName = data.customPowerUp.title;
	const cost = data.customPowerUp.bits;
	const userInput = data.userInput;
	const bitIcon = `<img src="icons/badges/twitch-bit.svg" class="platform" style="height: 1em"/>`;

	// Render avatars
	const avatarURL = await GetAvatar(data.user.login, 'twitch');

	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username} hat eingelöst`,
		`${powerUpName} ${bitIcon} ${cost}`,
		'',
		username,
		userInput,
		twitchPowerUpRedemptionAction,
		data
	);
}

async function TwitchRaid(data) {
	if (!showTwitchRaids)
		return;

	// Render avatars
	const avatarURL = await GetAvatar(data.from_broadcaster_user_login, 'twitch');

	// Set the text
	const username = data.from_broadcaster_user_login;
	const viewers = data.viewers;
	
	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${username}`,
		`raidet mit ${viewers} Zuschauern`,
		'',
		username,
		'',
		twitchRaidAction,
		data
	);
}

async function TwitchWatchStreak(data) {
	if (!showTwitchWatchStreaks)
		return;

	// Render avatars
	const avatarURL = await GetAvatar(data.user.login, 'twitch');

	// Set the text
	// TODO: Streamer.bot v1.0.5-alpha3 changed the data sent with this event, so for backwards compatibility we need to check for both the old and new properties
	const displayName = data.displayName ?? data.user.name;
	const watchStreak = data.watchStreak ?? data.streak_count;
	
	UpdateAlertBox(
		'twitch',
		avatarURL,
		`${displayName}`,
		`hat aktuell eine Serie von ${watchStreak} Streams!`,
		'',
		displayName,
		'',
		twitchWatchStreaksAction,
		data
	);
}

function YouTubeNewSubscriber(data) {
    if (!showYouTubeSubs)
        return;

    UpdateAlertBox(
        'youtube',
        data.avatar,
        `${data.user.name}`,
        `hat abonniert!`,
        '',
        data.username,
        '',
        youtubeSubAction,
        data
    );
}

function YouTubeSuperChat(data) {
	if (!showYouTubeSuperChats)
		return;
	
	// Render avatars
	const avatarURL = data.user.profileImageUrl;

	UpdateAlertBox(
		'youtube',
		avatarURL,
		`${data.user.name}`,
		`hat einen Super Chat gesendet (${data.amount})`,
		'',
		data.user.name,
		data.message,
		youtubeSuperChatAction,
		data
	);
}

function YouTubeSuperSticker(data) {
	if (!showYouTubeSuperStickers)
		return;
	
	// Render avatars
	const avatarURL = FindFirstImageUrl(data);

	UpdateAlertBox(
		'youtube',
		avatarURL,
		`${data.user.name}`,
		`hat einen Super Sticker gesendet (${data.amount})`,
		'',
		data.user.name,
		'',
		youtubeSuperStickerAction,
		data
	);
}

function YouTubeNewSponsor(data) {
	if (!showYouTubeMemberships)
		return;
	
	// Render avatars
	const avatarURL = data.user.profileImageUrl;

	UpdateAlertBox(
		'youtube',
		avatarURL,
		`⭐ Neues Mitglied ${data.levelName}`,
		`Willkommen ${data.user.name}!`,
		'',
		data.user.name,
		'',
		youtubeMembershipAction,
		data
	);
}

function YouTubeGiftMembershipReceived(data) {
	if (!showYouTubeMemberships)
		return;
	
	// Render avatars
	const avatarURL = data.user.profileImageUrl;

	UpdateAlertBox(
		'youtube',
		avatarURL,
		`${data.gifter.name}`,
		`hat eine Mitgliedschaft verschenkt`,
		`an ${data.user.name} (${data.tier})!`,
		data.gifter.name,
		'',
		youtubeMembershipAction,
		data
	);
}

async function StreamElementsTip(data) {
    if (!showStreamElementsTips)
        return;

    // Set the text
    const donater = data.username;
    const formattedAmount = `${data.amount}`;
    const currency = data.currency;
    const message = data.message;

	// Versuche, den Twitch-Avatar zu laden
    let avatarURL = await GetAvatar(donater, 'twitch');
    if (!IsValidUrl(avatarURL)) avatarURL = 'icons/platforms/streamelements.jpeg';

    UpdateAlertBox(
        'streamelements',
        avatarURL,
        `${donater}`,
        `hat ${formattedAmount}${currency} gespendet`,
        ``,
        donater,
        message,
        streamelementsTipAction,
        data
    );
}

async function PatreonPledgeCreated(data) {
    if (!showPatreonMemberships)
        return;

    const user = data.attributes.full_name;
    const amount = (data.attributes.will_pay_amount_cents/100).toFixed(2);
    const patreonIcon = `<img src="icons/platforms/patreon.png" class="platform"/>`;
    
    // Versuche, den Twitch-Avatar zu laden
    let avatarURL = await GetAvatar(user, 'twitch');
    // Fallback auf das Patreon-Icon, falls der Name auf Twitch nicht existiert
    if (!IsValidUrl(avatarURL)) avatarURL = 'icons/platforms/patreon.png';
    
    UpdateAlertBox(
        'patreon',
        avatarURL,
        `${user}`,
        `ist Patreon beigetreten (${amount} €)`,
        ``,
        user,
        ``,
        patreonMembershipActions,
        data
    );
}

async function KofiDonation(data) {
    if (!showKofiDonations)
        return;

    // Set the text
    const user = data.from;
    const amount = data.amount;
    const currency = data.currency;
    const message = data.message;
    
    // Versuche, den Twitch-Avatar zu laden
    let avatarURL = await GetAvatar(user, 'twitch');
    // Fallback auf das Ko-fi-Icon
    if (!IsValidUrl(avatarURL)) avatarURL = 'icons/platforms/kofi.png';

    if (currency == "USD")
        UpdateAlertBox(
            'kofi',
            avatarURL,
            `${user}`,
            `hat $${amount} gespendet`,
            ``,
            user,
            message,
            kofiDonationAction,
            data
        );
    else if (currency == "EUR")
        UpdateAlertBox(
            'kofi',
            avatarURL,
            `${user}`,
            `hat ${amount} € gespendet`,
            ``,
            user,
            message,
            kofiDonationAction,
            data
        );
    else
        UpdateAlertBox(
            'kofi',
            avatarURL,
            `${user}`,
            `hat ${amount} ${currency} gespendet`,
            ``,
            user,
            message,
            kofiDonationAction,
            data
        );
}

async function KofiSubscription(data) {
    if (!showKofiDonations)
        return;

    // Set the text
    const user = data.from;
    const amount = data.amount;
    const currency = data.currency;
    const message = data.message;
    
    // Versuche, den Twitch-Avatar zu laden
    let avatarURL = await GetAvatar(user, 'twitch');
    // Fallback auf das Ko-fi-Icon
    if (!IsValidUrl(avatarURL)) avatarURL = 'icons/platforms/kofi.png';

    if (currency == "USD")
        UpdateAlertBox(
            'kofi',
            avatarURL,
            `${user}`,
            `hat abonniert ($${amount})`,
            ``,
            user,
            message,
            kofiDonationAction,
            data
        );
    else if (currency == "EUR")
        UpdateAlertBox(
            'kofi',
            avatarURL,
            `${user}`,
            `hat abonniert (${amount} €)`,
            ``,
            user,
            message,
            kofiDonationAction,
            data
        );
    else
        UpdateAlertBox(
            'kofi',
            avatarURL,
            `${user}`,
            `hat abonniert (${amount} ${currency} )`,
            ``,
            user,
            message,
            kofiDonationAction,
            data
        );
}

async function KofiResubscription(data) {
    if (!showKofiDonations)
        return;

    // Set the text
    const user = data.from;
    const tier = data.tier;
    const message = data.message;
    
    // Versuche, den Twitch-Avatar zu laden
    let avatarURL = await GetAvatar(user, 'twitch');
    // Fallback auf das Ko-fi-Icon
    if (!IsValidUrl(avatarURL)) avatarURL = 'icons/platforms/kofi.png';

    UpdateAlertBox(
        'kofi',
        avatarURL,
        `${user}`,
        `hat erneut abonniert (${tier})`,
        ``,
        user,
        message,
        kofiDonationAction,
        data
    );
}

async function KofiShopOrder(data) {
    if (!showKofiDonations)
        return;

    // Set the text
    const user = data.from;
    const amount = data.amount;
    const currency = data.currency;
    const message = data.message;
    const itemTotal = data.items.length;
    let formattedAmount = "";

    if (amount == 0)
        formattedAmount = ""
    else if (currency == "USD")
        formattedAmount = `($${amount})`;
    else if (currency == "EUR")
        formattedAmount = `(${amount} €)`;
    else
        formattedAmount = `(${amount} ${currency})`;
    
	// Versuche, den Twitch-Avatar zu laden
    let avatarURL = await GetAvatar(user, 'twitch');
    // Fallback auf das Ko-fi-Icon
    if (!IsValidUrl(avatarURL)) avatarURL = 'icons/platforms/kofi.png';

    UpdateAlertBox(
        'kofi',
        avatarURL,
        `${user}`,
        `hat ${itemTotal} Artikel auf Ko-fi bestellt `,
        `${formattedAmount}`,
        user,
        message,
        kofiDonationAction,
        data
    );
}

async function TipeeeStreamDonation(data) {
    if (!showTipeeeStreamDonations)
        return;

    // Set the text
    const user = data.username;
    const amount = data.amount;
    const currency = data.currency;
    const message = data.message;
    
    // Versuche, den Twitch-Avatar zu laden
    let avatarURL = await GetAvatar(user, 'twitch');
    // Fallback auf das TipeeeStream-Icon
    if (!IsValidUrl(avatarURL)) avatarURL = 'icons/platforms/tipeeeStream.png';

    if (currency == "USD")
        UpdateAlertBox(
            'tipeeeStream',
            avatarURL,
            `${user}`,
            `hat $${amount} gespendet`,
            ``,
            user,
            message,
            tipeeestreamDonationAction,
            data
        );
    else if (currency == "EUR")
        UpdateAlertBox(
            'tipeeeStream',
            avatarURL,
            `${user}`,
            `hat ${amount} € gespendet`,
            ``,
            user,
            message,
            tipeeestreamDonationAction,
            data
        );
    else
        UpdateAlertBox(
            'tipeeeStream',
            avatarURL,
            `${user}`,
            `hat ${amount} ${currency} gespendet`,
            ``,
            user,
            message,
            tipeeestreamDonationAction,
            data
        );
}

function FourthwallOrderPlaced(data) {
    if (!showFourthwallAlerts)
        return;

    // Set the text
    let user = data.username;
    const orderTotal = data.total;
    const currency = data.currency;
    const item = data.variants[0].name;
    const itemsOrdered = data.variants.length;
    const message = DecodeHTMLString(data.statmessageus);
    const itemImageUrl = data.variants[0].image;

    // If there user did not provide a username, just say "Someone"
    if (user == undefined)
        user = "Jemand";

    let attributeText = ""

    // If the user ordered more than one item, write how many items they ordered
    if (itemsOrdered > 1)
        attributeText += `und ${itemsOrdered - 1} weitere Artikel!`;

    // If the user spent money, put the order total
    if (orderTotal == 0)
        attributeText += ``;
    else if (currency == "USD")
        attributeText += ` ($${orderTotal})`;
    else if (currency == "EUR")
        attributeText += ` (${orderTotal}€)`;
    else
        attributeText += ` (${orderTotal} ${currency})`;

    UpdateAlertBox(
        'fourthwall',
        itemImageUrl,
        `${user}`,
        `hat ${item} bestellt`,
        attributeText,
        user,
        message,
        fourthwallAlertAction,
        data
    );
}

async function FourthwallDonation(data) {
    if (!showFourthwallAlerts)
        return;

    // Set the text
    let user = data.username;
    const amount = data.amount;
    const currency = data.currency;
    const message = data.message;

    // Versuche, den Twitch-Avatar zu laden
    let avatarURL = await GetAvatar(user, 'twitch');
    // Fallback auf das TipeeeStream-Icon
    if (!IsValidUrl(avatarURL)) avatarURL = 'icons/platforms/fourthwall.jpeg';
	
	let formattedAmount = '';
    
    // If the user spent money, put the order total
    if (currency == "USD")
        formattedAmount += ` $${amount}`;
    else if (currency == "EUR")
        formattedAmount += ` (${amount} €)`;
    else
        formattedAmount += ` ${amount} ${currency}`;

    UpdateAlertBox(
        'fourthwall',
        avatarURL,
        `${user}`,
        `hat gespendet ${formattedAmount}`,
        '',
        user,
        message,
        fourthwallAlertAction,
        data
    );
}

async function FourthwallSubscriptionPurchased(data) {
    if (!showFourthwallAlerts)
        return;

    // Set the text
    let user = data.nickname;
    const amount = data.amount;
    const currency = data.currency;
    
	// Versuche, den Twitch-Avatar zu laden
    let avatarURL = await GetAvatar(user, 'twitch');
    // Fallback auf das TipeeeStream-Icon
    if (!IsValidUrl(avatarURL)) avatarURL = 'icons/platforms/fourthwall.jpeg';

    let formattedAmount = '';
    
    // If the user spent money, put the order total
    if (currency == "USD")
        formattedAmount += ` ($${amount})`;
    else if (currency == "EUR")
        formattedAmount += ` (${amount} €)`;
    else
        formattedAmount += ` (${amount} ${currency})`;

    UpdateAlertBox(
        'fourthwall',
        avatarURL,
        `${user}`,
        `hat abonniert ${formattedAmount}`,
        '',
        user,
        '',
        fourthwallAlertAction,
        data
    );
}

function FourthwallGiftPurchase(data) {
    console.log(data);
    if (!showFourthwallAlerts)
        return;

    // Set the text
    // let user = data.username;
    const total = data.total;
    const currency = data.currency;
    const gifts = data.gifts.length;
    const itemName = data.offer.name;
	// const itemImageUrl = data.offer.imageUrl;
	// const message = DecodeHTMLString(data.statmessageus);

    let contents = '';
    let attributesText = '';

    // If there is more than one gifted item, display the number of gifts
    if (gifts > 1)
        contents += ` ${gifts} x `;

    // The name of the item to be given away
    contents += ` ${itemName}`;

    // If the user spent money, put the order total
    if (currency == "USD")
        attributesText = `$${total}`;
    else if (currency == "EUR")
        attributesText = `${total}€`;
    else
        attributesText = `${currency}${total}`;

    UpdateAlertBox(
        'fourthwall',
        '', // itemImageUrl,
        `Jemand`, // `${user}`,
        `hat ${contents} verschenkt`, // `gifted ${contents}`,
        attributesText,
		'', // user,
		'', // message,
        fourthwallAlertAction,
        data
    );
}

function FourthwallGiftDrawStarted(data) {
	if (!showFourthwallAlerts)
		return;

	// Set the text
	const durationSeconds = data.durationSeconds;
	const itemName = data.offer.name;

	UpdateAlertBox(
		'fourthwall',
		'',
		`<span style="font-size: 1.2em">🎁 ${itemName} Giveaway!</span>`,
		`Schreibe 'join' in den nächsten ${durationSeconds} Sekunden für eine Gewinnchance!`,
		'',
		'',
		'',
		fourthwallAlertAction,
		data
	);
}

function FourthwallGiftDrawEnded(data) {
	if (!showFourthwallAlerts)
		return;

	UpdateAlertBox(
		'fourthwall',
		'',
		`<span style="font-size: 1.2em">🥳 GIVEAWAY BEENDET 🥳</span>`,
		`Herzlichen Glückwunsch ${GetWinnersList(data.gifts)}!`,
		'',
		'',
		'',
		fourthwallAlertAction,
		data
	);
}

async function KickFollow(data) {
	if (!showKickFollows)
		return;

	// Set the text
	const username = data.user.name;

	// Render avatars
	const avatarURL = await GetAvatar(username, 'kick');

	UpdateAlertBox(
		'kick',
		avatarURL,
		`${username}`,
		`hat auf Folgen gedrückt`,
		'',
		username,
		'',
		kickFollowAction,
		data
	);
}

async function KickSubscription(data) {
	if (!showKickSubs)
		return;

	// Set the text
	const username = data.username;
	const months = data.months;
	
	let description = '';
	if (months <= 1)
		description = `hat gerade zum ersten Mal abonniert!`;
	else
		description = `hat erneut abonniert!`;

	const attribute = `${months} Monate`;

	// Render avatars
	const avatarURL = await GetAvatar(username, 'kick');

	UpdateAlertBox(
		'kick',
		avatarURL,
		`${username}`,
		description,
		attribute,
		username,
		'',
		kickSubAction,
		data
	);
}

async function KickGiftedSubscriptions(data) {
	if (!showKickSubs)
		return;

	// Set the text
	const gifter = data.gifter_username;
	const giftedUsers = data.gifted_usernames;

	let description = '';
	let attribute = '';

	if (giftedUsers.length <= 1)
	{
		description = `hat ein Abo verschenkt an`;
		attribute = `${giftedUsers[0]}`;
	}
	else
		description = `hat ${giftedUsers.length} Abo${giftedUsers.length === 1 ? '' : 's'} an die Community verschenkt!`;

	// Render avatars
	const avatarURL = await GetAvatar(gifter, 'kick');

	UpdateAlertBox(
		'kick',
		avatarURL,
		`${gifter}`,
		description,
		attribute,
		gifter,
		'',
		kickSubAction,
		data
	);
}

async function KickRewardRedeemed(data) {
	if (!showKickChannelPointRedemptions)
		return;

	const username = data.username;
	const rewardName = data.reward_title;
	const userInput = data.user_input;

	// Render avatars
	const avatarURL = await GetAvatar(username, 'kick');

	UpdateAlertBox(
		'kick',
		avatarURL,
		`${username} hat eingelöst`,
		`${rewardName}`,
		'',
		username,
		userInput,
		kickChannelPointRedemptionAction,
		data
	);
}

async function KickStreamHost(data) {
	if (!showKickHosts)
		return;

	// Render avatars
	const avatarURL = await GetAvatar(data.host_username, 'kick');

	// Set the text
	const username = data.host_username;
	const viewers = data.number_viewers;
	
	UpdateAlertBox(
		'kick',
		avatarURL,
		`${username}`,
		`raidet mit ${viewers} Zuschauern`,
		'',
		username,
		'',
		kickHostAction,
		data
	);
}

async function KickKicksGifted(data) {
	if (!showKickGifts)
		return;

	// Set the text
	const username = data.sender.username;
	const tiktokIcon = `<img src="icons/platforms/kick.png" class="platform"/>`;
	// const giftImg = `<img src=https://files.kick.com/kicks/gifts/${data.gift.gift_id.replace('_', '-')}.webp style="height: 1em"/>`;
	const kickKicksIcon = `<img src=icons/badges/kick-kicks.svg style="height: 0.8em"/>`;
	
	// Render avatars
	const avatarURL = `https://files.kick.com/kicks/gifts/${data.gift.gift_id.replace('_', '-')}.webp`;

	UpdateAlertBox(
		'kick',
		avatarURL,
		`${username}`,
		`hat ${kickKicksIcon} ${data.gift.amount} gesendet`,
		'',
		username,
		data.message,
		kickGiftAction,
		data
	);
}

async function TikTokGift(data) {
	if (!showTikTokGifts)
		return;

	if (data.giftType === 1 && !data.repeatEnd) {
		// Streak in progress => show only temporary
		console.debug(`${data.uniqueId} is sending gift ${data.giftName} x${data.repeatCount}`);
		return;
	}

	// Streak ended or non-streakable gift => process the gift with final repeat_count
	console.debug(`${data.uniqueId} has sent gift ${data.giftName} x${data.repeatCount}`);

	// Set the text
	const username = data.nickname;
	const tiktokIcon = `<img src="icons/platforms/tiktok.png" class="platform"/>`;
	const giftImg = `<img src=${data.giftPictureUrl} style="height: 1em"/>`;
	
    // Versuche, den Twitch-Avatar zu laden
    let avatarURL = await GetAvatar(username, 'twitch');
    if (!IsValidUrl(avatarURL)) avatarURL = 'icons/platforms/tiktok.png';

	UpdateAlertBox(
		'tiktok',
		avatarURL,
		`${username}`,
		`hat ${giftImg}x${data.repeatCount} gesendet`,
		'',
		username,
		'',
		tiktokGiftAction,
		data
	);
}

async function TikTokSubscribe(data) {
	if (!showTikTokSubs)
		return;

	// Set the text
	const username = data.nickname;
	const tiktokIcon = `<img src="icons/platforms/tiktok.png" class="platform"/>`;
	
    // Versuche, den Twitch-Avatar zu laden
    let avatarURL = await GetAvatar(username, 'twitch');
    if (!IsValidUrl(avatarURL)) avatarURL = 'icons/platforms/tiktok.png';
	
	UpdateAlertBox(
		'tiktok',
		avatarURL,
		`${username}`,
		`hat auf TikTok abonniert`,
		'',
		username,
		'',
		tiktokSubAction,
		data
	);
}



//////////////////////
// HELPER FUNCTIONS //
//////////////////////

// Prüft, ob ein übergebener String eine gültige URL ist
function IsValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

// I used Gemini for this shit so if it doesn't work, blame Google
function FindFirstImageUrl(jsonObject) {
	if (typeof jsonObject !== 'object' || jsonObject === null) {
		return null; // Handle invalid input
	}

	function iterate(obj) {
		if (Array.isArray(obj)) {
			for (const item of obj) {
				const result = iterate(item);
				if (result) {
					return result;
				}
			}
			return null;
		}

		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (key === 'imageUrl') {
					return obj[key]; // Found it! Return the value.
				}

				if (typeof obj[key] === 'object' && obj[key] !== null) {
					const result = iterate(obj[key]); // Recursive call for nested objects
					if (result) {
						return result; // Propagate the found value
					}
				}
			}
		}
		return null; // Key not found in this level
	}

	return iterate(jsonObject);
}

function GetWinnersList(gifts) {
	const winners = gifts.map(gift => gift.winner);
	const numWinners = winners.length;

	if (numWinners === 0) {
		return "";
	} else if (numWinners === 1) {
		return winners[0];
	} else if (numWinners === 2) {
		return `${winners[0]} und ${winners[1]}`;
	} else {
		const lastWinner = winners.pop();
		const secondLastWinner = winners.pop();
		return `${winners.join(", ")}, ${secondLastWinner} und ${lastWinner}`;
	}
}

function UpdateAlertBox(platform, avatarURL, headerText, descriptionText, attributeText, username, message, sbAction, sbData) {
	// If the page is inactive (e.g. the alert browser source is on an inactive OBS scene)
	// don't run the alert
	if (document.visibilityState != 'visible')
	{
		console.debug('Tab is inactive. Skipping alert...');
		return;
	}

	// Check if the widget is in the middle of an animation
	// If any alerts are requested while the animation is playing, it should be added to the alert queue
	if (widgetLocked) {
		console.debug("Animation is progress, added alert to queue");
		let data = { platform: platform, avatarURL: avatarURL, headerText: headerText, descriptionText: descriptionText, attributeText: attributeText, username: username, message: message, sbAction: sbAction, sbData: sbData};
		alertQueue.push(data);
		return;
	}

	// Start the animation
	widgetLocked = true;

	// Set the card background colors
	alertBox.classList = '';
	if (useCustomBackground)
		alertBox.classList.add('customBackground');
	else
		alertBox.classList.add(platform);

	// Render avatars
	if (showAvatar) {
		avatarElement.src = avatarURL;
		avatarSmallElement.src = avatarURL;
	}

	// Set labels
	usernameLabel.innerHTML = headerText != null ? headerText : '';
	usernameTheSecondLabel.innerHTML = username != null ? username : '';
	descriptionLabel.innerHTML = descriptionText != null ? descriptionText : '';
	attributeLabel.innerHTML = attributeText != null ? attributeText : '';
	messageLabel.innerHTML = message != null ? `${message}` : '';
	theContentThatShowsLastInsteadOfFirst.style.opacity = 0;

	// Start animation
	theContentThatShowsFirstInsteadOfSecond.style.display = 'flex';
	alertBox.style.transition = 'all 0s ease-in-out';
	alertBox.style.height = theContentThatShowsFirstInsteadOfSecond.offsetHeight + "px";
	alertBox.style.animation = `${showAnimation} 0.5s ease-out forwards`;

	// Play sound effect
	if (playSounds) {
		const audio = new Audio('sfx/notification.mp3');
		audio.play();
	}

	// Add extra useful info to sbData
	if (!sbData)
		sbData = {};
	
	sbData.boxHeight1 = theContentThatShowsFirstInsteadOfSecond.offsetHeight;
	sbData.boxHeight2 = (message && showMesesages) ? theContentThatShowsLastInsteadOfFirst.offsetHeight : 0;
	sbData.alertDuration = hideAfter * 1000;

	console.log(sbData);

	// Run the Streamer.bot action if there is one
	if (globalShowAction) {
		console.debug('Running Streamer.bot action: ' + globalShowAction);
		client.doAction({name: globalShowAction}, sbData);
	}

	// Run the Streamer.bot action if there is one
	if (sbAction) {
		console.debug('Running Streamer.bot action: ' + sbAction);
		client.doAction({name: sbAction}, sbData);
	}

	// (1) Set timeout (8 seconds by default)
	// (2) Set the message label
	// (3) Calculate the height of message label
	// (4) Set the height of alertBox
	//		(a) Add in the CSS animation when this is working
	setTimeout(() => {
		alertBox.style.transition = 'all 0.5s ease-in-out';
		theContentThatShowsFirstInsteadOfSecond.style.opacity = 0;
		
		// For safety, if message doesn't exist, set it to empty string anyway
		if (!message)
			message = '';

		// If there is a message, show it in the second part of the animation
		// Else, just close the alert box and run the next alert
		if (message.trim().length > 0 && showMesesages) {
		
			//theContentThatShowsLastInsteadOfFirst.style.display = 'inline-block';
			theContentThatShowsLastInsteadOfFirst.style.visibility = 'visible';
			alertBox.style.height = theContentThatShowsLastInsteadOfFirst.offsetHeight + "px";
			theContentThatShowsLastInsteadOfFirst.style.opacity = 1;
			
			setTimeout(() => {
				// Run the Streamer.bot action if there is one
				if (globalHideAction) {
					console.debug('Running Streamer.bot action: ' + globalHideAction);
					client.doAction({name: globalHideAction}, sbData);
				}

				alertBox.style.animation = `${hideAnimation} 0.5s ease-out forwards`;
	
				setTimeout(() => {
					alertBox.style.height = '0px';
					theContentThatShowsFirstInsteadOfSecond.style.opacity = 1;
					theContentThatShowsLastInsteadOfFirst.style.opacity = 0;
					//theContentThatShowsLastInsteadOfFirst.style.display = 'none';
					theContentThatShowsLastInsteadOfFirst.style.visibility = 'hidden';
					widgetLocked = false;
					if (alertQueue.length > 0) {
						console.debug("Pulling next alert from the queue");
						let data = alertQueue.shift();
						UpdateAlertBox(data.platform, data.avatarURL, data.headerText, data.descriptionText, data.attributeText, data.username, data.message, data.sbAction, data.sbData);
					}
				}, 1000);
			}, hideAfter * 1000);	
		} else {
			// Run the Streamer.bot action if there is one
			if (globalHideAction) {
				console.debug('Running Streamer.bot action: ' + globalHideAction);
				client.doAction({name: globalHideAction}, sbData);
			}

			alertBox.style.animation = `${hideAnimation} 0.5s ease-out forwards`;

			setTimeout(() => {
				alertBox.style.height = '0px';
				
				theContentThatShowsFirstInsteadOfSecond.style.opacity = 1;
				theContentThatShowsLastInsteadOfFirst.style.opacity = 0;
				//theContentThatShowsLastInsteadOfFirst.style.display = 'none';
				theContentThatShowsLastInsteadOfFirst.style.visibility = 'hidden';
				widgetLocked = false;
				if (alertQueue.length > 0) {
					console.debug("Pulling next alert from the queue");
					let data = alertQueue.shift();
					UpdateAlertBox(data.platform, data.avatarURL, data.headerText, data.descriptionText, data.attributeText, data.username, data.message, data.sbAction, data.sbData);
				}
			}, 1000);
		}

	}, hideAfter * 1000);

}

function CalculateKickSubBadge(months) {
  if (!Array.isArray(kickSubBadges)) return null;

  // Filter for eligible badges, then get the one with the highest 'months'
  const badge = kickSubBadges
    .filter(b => b.months <= months)
    .sort((a, b) => b.months - a.months)[0];

  return badge?.badge_image?.src || `icons/badges/kick-subscriber.svg`;
}

////////////////////
// TEST FUNCTIONS //
////////////////////

async function testWidget()
{
	UpdateAlertBox(
		'twitch',
		await GetAvatar('InfernoMate', 'twitch'),
		`InfernoMate`,
		`hat mit Stufe 3 abonniert`,
		'',
		`InfernoMate`,
		`O-oooooooooo AAAAE-A-A-I-A-U- JO-oooooooooooo AAE-O-A-A-U-U-A- E-eee-ee-eee AAAAE-A-E-I-E-A-JO-ooo-oo-oo-oo EEEEO-A-AAA-AAAA`
		//``
	);
}


///////////////////////////////////
// STREAMER.BOT WEBSOCKET STATUS //
///////////////////////////////////

// This function sets the visibility of the Streamer.bot status label on the overlay
function SetConnectionStatus(connected) {
	let statusContainer = document.getElementById("statusContainer");
	if (connected) {
		statusContainer.style.background = "#2FB774";
		statusContainer.innerText = "Verbunden!";
		statusContainer.style.opacity = 1;
		setTimeout(() => {
			statusContainer.style.transition = "all 2s ease";
			statusContainer.style.opacity = 0;
		}, 10);
	}
	else {
		statusContainer.style.background = "#D12025";
		statusContainer.innerText = "Verbinden...";
		statusContainer.style.transition = "";
		statusContainer.style.opacity = 1;
	}
}