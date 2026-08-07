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

const sbAction = '';



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




//////////////////////
// HELPER FUNCTIONS //
//////////////////////





///////////////////////
// PAGE INTERACTIONS //
///////////////////////





///////////////////
// PAGE SETTINGS //
///////////////////